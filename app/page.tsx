"use client";
import { useState, useEffect, useRef } from "react";
import LoginScreen from "./components/LoginScreen";
import NavBar from "./components/NavBar";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

type User = {
  username: string;
  is_online: boolean;
};
type Group = {
  group_id: number;
  group_name: string;
  is_private: number;
  is_direct: number;
  is_member: number;
  have_message: number;
};
type Message = {
  message_id: number;
  message: string;
  username: string;
  timestamp: string;
};
type Member = {
  username: string;
  is_online: boolean;
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activePanel, setActivePanel] = useState("panel-private-chats");

  const [myDMs, setMyDMs] = useState<Group[]>([]);
  const [myRoomGroups, setMyRoomGroups] = useState<Group[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [joinableGroups, setJoinableGroups] = useState<Group[]>([]);

  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);
  const [currentRoomInfo, setCurrentRoomInfo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [_, setForceRender] = useState(0);

  const sendCommand = (payload: object) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      console.log("Sent:", payload);
    } else {
      console.error("Socket is not open or not connected.");
      setLoginError("Connection lost. Please refresh.");
      setIsLoggedIn(false);
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    }
  };

  const startHealthCheck = () => {
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }
    healthCheckIntervalRef.current = setInterval(() => {
      sendCommand({ command: "HEALTH" });
    }, 5000);
  };

  const connectAndSend = (initialMessage: {
    command: string;
    body: {
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
      sendCommand(initialMessage);
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

    socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error("Failed to parse JSON:", event.data);
        return;
      }

      console.log("Received:", data);

      if (data.ok === false) {
        console.error("API Error:", data.error);
        if (data.command === "LOGIN" || data.command === "REGISTER") {
          setLoginError(data.error || "Login/Register failed.");
        } else if (data.command === "JOIN_GROUP") {
          alert(`Failed to join group: ${data.error}`);
        }
        return;
      }
      switch (data.command) {
        case "LOGIN":
          if (data.ok === true) {
            setUsername(initialMessage.body.username);
            setIsLoggedIn(true);
            setLoginError("");
            startHealthCheck();
          }
          break;
        case "REGISTER":
          if (data.ok === true) {
            setUsername(initialMessage.body.username);
            setIsLoggedIn(true);
            setLoginError("");
            startHealthCheck();
          }
          break;
        case "PUBLISH_GROUPS":
          const allMyGroups = data.groups.filter(
            (g: Group) => g.is_member === 1
          );

          setMyDMs(
            allMyGroups.filter(
              (g: Group) => g.is_direct === 1 && g.have_message === 1
            )
          );
          setMyRoomGroups(allMyGroups.filter((g: Group) => g.is_direct === 0));

          setJoinableGroups(
            data.groups.filter(
              (g: Group) => g.is_member === 0 && g.is_direct === 0
            )
          );
          break;

        case "PUBLISH_CHATS":
          setMessages(data.messages);
          if (data.members) {
            setCurrentRoomInfo(
              `Members: ${data.members
                .map((m: Member) => m.username)
                .join(", ")}`
            );
          }
          break;
        case "PUBLISH_USERS":
          setOnlineUsers(data.users);
          break;

        case "ERROR":
          setLoginError(data.error);
          if (!isLoggedIn) socket.close();
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
        group_id: group.group_id,
      },
    });
  };

  const handleJoinGroup = (group: Group) => {
    let password = "";
    if (group.is_private === 1) {
      password = prompt(`Enter password for "${group.group_name}":`) || "";

      if (password === null) {
        return;
      }
    }

    setCurrentRoomId(group.group_id);
    setCurrentRoomName(group.group_name);
    setCurrentRoomInfo("Joining...");
    setMessages([]);

    sendCommand({
      command: "JOIN_GROUP",
      body: {
        group_id: group.group_id,
        password: password,
      },
    });

    setActivePanel("panel-my-chats");
  };

  const handleCreateGroup = (
    groupName: string,
    isPrivate: boolean,
    password: string
  ) => {
    sendCommand({
      command: "CREATE_GROUP",
      body: {
        group_name: groupName,
        is_private: isPrivate,
        password: password || "",
      },
    });
    setActivePanel("panel-my-chats");
  };

  const handleUserClick = (user: User) => {
    const dmGroup = myDMs.find(
      (g) => g.is_direct === 1 && g.group_name === user.username
    );

    if (dmGroup) {
      handleSelectGroup(dmGroup);
    } else {
      console.error(`Could not find existing DM group for: ${user.username}.`);
      alert(`Error: Cannot find DM chat for ${user.username}.`);
    }

    setActivePanel("panel-private-chats");
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        loginError={loginError}
      />
    );
  }
  const handleLeaveGroup = (groupId: number) => {
    if (!confirm("Are you sure you want to leave this group?")) {
      return;
    }

    sendCommand({
      command: "LEAVE_GROUP",
      body: {
        group_id: groupId,
      },
    });

    if (currentRoomId === groupId) {
      setCurrentRoomId(null);
      setCurrentRoomName(null);
      setCurrentRoomInfo(null);
      setMessages([]);
    }
  };

  const handleUpdateMessage = (messageId: number, newMessage: string) => {
    if (newMessage.trim() === "") return;

    sendCommand({
      command: "UPDATE_MESSAGE",
      body: {
        message_id: parseInt(String(messageId)),
        message: newMessage,
      },
    });
  };

  return (
    <div className="h-screen flex">
      <NavBar
        username={username}
        onPanelChange={(panelId) => {
          setActivePanel(panelId);
        }}
      />

      <Sidebar
        username={username}
        activePanel={activePanel}
        myDMs={myDMs}
        myGroups={myRoomGroups}
        onlineUsers={onlineUsers}
        joinableGroups={joinableGroups}
        onGroupClick={handleSelectGroup}
        onJoinGroup={handleJoinGroup}
        onCreateGroup={handleCreateGroup}
        onUserClick={handleUserClick}
        onLeaveGroup={handleLeaveGroup}
      />

      <ChatWindow
        username={username}
        roomName={currentRoomName}
        roomInfo={currentRoomInfo}
        messages={messages.map((m) => {
          const parts = m.timestamp.split(" ");
          let parsableDate = new Date();
          if (parts.length >= 3) {
            const isoStr = `${parts[0]}T${parts[1]}${parts[2]}`;
            parsableDate = new Date(isoStr);
          } else {
            parsableDate = new Date(m.timestamp);
          }

          return {
            message_id: m.message_id,
            sender: m.username,
            text: m.message,
            time: parsableDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        })}
        onSendMessage={handleSendMessage}
        onUpdateMessage={handleUpdateMessage}
      />
    </div>
  );
}
