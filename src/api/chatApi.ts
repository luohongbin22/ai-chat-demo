import http from '../utils/http'

export type MessageItem = {
  role: "user" | "assistant"
  content: string
  created_at?: number
}

export type SessionItem = {
  session_id: string
  title: string
  created_at: number
  updated_at: number
}


export type GetSessionsListResult = {
  sessions: SessionItem[]
}

export type GetSessionMessagesResult = {
  messages: MessageItem[]
}

export type SendStreamMessageParams = {
  prompt: string
  sessionId: string
  signal: AbortSignal
}

// 获取会话
export function getSessionsListApi() {
  return http.get<GetSessionsListResult>('/session/list')
}

// 获取会话消息
export function getSessionMessageApi(sessionId: string) {
  return http.get<GetSessionMessagesResult>(`/session/${sessionId}/messages`)
}

//创建会话
export function createSessionApi() {
  return http.post<SessionItem>('/session/create')
}

// 删除会话
export function deleteSessionApi(sessionId: string) {
  return http.delete<SessionItem>(`/session/${sessionId}`)
}

//发送消息
export function sendMessageApi(params: SendStreamMessageParams) {
  return http.streamPost('/chat',
    {
      session_id: params.sessionId,
      prompt: params.prompt,
    },
    {
      signal: params.signal,
    }
  )
}
