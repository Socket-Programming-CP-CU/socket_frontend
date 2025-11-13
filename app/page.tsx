"use client";
import { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen.tsx";
import NavBar from "./components/NavBar";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
// (Import FontAwesome Icons ที่นี่)

export default function Home() {
  // --- State หลัก ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [activePanel, setActivePanel] = useState("panel-private-chats"); // Panel เริ่มต้น

  // (State อื่นๆ เช่น list of users, list of groups, messages)

  // --- Socket.io (จะอยู่ที่นี่) ---
  useEffect(() => {
    // TODO: เชื่อมต่อ Socket.io
  }, []);

  // --- Handlers (ฟังก์ชันที่จะส่งให้ลูก) ---

  const handleLogin = (name: string) => {
    // TODO: socket.emit('join_request', name)
    setUsername(name);
    setIsLoggedIn(true);
  };

  const handleSendMessage = (message: string) => {
    // TODO: socket.emit('send_message', { room: ..., text: message })
  };

  // --- Render Logic ---
  if (!isLoggedIn) {
    // 1. ถ้ายังไม่ล็อกอิน: แสดงผลหน้า Login
    return <LoginScreen onLogin={handleLogin} />;
  }

  // 2. ถ้าล็อกอินแล้ว: แสดงผลหน้าแชท
  return (
    <div className="h-screen flex">
      {/* ส่งฟังก์ชัน "เปลี่ยน Panel" ให้ NavBar */}
      <NavBar onPanelChange={setActivePanel} />

      {/* ส่ง "Panel ที่กำลัง Active" ให้ Sidebar */}
      <Sidebar
        activePanel={activePanel}
        username={username}
        // TODO: ส่ง list ต่างๆ (users, groups) และ
        //       ฟังก์ชัน handler (onUserClick, onGroupClick)
      />

      {/* ส่ง "ข้อมูลห้องแชท" ให้ ChatWindow */}
      <ChatWindow
        // TODO: ส่ง roomName, roomInfo, messages
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
