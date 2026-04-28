import * as React from "react"

type MessageInputProps = {
  message: string
  loading: boolean
  onMessageChange: (value: string) => void
  onSend: () => void
  onStop: () => void
}

function MessageInput({
                        message,
                        loading,
                        onMessageChange,
                        onSend,
                        onStop
                      }: MessageInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      onSend()
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        width: "100%"
      }}
    >
      <input
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入问题"
        style={{
          flex: 1,
          height: "42px",
          borderRadius: "12px",
          border: "none",
          outline: "none",
          padding: "0 14px",
          fontSize: "14px",
          background: "#fff",
          boxSizing: "border-box"
        }}
      />

      <button
        onClick={loading ? onStop : onSend}
        style={{
          width: "84px",
          height: "42px",
          borderRadius: "12px",
          border: "none",
          background: loading ? "#ef4444" : "#2563eb",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 600,
          flexShrink: 0
        }}
      >
        {loading ? "停止" : "发送"}
      </button>
    </div>
  )
}

export default MessageInput
