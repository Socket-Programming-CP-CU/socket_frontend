"use client";
import { useState, useRef, useEffect } from "react";

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
  onUpdateMessage: (messageId: number, newMessage: string) => void;
};

export default function ChatWindow({
  username,
  roomName,
  roomInfo,
  messages,
  onSendMessage,
  onUpdateMessage,
}: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState("");
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const text = messageInput.trim();
    if (text === "") return;
    onSendMessage(text);
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEditMessage = (msg: Message) => {
    const newText = prompt("Edit your message:", msg.text);
    if (newText && newText.trim() !== "") {
      onUpdateMessage(msg.message_id, newText.trim());
    }
  };

  const isChatActive = roomName !== null;

  return (
    <main className="flex-1 flex flex-col bg-gray-700">
      <header
        id="chat-header"
        className="bg-gray-800 p-4 border-b border-gray-600 shadow-md"
      >
        <h2 className="font-bold text-xl" id="chat-room-name">
          {isChatActive ? roomName : "Welcome!"}
        </h2>
        <p className="text-sm text-gray-400" id="chat-room-info">
          {isChatActive ? roomInfo : "Select a chat from the panel to begin."}
        </p>
      </header>

      <div
        id="chat-window"
        ref={chatWindowRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto"
      >
        {!isChatActive ? (
          <div className="flex justify-center text-gray-400">
            <p>Select a user or group from the sidebar to start chatting.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === username;

            return (
              <div
                key={index}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  onClick={() => (isMe ? handleEditMessage(msg) : undefined)}
                  className={`p-3 rounded-xl max-w-lg shadow ${
                    isMe
                      ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-500"
                      : "bg-gray-800 text-white"
                  } transition-colors`}
                  title={isMe ? "Click to edit" : ""}
                >
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
