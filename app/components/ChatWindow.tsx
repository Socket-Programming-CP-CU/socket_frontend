// app/components/ChatWindow.tsx
"use client";
import { useState, useRef, useEffect } from "react";

// ▼▼▼ [แก้ไข] เพิ่ม id เข้าไปใน Type ▼▼▼
// ▼▼▼ [แก้ไข] เพิ่ม id เข้าไปใน Type ▼▼▼
type Message = {
  message_id: number;
  sender: string;
  text: string;
  time: string;
};

type ChatWindowProps = {
  username: string;
  roomName: string | null;
  roomInfo: string | null;
  messages: Message[];
  onSendMessage: (messageText: string) => void;
  onUpdateMessage: (messageId: number, newMessage: string) => void; // <-- [เพิ่มใหม่]
};

export default function ChatWindow({
  username,
  roomName,
  roomInfo,
  messages,
  onSendMessage,
  onUpdateMessage, // <-- [เพิ่มใหม่]
}: ChatWindowProps) {
  // State ภายในสำหรับกล่องพิมพ์
  const [messageInput, setMessageInput] = useState("");

  // สร้าง Ref เพื่ออ้างอิงไปยัง chat window
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom:
  // ทำงานทุกครั้งที่ messages (ที่รับมาจาก prop) เปลี่ยนแปลง
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const text = messageInput.trim();
    if (text === "") return;
    onSendMessage(text); // เรียกฟังก์ชันแม่ (page.tsx)
    setMessageInput(""); // เคลียร์ช่อง input
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // ส่งเมื่อกด Enter (ถ้าไม่กด Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ▼▼▼ [เพิ่มใหม่] Handler สำหรับการกด Edit ▼▼▼
  const handleEditMessage = (msg: Message) => {
    const newText = prompt("Edit your message:", msg.text);
    if (newText && newText.trim() !== "") {
      onUpdateMessage(msg.message_id, newText.trim()); // <--- ต้องเป็น msg.message_id
    }
  };
  // ▲▲▲ [จบส่วนเพิ่มใหม่] ▲▲▲

  // ตรวจสอบว่ามีห้องแชท active อยู่หรือไม่
  const isChatActive = roomName !== null;

  return (
    <main className="flex-1 flex flex-col bg-gray-700">
      {/* Chat Header */}
      <header
        id="chat-header"
        className="bg-gray-800 p-4 border-b border-gray-600 shadow-md"
      >
        <h2 className="font-bold text-xl" id="chat-room-name">
          {/* แสดงผลตามเงื่อนไขว่าเลือกห้องหรือยัง */}
          {isChatActive ? roomName : "Welcome!"}
        </h2>
        <p className="text-sm text-gray-400" id="chat-room-info">
          {isChatActive ? roomInfo : "Select a chat from the panel to begin."}
        </p>
      </header>

      {/* Chat Window (R6) */}
      <div
        id="chat-window"
        ref={chatWindowRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto"
      >
        {!isChatActive ? (
          // ถ้ายังไม่เลือกห้อง
          <div className="flex justify-center text-gray-400">
            <p>Select a user or group from the sidebar to start chatting.</p>
          </div>
        ) : (
          // ถ้าเลือกห้องแล้ว: Render ข้อความ
          messages.map((msg, index) => {
            const isMe = msg.sender === username; // เช็กว่าข้อความนี้เป็นของเราหรือไม่

            // นี่คือตรรกะจากฟังก์ชัน addMessageToWindow()
            return (
              <div
                key={index} // ใช้ index เป็น key ไม่ดีเท่าไหร่ แต่ msg.id อาจซ้ำหากมีการโหลดใหม่
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                {/* ▼▼▼ [แก้ไข] เพิ่ม onClick และ cursor-pointer ถ้าเป็นข้อความของเรา ▼▼▼ */}
                <div
                  onClick={() => (isMe ? handleEditMessage(msg) : undefined)}
                  className={`p-3 rounded-xl max-w-lg shadow ${
                    isMe
                      ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-500"
                      : "bg-gray-800 text-white"
                  } transition-colors`}
                  title={isMe ? "Click to edit" : ""}
                >
                  {/* ▲▲▲ [จบส่วนแก้ไข] ▲▲▲ */}

                  {/* แสดงชื่อผู้ส่ง ถ้าไม่ใช่เรา */}
                  {!isMe && (
                    <p className="font-bold text-sm text-blue-300">
                      {msg.sender}
                    </p>
                  )}

                  <p>{msg.text}</p>

                  <span className="text-xs text-gray-400 block text-right mt-1">
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Chat Input (R6) */}
      {/* แสดงกล่องพิมพ์ต่อเมื่อเลือกห้องแชทแล้วเท่านั้น */}
      {isChatActive && (
        <div id="chat-input-container" className="p-4 bg-gray-800 mt-auto">
          <div className="flex space-x-3">
            <input
              type="text"
              id="message-input"
              placeholder="Type your message..."
              className="flex-1 bg-gray-600 text-white p-3 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              id="send-button"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg transition-all duration-200 shadow-lg"
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
