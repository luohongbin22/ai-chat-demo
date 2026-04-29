export type ChatItem = {
  id?: number
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
