type ChatItem = {
  id?: number
  role: "user" | "assistant"
  content: string
  created_at?: number
}

type ChatWindowProps = {
  chatList: ChatItem[]
}

function ChatWindow({ chatList }: ChatWindowProps) {
  return (
    <div  style={{
      minHeight: "100%",
    }}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: "16px",
        }}
      >
        {chatList.map((item, index) => {
          const isUser = item.role === "user"

          return (
            <div
              key={item.id ?? `${item.role}-${index}`}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                marginTop: index === 0 ? 0 : 16
              }}
            >
              {/* AI 左侧头像 */}
              {!isUser && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#6366f1",
                    color: "#fff",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                    flexShrink: 0
                  }}
                >
                  AI
                </div>
              )}

              <div
                style={{
                  maxWidth: "65%",
                  padding: "12px 16px",
                  borderRadius: isUser
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                  background: isUser ? "#2563eb" : "#e2e8f0",
                  color: isUser ? "#fff" : "#0f172a",
                  fontSize: 14,
                  lineHeight: 1.6,
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap"
                }}
              >
                {item.content}
              </div>

              {/* 用户头像 */}
              {isUser && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#93c5fd",
                    color: "#1e3a8a",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 8,
                    flexShrink: 0
                  }}
                >
                  我
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChatWindow
