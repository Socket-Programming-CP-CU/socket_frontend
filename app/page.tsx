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
    body: {
      // <-- เพิ่ม "body"
      username: string;
      password?: string;
    };
  }) => {
    const socketUrl = "ws://43.209.69.50/ws";

    try {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.close();
      }
      socketRef.current = new WebSocket(socketUrl);
    } catch (error) {
      setLoginError("Failed to create Web Socket.");
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

      // [FIX 1] ตรวจสอบ Response status ให้ตรงกับ Backend (ok: bool)
      if (data.ok === false) {
        // <--- แก้ไขตรงนี้
        console.error("API Error:", data.error);
        if (data.command === "LOGIN" || data.command === "REGISTER") {
          setLoginError(data.error || "Login/Register failed.");
          // ไม่ต้อง close() เพราะอาจจะแค่พิมพ์รหัสผิด
        }
        // TODO: แสดง Error อื่นๆ แบบ Toast
        return; // หยุดทำงานถ้า ok: false
      }

      // ตรวจสอบ Command ที่ Server ส่งมา
      switch (data.command) {
        // --- ตอบกลับ Login/Register (กรณีสำเร็จ) ---
        case "LOGIN":
          if (data.ok === true) {
            setUsername(initialMessage.body.username); // <-- แก้ไขตรงนี้
            setIsLoggedIn(true);
            setLoginError("");
            startHealthCheck();
          }
          break;
        case "REGISTER":
          if (data.ok === true) {
            // ทำเหมือน LOGIN ทุกอย่าง
            setUsername(initialMessage.body.username);
            setIsLoggedIn(true);
            setLoginError("");
            startHealthCheck();
          }
          break;
        // --- Server Pushes (ตาม API Spec) ---
        case "PUBLISH_USERS": // (R4)
          setOnlineUsers(data.users); // (แก้ตามที่คุยกันรอบที่แล้ว)
          break;

        // [FIX 4] แก้ไขชื่อ Command ให้ตรงกับ publish.go
        case "PUBLISH_GROUPS":
          setMyGroups(data.groups.filter((g: Group) => g.is_member));
          setJoinableGroups(
            data.groups.filter(
              (g: Group) => !g.is_member && !g.is_direct // (แก้ตามที่คุยกันรอบที่แล้ว)
            )
          );
          break;

        // [FIX 5] แก้ไขชื่อ Command และ Field ให้ตรงกับ publish.go
        case "PUBLISH_CHATS":
          setMessages(data.messages); // Backend ส่ง "messages" ไม่ใช่ "chats"
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

  const handleLogin = (name: string, pass: string) => {
    connectAndSend({
      command: "LOGIN",
      body: {
        username: name,
        password: pass,
      },
    });
  };

  const handleRegister = (name: string, pass: string) => {
    connectAndSend({
      command: "REGISTER",
      body: {
        username: name,
        password: pass,
      },
    });
  };

  const handleSendMessage = (messageText: string) => {
    sendCommand({
      command: "CREATE_MESSAGE",
      body: {
        // <-- เพิ่ม body wrapper
        message: messageText,
      },
    });
  };

  const handleSelectGroup = (group: Group) => {
    setCurrentRoomId(group.group_id);
    setCurrentRoomName(group.group_name);
    setCurrentRoomInfo("Loading...");
    setMessages([]);

    sendCommand({
      command: "SELECT_GROUP",
      body: {
        // <-- เพิ่ม body wrapper
        group_id: group.group_id,
      },
    });
  };

  const handleJoinGroup = (group: Group) => {
    setCurrentRoomId(group.group_id);
    setCurrentRoomName(group.group_name);
    setCurrentRoomInfo("Joining...");
    setMessages([]);

    sendCommand({
      command: "JOIN_GROUP",
      body: {
        // <-- เพิ่ม body wrapper
        group_id: group.group_id,
        password: "", // TODO: ...
      },
    });

    // (หลังจาก Join สำเร็จ, Backend ควรจะส่ง PUBLISH_GROUPS และ PUBLISH_CHATS มาอัปเดตเอง)
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
      body: {
        // <-- เพิ่ม body wrapper
        group_name: groupName,
        is_private: isPrivate,
        password: password || "",
      },
    });
    // Server ควรจะส่ง PUBLISH_ALL_GROUPS มาอัปเดต list
    setActivePanel("panel-my-chats"); // สลับไปหน้า "My Groups"
  };

  // ▼▼▼ เพิ่มฟังก์ชันนี้เข้าไปใหม่ ▼▼▼
  const handleUserClick = (user: User) => {
    // R7: หาแชท DM ที่มีอยู่กับ user คนนี้
    const dmGroup = myGroups.find(
      (g) => g.is_direct && g.group_name === user.username
    );

    if (dmGroup) {
      // ถ้าเจอ ก็เปิดแชทนั้น
      handleSelectGroup(dmGroup);
    } else {
      // ถ้าไม่เจอ (เพราะ Backend ยังไม่ได้แก้ชื่อ "Direct Message")
      console.error(`Could not find existing DM group for: ${user.username}.`);
      alert(
        `Error: Cannot find DM chat for ${user.username}. (This requires a Backend fix to rename DM groups)`
      );
    }

    // สลับไปหน้าแชท
    setActivePanel("panel-my-chats");
  };
  // ▲▲▲ สิ้นสุดฟังก์ชันที่เพิ่มใหม่ ▲▲▲

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
        onUserClick={handleUserClick} // <-- แก้ไขตรงนี้
      />

      <ChatWindow
        username={username}
        roomName={currentRoomName}
        roomInfo={currentRoomInfo}
        // โค้ดที่แก้ไขแล้ว
        messages={messages.map((m) => {
          // [FIX] แปลง Go time string ให้อ่านได้
          // from: "2025-11-14 17:25:01.123 +0700 +07"
          // to:   "2025-11-14T17:25:01.123+0700"
          const parts = m.timestamp.split(" ");
          let parsableDate = new Date(); // Default to now if split fails
          if (parts.length >= 3) {
            const isoStr = `${parts[0]}T${parts[1]}${parts[2]}`;
            parsableDate = new Date(isoStr);
          } else {
            // Fallback for unexpected format
            parsableDate = new Date(m.timestamp);
          }
          return {
            // แปลงข้อมูลให้ตรงกับ Component
            sender: m.username,
            text: m.message,
            time: parsableDate.toLocaleTimeString("en-US", {
              // <-- Use the new date
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        })}
        onSendMessage={handleSendMessage} // (R6)
      />
    </div>
  );
}
