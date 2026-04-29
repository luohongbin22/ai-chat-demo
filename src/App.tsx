import SessionSidebar from "./components/SessionSidebar";
import ChatWindow from "./components/ChatWindow.tsx";
import MessageInput from "./components/MessageInput.tsx";

import {useAutoScroll} from "./hooks/useAutoScroll.ts";
import {useSessions} from "./hooks/useSessions.ts";
import {useChatSend} from "./hooks/useChatSend.ts";
import {useState} from "react";


function App() {
  const [message, setMessage] = useState("")

  const {
    sessions,
    setSessions,
    activeSessionId,
    setActiveSessionId,
    chatMap,
    chatList,
    updateSessionMessages,
    fetchSessions,
    createRealSession,
    handleCreateSession,
    handleSelectSession,
    handleDeleteSession,
    moveSessionToTop,
    insertEmptySessionMessages
  } = useSessions()

  const {
    loading,
    handleSend,
    handleStop
  } = useChatSend({
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
  })

  // 聊天列表容器的 ref
  const chatBoxRef = useAutoScroll([chatList, loading])


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
