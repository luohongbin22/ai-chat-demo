type SessionItem = {
  session_id: string
  title: string
  created_at: number
  updated_at: number
}

type SessionSidebarProps = {
  sessions: SessionItem[]
  activeSessionId: string
  onCreateSession: () => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
}

function SessionSidebar(
  {
    sessions,
    activeSessionId,
    onCreateSession,
    onSelectSession,
    onDeleteSession
  }: SessionSidebarProps) {
  return (
    <div
      style={{
        width: "280px",
        height: "100vh",
        background: "#f8fafc",
        borderRight: "1px solid #e5e7eb",
        padding: "16px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <style>
        {`
          .session-item .delete-btn {
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          .session-item:hover .delete-btn {
            opacity: 1;
          }

          .session-item:hover {
            background: #eff6ff !important;
          }
        `}
      </style>

      <button
        style={{
          width: "100%",
          height: "40px",
          border: "none",
          borderRadius: "10px",
          background: "#2563eb",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: "16px"
        }}
        onClick={onCreateSession}
      >
        + 新建会话
      </button>

      <div
        style={{
          fontSize: "13px",
          color: "#64748b",
          marginBottom: "8px",
          padding: "0 4px"
        }}
      >
        会话列表
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto"
        }}
      >
        {sessions.map((item) => {
          const isActive = item.session_id === activeSessionId

          return (
            <div
              key={item.session_id}
              className="session-item"
              onClick={() => onSelectSession(item.session_id)}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                marginBottom: "8px",
                background: isActive ? "#dbeafe" : "#ffffff",
                border: isActive ? "1px solid #93c5fd" : "1px solid #e5e7eb",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                transition: "background 0.2s ease, border 0.2s ease"
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: "14px",
                  color: isActive ? "#1d4ed8" : "#111827",
                  fontWeight: isActive ? 600 : 400,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis"
                }}
                title={item.title}
              >
                {item.title}
              </span>

              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteSession(item.session_id)
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "4px 6px"
                }}
              >
                删除
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SessionSidebar
