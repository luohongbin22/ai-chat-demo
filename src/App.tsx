import {useEffect, useRef, useState} from 'react'
import {readStream} from "./utils/stream.ts";
import SessionSidebar from "./components/SessionSidebar";
import ChatWindow from "./components/ChatWindow.tsx";
import MessageInput from "./components/MessageInput.tsx";

type ChatItem = {
  id?: number
  role: "user" | "assistant"
  content: string
  created_at?: number
}
type SessionItem = {
  session_id: string
  title: string,
  created_at: number
  updated_at: number
}


function App() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [activeSessionId, setActiveSessionId] = useState("")

  const [chatMap, setChatMap] = useState<Record<string, ChatItem[]>>({})
  const [message, setMessage] = useState("")
  const chatList = chatMap[activeSessionId] || []
  const [loading, setLoading] = useState(false)
  // 流失请求中断
  const abortControllerRef = useRef<AbortController | null>(null)

  // 1. 聊天列表容器的 ref
  const chatBoxRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [chatList, loading])

  // 更新当前会话消息
  const updateSessionMessages = (
    sessionId: string,
    updater: (prev: ChatItem[]) => ChatItem[]
  ) => {
    setChatMap((prev) => ({
      ...prev,
      [sessionId]: updater(prev[sessionId] || [])
    }))
  }
  // 获取回话列表
  const fetchSessions = async (options?: { resetActive?: boolean }) => {
    try {
      const res = await fetch("https://ai-chat-backend-xkhp.onrender.com/session/list")
      if (!res.ok) {
        throw new Error("获取会话列表失败")
      }
      const data = await res.json()
      const sessionList: SessionItem[] = data.sessions || []
      setSessions(sessionList)
      if (options?.resetActive && sessionList.length > 0) {
        const firstSessionId = sessionList[0].session_id
        setActiveSessionId(firstSessionId)
        fetchSessionMessages(firstSessionId)
      }
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    fetchSessions({resetActive: true})
  }, [])

  const fetchSessionMessages = async (sessionId: string) => {
    if (!sessionId) return
    try {
      const res = await fetch(`https://ai-chat-backend-xkhp.onrender.com/session/${sessionId}/messages`)
      if (!res.ok) {
        throw new Error("获取会话消息失败")
      }
      const data = await res.json()
      const messages: ChatItem[] = data.messages || []
      setChatMap((prev) => ({
        ...prev,
        [sessionId]: messages
      }))
    } catch (error) {
      console.error(error)
    }
  }
  const createRealSession = async () => {
    const res = await fetch("https://ai-chat-backend-xkhp.onrender.com/session/create", {
      method: "POST"
    })

    if (!res.ok) {
      throw new Error("创建会话失败")
    }

    return await res.json()
  }

  // 新建会话
  const handleCreateSession = async () => {
    try {
      const newSession = await createRealSession()
      // 更新左边列表
      setSessions((prev) => [newSession, ...prev])
      // 切换到新会话
      setActiveSessionId(newSession.session_id)
      // 初始化空消息
      setChatMap((prev) => ({
        ...prev,
        [newSession.session_id]: []
      }))
    } catch (error) {
      console.error(error)
    }
  }
  // 选择会话
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId)

    if (!chatMap[sessionId]) {
      fetchSessionMessages(sessionId)
    }
  }
  // 删除会话
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("确定删除这个会话吗？")) return
    try {
      const res = await fetch(`https://ai-chat-backend-xkhp.onrender.com/session/${sessionId}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        throw new Error("删除会话失败")
      }
      // 更新左边列表
      const nextSessions = sessions.filter((item) => item.session_id !== sessionId)
      setSessions(nextSessions)
      // 初始化空消息
      setChatMap((prev) => {
        const newMap = {...prev}
        delete newMap[sessionId]
        return newMap
      })
      // 切换到新会话
      if (activeSessionId === sessionId) {
        if (nextSessions.length > 0) {
          const nextSessionId = nextSessions[0].session_id
          setActiveSessionId(nextSessionId)
          if (!chatMap[nextSessionId]) {
            fetchSessionMessages(nextSessionId)
          }
        } else {
          setActiveSessionId("")
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
  // 移动会话到顶部，可选更新标题
  const moveSessionToTop = (sessionId: string, newTitle?: string) => {
    setSessions((prev) => {
      const target = prev.find((item) => item.session_id === sessionId)
      if (!target) return prev

      const updated = {
        ...target,
        updated_at: Date.now(),
        ...(newTitle ? {title: newTitle} : {})
      }

      return [
        updated,
        ...prev.filter((item) => item.session_id !== sessionId)
      ]
    })
  }
  const isAbortRef = useRef(false)

  const handleStop = () => {
    isAbortRef.current = true
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setLoading(false)
  }
  const handleSend = async () => {
    if (!message.trim()) return
    let currentSessionId = activeSessionId

    if (!currentSessionId) {
      const realSession = await createRealSession()
      currentSessionId = realSession.session_id

      setSessions((prev) => [realSession, ...prev])
      setActiveSessionId(currentSessionId)

      setChatMap((prev) => ({
        ...prev,
        [currentSessionId]: []
      }))
    }
    const currentMessage = message
    const oldMessages = chatMap[currentSessionId] || []
    const isFirstMessage = oldMessages.length === 0
    moveSessionToTop(currentSessionId, isFirstMessage ? currentMessage.slice(0, 12) : undefined)

    const baseId = Date.now()
    const userMessage: ChatItem = {
      id: baseId,
      role: 'user',
      content: currentMessage
    }
    const assistantMessageId = baseId + 1

    const assistantPlaceholder: ChatItem = {
      id: assistantMessageId,
      role: 'assistant',
      content: '正在思考中...'
    }
    // 一次性先插入：用户消息 + AI占位消息
    updateSessionMessages(currentSessionId, (prev) => [
      ...prev,
      userMessage,
      assistantPlaceholder
    ])
    // 清空输入框
    setMessage("")
    setLoading(true)

    isAbortRef.current = false

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const res = await fetch("https://ai-chat-backend-xkhp.onrender.com/chat_stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          session_id: currentSessionId,
          message: currentMessage
        })
      })
      if (!res.ok) throw new Error("请求失败")

      await readStream(
        res,
        (data) => {
          if (data.content) {
            updateSessionMessages(currentSessionId, (prev) =>
              prev.map((item) =>
                item.id === assistantMessageId
                  ? {...item, content: data.content}
                  : item
              )
            )
          }
        },
        () => {
          fetchSessions({resetActive: false})
        },
        () => {
          if (isAbortRef.current) {
            updateSessionMessages(currentSessionId, (prev) =>
              prev.map((item) =>
                item.id === assistantMessageId
                  ? {...item, content: item.content === "正在思考中..." ? "已停止生成" : item.content}
                  : item
              )
            )
            return
          }
          updateSessionMessages(currentSessionId, (prev) =>
            prev.map((item) =>
              item.id === assistantMessageId
                ? {...item, content: "请求失败，请检查后端服务"}
                : item
            )
          )
        }
      )
    } finally {
      abortControllerRef.current = null
      setLoading(false)
    }
  }

  return (
    <div style={{display: "flex", height: "100vh"}}>
      <SessionSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onCreateSession={handleCreateSession}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />

      <main
        style={{
          flex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#f1f5f9",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            padding: "12px 28px",
            borderBottom: "1px solid #e5e7eb",
            background: "#fff"
          }}
        >
          <h1 style={{margin: 0, fontSize: "18px"}}>
            AI 聊天 Demo
          </h1>
        </div>

        <div
          ref={chatBoxRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "16px 28px 0"
          }}
        >
          <ChatWindow
            chatList={chatList}
          />
        </div>

        <div
          style={{
            padding: "12px 28px 18px"
          }}
        >
          <MessageInput
            message={message}
            loading={loading}
            onMessageChange={setMessage}
            onSend={handleSend}
            onStop={handleStop}
          />
        </div>
      </main>
    </div>
  )
}

export default App
