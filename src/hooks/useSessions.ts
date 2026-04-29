import {useEffect, useState} from "react";
import type {ChatItem, SessionItem} from "../types/chat.ts";
import {createSessionApi, deleteSessionApi, getSessionMessageApi, getSessionsListApi} from "../api/chatApi.ts";


/*
 管理：
    sessions
    activeSessionId
    chatMap
    会话增删查切换
    某个 session 的消息更新能力
   */
export function useSessions() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [activeSessionId, setActiveSessionId] = useState("")

  const [chatMap, setChatMap] = useState<Record<string, ChatItem[]>>({})
  const chatList = chatMap[activeSessionId] || []

  // 获取会话列表
  const fetchSessions = async (options?: { resetActive?: boolean }) => {
    try {
      const data = await getSessionsListApi()
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

  const fetchSessionMessages = async (sessionId: string) => {
    if (!sessionId) return
    try {
      const data = await getSessionMessageApi(sessionId)

      const messages = data.messages || []
      setChatMap((prev) => ({
        ...prev,
        [sessionId]: messages
      }))
    } catch (error) {
      console.error(error)
    }
  }

  // 调用创建会话接口
  const createRealSession = async () => {
    return await createSessionApi()
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
      await deleteSessionApi(sessionId)

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
  const insertEmptySessionMessages = (sessionId: string) => {
    setChatMap((prev) => ({
      ...prev,
      [sessionId]: []
    }))
  }

  useEffect(() => {
    fetchSessions({resetActive: true})
  }, [])
  return {
    sessions,
    setSessions,

    activeSessionId,
    setActiveSessionId,

    chatMap,
    setChatMap,
    chatList,

    updateSessionMessages,
    fetchSessions,
    fetchSessionMessages,
    createRealSession,
    handleCreateSession,
    handleSelectSession,
    handleDeleteSession,
    moveSessionToTop,
    insertEmptySessionMessages
  }
}
