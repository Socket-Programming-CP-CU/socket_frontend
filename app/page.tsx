// app/page.tsx
"use client";
import { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import NavBar from "./components/NavBar";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

// --- Types (ควรย้ายไปไฟล์ types.ts) ---
type User = { id: string; name: string };
type Group = { id: string; name: string };
type JoinableGroup = { id: string; name: string; members: number };
type Message = { sender: string; text: string; time: string };
// --- จบส่วน Types ---

export default function Home() {
  // --- State หลักของแอป ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [activePanel, setActivePanel] = useState("panel-private-chats");

  // --- State สำหรับเก็บข้อมูล (จำลอง) ---
  const [privateChats, setPrivateChats] = useState<User[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([
    { id: "g1", name: "#General" },
    { id: "g2", name: "#Project-Alpha" },
  ]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([
    { id: "u1", name: "Alice" },
    { id: "u2", name: "Bob" },
  ]);
  const [joinableGroups, setJoinableGroups] = useState<JoinableGroup[]>([
    { id: "g3", name: "#Random", members: 5 },
    { id: "g4", name: "#Gaming", members: 2 },
  ]);

  // --- State ของห้องแชทปัจจุบัน ---
  const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);
  const [currentRoomInfo, setCurrentRoomInfo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // --- TODO: Socket.io Logic (จะมาทำทีหลัง) ---
  useEffect(() => {
    // TODO: เชื่อมต่อ Socket.io ที่นี่
  }, [currentRoomName]);

  // --- Handlers (ฟังก์ชันที่จะส่งให้ลูกๆ) ---

  const handleLogin = (name: string) => {
    // TODO: socket.emit('join_request', name)
    setUsername(name);
    setIsLoggedIn(true);
  };

  const handleSendMessage = (messageText: string) => {
    const newMessage: Message = {
      sender: username, // เราคือผู้ส่ง
      text: messageText,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // TODO: socket.emit('send_message', { room: currentRoomName, message: newMessage });

    // Mock: แสดงข้อความของเราทันที
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleUserClick = (user: User) => {
    setCurrentRoomName(`Private: ${user.name}`);
    setCurrentRoomInfo("Online");
    setMessages([]); // เคลียร์ข้อความเก่า (TODO: ควรโหลดประวัติแชท)

    if (!privateChats.find((u) => u.id === user.id)) {
      setPrivateChats((prev) => [...prev, user]);
    }
  };

  const handleGroupClick = (group: Group) => {
    setCurrentRoomName(`Group: ${group.name}`);
    setCurrentRoomInfo("You are a member");
    setMessages([]); // เคลียร์ข้อความเก่า
  };

  const handleJoinGroup = (group: JoinableGroup) => {
    // TODO: socket.emit('join_group', group.name)
    setMyGroups((prev) => [...prev, { id: group.id, name: group.name }]);
    setJoinableGroups((prev) => prev.filter((g) => g.id !== group.id));
  };

  const handleCreateGroup = (groupName: string) => {
    // TODO: socket.emit('create_group', groupName)
    const newGroup = { id: "g" + Math.random(), name: groupName };
    setMyGroups((prev) => [...prev, newGroup]);
    setActivePanel("panel-groups"); // สลับไปหน้า "My Groups"
  };

  // --- Render Logic ---
  if (!isLoggedIn) {
    // 1. ถ้ายังไม่ล็อกอิน: แสดงผลหน้า Login
    return <LoginScreen onLogin={handleLogin} />;
  }

  // 2. ถ้าล็อกอินแล้ว: แสดงผลหน้าแชท
  return (
    <div className="h-screen flex">
      <NavBar username={username} onPanelChange={setActivePanel} />

      <Sidebar
        username={username}
        activePanel={activePanel}
        privateChats={privateChats}
        myGroups={myGroups}
        onlineUsers={onlineUsers}
        joinableGroups={joinableGroups}
        onUserClick={handleUserClick}
        onGroupClick={handleGroupClick}
        onJoinGroup={handleJoinGroup}
        onCreateGroup={handleCreateGroup}
      />

      <ChatWindow
        username={username}
        roomName={currentRoomName}
        roomInfo={currentRoomInfo}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
