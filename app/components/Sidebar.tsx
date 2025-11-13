// app/components/Sidebar.tsx
"use client";
import { useState } from "react";

// --- (ส่วนนี้ควรย้ายไปไฟล์ utils.ts หรือ types.ts) ---
const AVATAR_COLORS = [
  "bg-red-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
];

const getAvatar = (name: string, size: string = "w-10 h-10") => {
  const initial = name.charAt(0).toUpperCase();
  const color =
    AVATAR_COLORS[
      Math.abs(
        name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0)
      ) % AVATAR_COLORS.length
    ];
  return (
    <div
      className={`${size} rounded-full ${color} flex-shrink-0 flex items-center justify-center font-bold`}
    >
      {initial}
    </div>
  );
};

const getGroupAvatar = (name: string, size: string = "w-10 h-10") => {
  const initial = name.charAt(0) === "#" ? "#" : name.charAt(0).toUpperCase();
  return (
    <div
      className={`${size} rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center font-bold text-lg`}
    >
      {initial}
    </div>
  );
};

// Types (ควรย้ายไปไฟล์ types.ts)
type User = { id: string; name: string };
type Group = { id: string; name: string };
type JoinableGroup = { id: string; name: string; members: number };
// --- (จบส่วน utils) ---

type SidebarProps = {
  username: string;
  activePanel: string;
  privateChats: User[];
  myGroups: Group[];
  onlineUsers: User[];
  joinableGroups: JoinableGroup[];
  // Handlers
  onUserClick: (user: User) => void;
  onGroupClick: (group: Group) => void;
  onJoinGroup: (group: JoinableGroup) => void;
  onCreateGroup: (groupName: string) => void;
};

export default function Sidebar({
  username,
  activePanel,
  privateChats,
  myGroups,
  onlineUsers,
  joinableGroups,
  onUserClick,
  onGroupClick,
  onJoinGroup,
  onCreateGroup,
}: SidebarProps) {
  // State ภายในสำหรับช่อง Input "Create Group"
  const [newGroupName, setNewGroupName] = useState("");

  const handleCreateGroup = () => {
    if (newGroupName.trim() === "") return;
    onCreateGroup(newGroupName); // เรียกฟังก์ชันแม่
    setNewGroupName(""); // เคลียร์ช่อง input
  };

  return (
    <aside className="w-80 bg-gray-800 flex flex-col h-full shadow-md">
      <div
        id="list-panels-container"
        className="flex-1 flex flex-col overflow-y-auto"
      >
        {/* --- Panel 1: Private Chats (R7) --- */}
        {/* ใช้ className แบบมีเงื่อนไขเพื่อซ่อน/แสดง */}
        <div
          id="panel-private-chats"
          className={`list-panel flex-1 flex flex-col ${
            activePanel === "panel-private-chats" ? "" : "hidden"
          }`}
        >
          <header className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Private Chats</h2>
          </header>
          <div
            id="private-chats-list"
            className="flex-1 p-4 space-y-2 overflow-y-auto"
          >
            {privateChats.length === 0 ? (
              <p className="text-gray-400 text-center p-4">
                Click an online user to start a chat.
              </p>
            ) : (
              privateChats.map((user) => (
                <div
                  key={user.id}
                  onClick={() => onUserClick(user)}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-700 cursor-pointer space-x-3"
                >
                  {getAvatar(user.name)}
                  <span className="font-medium">{user.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- Panel 2: My Groups (R11) --- */}
        <div
          id="panel-groups"
          className={`list-panel flex-1 flex flex-col ${
            activePanel === "panel-groups" ? "" : "hidden"
          }`}
        >
          <header className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">My Groups</h2>
          </header>
          <div
            id="groups-list"
            className="flex-1 p-4 space-y-2 overflow-y-auto"
          >
            {myGroups.length === 0 ? (
              <p className="text-gray-400 text-center p-4">
                You haven't joined any groups. Go to Explore!
              </p>
            ) : (
              myGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => onGroupClick(group)}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-700 cursor-pointer space-x-3"
                >
                  {getGroupAvatar(group.name)}
                  <span className="font-medium">{group.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- Panel 3: Online Users (R4) --- */}
        <div
          id="panel-online-users"
          className={`list-panel flex-1 flex flex-col ${
            activePanel === "panel-online-users" ? "" : "hidden"
          }`}
        >
          <header className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Online Users</h2>
            <span id="online-user-count" className="text-sm text-gray-400">
              {onlineUsers.length} users
            </span>
          </header>
          <div
            id="online-users-list"
            className="flex-1 p-4 space-y-2 overflow-y-auto"
          >
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => onUserClick(user)}
                className="flex items-center p-2 rounded-lg hover:bg-gray-700 cursor-pointer space-x-3"
              >
                {getAvatar(user.name)}
                <span className="font-medium">{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- Panel 4: Explore Groups (R9, R10) --- */}
        <div
          id="panel-explore-groups"
          className={`list-panel flex-1 flex flex-col ${
            activePanel === "panel-explore-groups" ? "" : "hidden"
          }`}
        >
          <header className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Explore Groups</h2>
          </header>
          <div
            id="join-group-list"
            className="flex-1 p-4 space-y-3 overflow-y-auto"
          >
            {joinableGroups.map((group) => (
              <div
                key={group.id}
                className="flex justify-between items-center p-3 rounded-lg bg-gray-900"
              >
                <div className="flex items-center space-x-3">
                  {getGroupAvatar(group.name)}
                  <div>
                    <span className="font-medium">{group.name}</span>
                    <span className="text-sm text-gray-400 block">
                      {group.members} members
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onJoinGroup(group)}
                  className="join-btn text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- Panel 5: Create Group (R8) --- */}
        <div
          id="panel-create-group"
          className={`list-panel flex-1 flex flex-col ${
            activePanel === "panel-create-group" ? "" : "hidden"
          }`}
        >
          <header className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Create Group</h2>
          </header>
          <div className="p-6 space-y-4">
            <p className="text-gray-400">Create a new chat group (R8).</p>
            <input
              type="text"
              id="group-name-input"
              placeholder="Enter group name"
              className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button
              id="create-group-confirm-btn"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
              onClick={handleCreateGroup}
            >
              Create
            </button>
          </div>
        </div>
      </div>

      {/* User Name Display (Bottom) */}
      <div className="p-4 bg-gray-850 border-t border-gray-700">
        <p id="user-display-name" className="font-bold text-center">
          {username}
        </p>
      </div>
    </aside>
  );
}
