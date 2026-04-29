import {useRef, useState} from "react"
import {sendMessageApi} from "../api/chatApi"
import {readStream} from "../utils/stream"
import type {ChatItem, SessionItem} from "../types/chat"
import * as React from "react";

type UseChatSendParams = {
  message: string
  setMessage: React.Dispatch<React.SetStateAction<string>>

  activeSessionId: string
  setActiveSessionId: React.Dispatch<React.SetStateAction<string>>

  chatMap: Record<string, ChatItem[]>

  setSessions: React.Dispatch<React.SetStateAction<SessionItem[]>>

  createRealSession: () => Promise<SessionItem>
  insertEmptySessionMessages: (sessionId: string) => void

  updateSessionMessages: (
    sessionId: string,
    updater: (prev: ChatItem[]) => ChatItem[]
  ) => void

  moveSessionToTop: (sessionId: string, newTitle?: string) => void
  fetchSessions: (options?: { resetActive?: boolean }) => Promise<void>
}

export function useChatSend(params: UseChatSendParams) {
  const {
    message,
    setMessage,
    activeSessionId,
    setActiveSessionId,
    chatMap,
    setSessions,
    createRealSession,
    insertEmptySessionMessages,
    updateSessionMessages,
    moveSessionToTop,
    fetchSessions
  } = params

  const [loading, setLoading] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const isAbortRef = useRef(false)

  const updateMessageById = (
    sessionId: string,
    messageId: number,
    patch: Partial<ChatItem>
  ) => {
    updateSessionMessages(sessionId, (prev) =>
      prev.map((item) =>
        item.id === messageId
          ? {...item, ...patch}
          : item
      )
    )
  }

  const updateAssistantContent = (
    sessionId: string,
    assistantMessageId: number,
    content: string
  ) => {
    updateMessageById(sessionId, assistantMessageId, {content})
  }

  const handleAssistantError = (
    sessionId: string,
    assistantMessageId: number
  ) => {
    if (isAbortRef.current) {
      updateSessionMessages(sessionId, (prev) =>
        prev.map((item) => {
          if (item.id !== assistantMessageId) return item

          return {
            ...item,
            content:
              item.content === "正在思考中..."
                ? "已停止生成"
                : item.content
          }
        })
      )
      return
    }

    updateAssistantContent(
      sessionId,
      assistantMessageId,
      "请求失败，请检查后端服务"
    )
  }

  const ensureSession = async () => {
    if (activeSessionId) {
      return activeSessionId
    }

    const realSession = await createRealSession()
    const sessionId = realSession.session_id

    setSessions((prev) => [realSession, ...prev])
    setActiveSessionId(sessionId)
    insertEmptySessionMessages(sessionId)

    return sessionId
  }

  const handleStop = () => {
    isAbortRef.current = true
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setLoading(false)
  }
  /*
  1. 校验输入
  2. 确保有 session
  3. 判断是不是第一条消息
  4. 插入用户消息和 AI 占位消息
  5. 清空输入框，进入 loading
  6. 发起流式请求
  7. 流式更新 AI 消息
  8. 完成后刷新会话列表
  9. 失败或停止时更新 AI 消息状态
  10. 最后关闭 loading
   */
  const handleSend = async () => {
    if (!message.trim() || loading) return

    const currentMessage = message
    const currentSessionId = await ensureSession()

    const oldMessages = chatMap[currentSessionId] || []
    const isFirstMessage = oldMessages.length === 0

    moveSessionToTop(
      currentSessionId,
      isFirstMessage ? currentMessage.slice(0, 12) : undefined
    )

    const baseId = Date.now()
    const userMessageId = baseId
    const assistantMessageId = baseId + 1

    updateSessionMessages(currentSessionId, (prev) => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content: currentMessage
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "正在思考中..."
      }
    ])

    setMessage("")
    setLoading(true)
    isAbortRef.current = false

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const res = await sendMessageApi({
        sessionId: currentSessionId,
        prompt: currentMessage,
        signal: controller.signal
      })

      await readStream(
        res,
        (data) => {
          if (data.content) {
            updateAssistantContent(
              currentSessionId,
              assistantMessageId,
              data.content
            )
          }
        },
        () => {
          fetchSessions({resetActive: false})
        },
        () => {
          handleAssistantError(currentSessionId, assistantMessageId)
        }
      )
    } catch (error) {
      console.error(error)
      handleAssistantError(currentSessionId, assistantMessageId)
    } finally {
      abortControllerRef.current = null
      setLoading(false)
    }
  }

  return {
    loading,
    handleSend,
    handleStop
  }
}
