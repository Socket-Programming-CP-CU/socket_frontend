// app/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import LoginScreen from "./components/LoginScreen";
import NavBar from "./components/NavBar";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

// --- Types (ตรงตาม API Spec) ---
type User = {
  username: string;
  is_online: boolean;
};
type Group = {
  group_id: number; // API ใช้ int
  group_name: string;
  is_private: boolean;
  is_direct: boolean;
  is_member: boolean; // *สมมติว่า backend เพิ่ม flag นี้มาให้*
};
type Message = {
  chat_id: number;
  message: string;
  username: string;
  timestamp: string;
};
type Member = {
  username: string;
  is_online: boolean;
};
// --- จบส่วน Types ---

export default function Home() {
  // --- State หลักของแอป ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activePanel, setActivePanel] = useState("panel-my-chats"); // เปลี่ยนค่าเริ่มต้น

  // --- State สำหรับเก็บข้อมูล (จาก Server) ---
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [joinableGroups, setJoinableGroups] = useState<Group[]>([]);

  // --- State ของห้องแชทปัจจุบัน ---
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);
  const [currentRoomInfo, setCurrentRoomInfo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]); // ตรงตาม PUBLISH_CHATS

  // --- WebSocket State ---
  const socketRef = useRef<WebSocket | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [_, setForceRender] = useState(0); // ตัวแปรสำหรับ re-render

  // --- WebSocket Logic ---

  // ฟังก์ชันกลางสำหรับส่ง JSON command
  const sendCommand = (payload: object) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      console.log("Sent:", payload); // Log สิ่งที่ส่ง
    } else {
      console.error("Socket is not open or not connected.");
      setLoginError("Connection lost. Please refresh.");
      setIsLoggedIn(false);
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    }
  };

  // เริ่ม Health Check (ตาม API)
  const startHealthCheck = () => {
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }
    healthCheckIntervalRef.current = setInterval(() => {
      sendCommand({ command: "HEALTH" });
    }, 5000);
  };

  // ฟังก์ชันเชื่อมต่อ WebSocket
  // -----------  ▼▼▼ นี่คือจุดที่แก้ไข ▼▼▼ -----------
  const connectAndSend = (initialMessage: {
    command: string;
    username: string;
    password?: string;
  }) => {
    // -----------  ▲▲▲ นี่คือจุดที่แก้ไข ▲▲▲ -----------

    // TODO: เปลี่ยน URL นี้เป็น ws://... ของ Server เพื่อนคุณ
    const socketUrl = "ws://localhost:12345"; // ใช้พอร์ต 12345 ตาม API Spec

    try {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.close();
      }
      socketRef.current = new WebSocket(socketUrl);
    } catch (error) {
      setLoginError("Failed to create WebSocket.");
      return;
    }

    const socket = socketRef.current;

    socket.onopen = () => {
      console.log("WebSocket connected!");
      setLoginError("Connecting...");
      sendCommand(initialMessage); // ส่ง LOGIN หรือ REGISTER
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected.");
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
      if (isLoggedIn) {
        setLoginError("Connection lost. Please refresh.");
        setIsLoggedIn(false);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setLoginError("Connection error.");
    };

    // --- นี่คือหัวใจหลัก: ตัวรับข้อความจาก Server ---
    socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error("Failed to parse JSON:", event.data);
        return;
      }

      console.log("Received:", data); // Log ทุกอย่างที่ Server ส่งมา

      // --- ตัวจ่ายงาน (Dispatcher) ---

      // ตรวจสอบ Response status (ตาม API Spec)
      if (data.status && data.status !== 200) {
        console.error("API Error:", data.error);
        if (data.command === "LOGIN" || data.command === "REGISTER") {
          setLoginError(data.error || "Login/Register failed.");
          socket.close();
        }
        // TODO: แสดง Error อื่นๆ แบบ Toast
        return;
      }

      // ตรวจสอบ Command ที่ Server ส่งมา
      switch (data.command) {
        // --- ตอบกลับ Login/Register (กรณีสำเร็จ) ---
        // (เราต้องสมมติชื่อ command ที่ backend ส่งมา)
        // ผมจะเดาว่า command ที่ส่งมาคือ command ที่เราร้องขอไป
        case "LOGIN":
          if (data.status === 200) {
            setUsername(initialMessage.username);
            setIsLoggedIn(true);
            setLoginError("");
            startHealthCheck();
          }
          break;
        case "REGISTER":
          if (data.status === 200) {
            setLoginError("Register success! Please login.");
            socket.close();
          }
          break;

        // --- Server Pushes (ตาม API Spec) ---
        case "PUBLISH_USERS": // (R4)
          setOnlineUsers(
            data.users.filter(
              (u: User) => u.username !== initialMessage.username
            )
          );
          break;

        case "PUBLISH_ALL_GROUPS": // (R9)
          // *ต้องให้ Backend เพิ่ม is_member: boolean ใน groups array*
          // ถ้า Backend ไม่มี is_member ให้แก้ Logic ตรงนี้
          setMyGroups(data.groups.filter((g: Group) => g.is_member));
          setJoinableGroups(
            data.groups.filter(
              (g: Group) => !g.is_private && !g.is_member && !g.is_direct
            )
          );
          break;

        case "PUBLISH_CURRENT_CHAT": // (R6)
          setMessages(data.chats);
          // อัปเดตข้อมูล members (ถ้ามี)
          if (data.members) {
            setCurrentRoomInfo(
              `Members: ${data.members
                .map((m: Member) => m.username)
                .join(", ")}`
            );
          }
          break;

        // --- ตอบกลับ Error (อีกรูปแบบ) ---
        case "ERROR": // สมมติว่ามี command นี้
          setLoginError(data.error);
          if (!isLoggedIn) socket.close(); // ปิดถ้า login ไม่ผ่าน
          break;
      }
    };
  };

  // --- Handlers (ที่จะส่งให้ลูกๆ) ---

  const handleLogin = (name: string, pass: string) => {
    connectAndSend({
      command: "LOGIN",
      username: name,
      password: pass,
    });
  };

  const handleRegister = (name: string, pass: string) => {
    connectAndSend({
      command: "REGISTER",
      username: name,
      password: pass,
    });
  };

  const handleSendMessage = (messageText: string) => {
    // R6: CREATE_MESSAGE
    sendCommand({
      command: "CREATE_MESSAGE",
      message: messageText,
    });
    // ไม่ต้อง setMessages เอง รอ Server ส่ง PUBLISH_CURRENT_CHAT กลับมา
  };

  const handleSelectGroup = (group: Group) => {
    // R5: SELECT_GROUP
    setCurrentRoomId(group.group_id);
    setCurrentRoomName(group.group_name);
    setCurrentRoomInfo("Loading...");
    setMessages([]); // เคลียร์ข้อความเก่า

    sendCommand({
      command: "SELECT_GROUP",
      group_id: group.group_id,
    });
  };

  const handleJoinGroup = (group: Group) => {
    // R10: API ของคุณไม่มี "Join"
    // ผมจึงสมมติว่าการ "Select" กลุ่มที่เรายังไม่อยู่ = "Join"
    setCurrentRoomId(group.group_id);
    setCurrentRoomName(group.group_name);
    setCurrentRoomInfo("Joining...");
    setMessages([]);

    sendCommand({
      command: "SELECT_GROUP",
      group_id: group.group_id,
    });
    // Server ควรจะส่ง PUBLISH_ALL_GROUPS มาอัปเดต list
    setActivePanel("panel-my-chats"); // สลับกลับมาหน้าแชท
  };

  const handleCreateGroup = (
    groupName: string,
    isPrivate: boolean,
    password: string
  ) => {
    // R8: CREATE_GROUP
    sendCommand({
      command: "CREATE_GROUP",
      group_name: groupName,
      is_private: isPrivate,
      password: password || "", // ส่ง "" ถ้า password ว่าง
    });
    // Server ควรจะส่ง PUBLISH_ALL_GROUPS มาอัปเดต list
    setActivePanel("panel-my-chats"); // สลับไปหน้า "My Groups"
  };

  // --- Render Logic ---
  if (!isLoggedIn) {
    // 1. ถ้ายังไม่ล็อกอิน
    return (
      <LoginScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        loginError={loginError}
      />
    );
  }

  // 2. ถ้าล็อกอินแล้ว
  return (
    <div className="h-screen flex">
      <NavBar
        username={username}
        onPanelChange={(panelId) => {
          setActivePanel(panelId);
          // ถ้ากดสลับ Panel ให้เคลียร์ห้องที่เลือกไว้
          // setCurrentRoomId(null);
          // setCurrentRoomName(null);
          // setCurrentRoomInfo(null);
          // setMessages([]);
        }}
      />

      <Sidebar
        username={username}
        activePanel={activePanel}
        // privateChats={[]} // API Spec ไม่มี Private Chat (R7) โดยตรง
        myGroups={myGroups} // (R11)
        onlineUsers={onlineUsers} // (R4)
        joinableGroups={joinableGroups} // (R9)
        onGroupClick={handleSelectGroup} // (R5)
        onJoinGroup={handleJoinGroup} // (R10)
        onCreateGroup={handleCreateGroup} // (R8)
        // onUserClick={() => {}} // API Spec ไม่มี R7
      />

      <ChatWindow
        username={username}
        roomName={currentRoomName}
        roomInfo={currentRoomInfo}
        messages={messages.map((m) => ({
          // แปลงข้อมูลให้ตรงกับ Component
          sender: m.username,
          text: m.message,
          time: new Date(m.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }))}
        onSendMessage={handleSendMessage} // (R6)
      />
    </div>
  );
}
