// app/components/Sidebar.tsx
"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
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
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const color =
    AVATAR_COLORS[
      Math.abs(
        (name || "A")
          .split("")
          .reduce((acc, char) => char.charCodeAt(0) + acc, 0)
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
  const initial = name
    ? name.charAt(0) === "#"
      ? "#"
      : name.charAt(0).toUpperCase()
    : "G";
  return (
    <div
      className={`${size} rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center font-bold text-lg`}
    >
      {initial}
    </div>
  );
};

// Types (แก้ให้ตรงกับ API Spec)
type User = {
  username: string;
  is_online: boolean;
};
type Group = {
  group_id: number;
  group_name: string;
  is_private: number;
  is_direct: number;
  is_member: number; // สมมติว่า Backend ส่งมา
  have_message: number;
};
// --- (จบส่วน utils) ---

type SidebarProps = {
  username: string;
  activePanel: string;
  // privateChats: User[]; // API Spec ไม่มี private chat แยก
  myDMs: Group[];
  myGroups: Group[];
  onlineUsers: User[];
  joinableGroups: Group[]; // ใช้ Type เดียวกัน
  // Handlers
  onGroupClick: (group: Group) => void;
  onJoinGroup: (group: Group) => void;
  onCreateGroup: (
    groupName: string,
    isPrivate: boolean,
    password: string
  ) => void;
  onUserClick: (user: User) => void; // <-- แก้ไขจุดที่ 1
  onLeaveGroup: (groupId: number) => void;
};

export default function Sidebar({
  username,
  activePanel,
  // privateChats,
  myDMs,
  myGroups,
  onlineUsers,
  joinableGroups,
  onGroupClick,
  onJoinGroup,
  onCreateGroup,
  onUserClick, // <-- แก้ไขจุดที่ 2
  onLeaveGroup,
}: SidebarProps) {
  // State ภายในสำหรับช่อง Input "Create Group"
  const [newGroupName, setNewGroupName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [groupPassword, setGroupPassword] = useState("");

  const handleCreateGroup = () => {
    if (newGroupName.trim() === "") return;
    onCreateGroup(newGroupName, isPrivate, groupPassword); // เรียกฟังก์ชันแม่
    // เคลียร์ช่อง input
    setNewGroupName("");
    setIsPrivate(false);
    setGroupPassword("");
  };

  return (
    <aside className="w-80 bg-gray-800 flex flex-col h-full shadow-md">
      <div
        id="list-panels-container"
        className="flex-1 flex flex-col overflow-y-auto"
      >
        {/* --- Panel 1: My Chats (R7, R11) --- */}
        {/* API Spec รวม Private/Group ไว้ด้วยกัน */}
        {/* --- Panel 1: Private Chats (R7) --- */}
        <div
          id="panel-private-chats"
          className={`list-panel flex-1 flex flex-col ${
            activePanel === "panel-private-chats" ? "" : "hidden"
          }`}
        >
          <header className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Private Chats</h2>
          </header>
          <div id="my-dm-list" className="flex-1 p-4 space-y-2 overflow-y-auto">
            {myDMs.length === 0 ? (
              <p className="text-gray-400 text-center p-4">
                No private chats. Click a user to start one.
              </p>
            ) : (
              myDMs.map((group) => (
                <div
                  key={group.group_id}
                  onClick={() => onGroupClick(group)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    {getAvatar(group.group_name)}
                    <span className="font-medium">{group.group_name}</span>
                  </div>
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
            id="my-groups-list"
            className="flex-1 p-4 space-y-2 overflow-y-auto"
          >
            {myGroups.length === 0 ? (
              <p className="text-gray-400 text-center p-4">
                No groups yet. Go to Explore to join one.
              </p>
            ) : (
              myGroups.map((group) => (
                <div
                  key={group.group_id}
                  onClick={() => onGroupClick(group)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    {getGroupAvatar(group.group_name)}
                    <span className="font-medium">{group.group_name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ป้องกันไม่ให้ onGroupClick ทำงาน
                      onLeaveGroup(group.group_id);
                    }}
                    className="text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-300 transition-opacity"
                    title="Leave Group"
                  >
                    Leave
                  </button>
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
              {onlineUsers.length} users online
            </span>
          </header>
          <div
            id="online-users-list"
            className="flex-1 p-4 space-y-2 overflow-y-auto"
          >
            {onlineUsers.map((user) => (
              <div
                key={user.username}
                onClick={() => onUserClick(user)} // <-- แก้ไขจุดที่ 3 (เปิด)
                className="flex items-center p-2 rounded-lg space-x-3 hover:bg-gray-700 cursor-pointer" // <-- แก้ไขจุดที่ 3 (เพิ่ม style)
              >
                {getAvatar(user.username)}
                <span className="font-medium">{user.username}</span>
                <span
                  className={`text-sm ${
                    user.is_online ? "text-green-400" : "text-gray-500"
                  }`}
                >
                  {user.is_online ? "● Online" : "○ Offline"}
                </span>
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
                key={group.group_id}
                className="flex justify-between items-center p-3 rounded-lg bg-gray-900"
              >
                <div className="flex items-center space-x-3">
                  {getGroupAvatar(group.group_name)}
                  <div>
                    <span className="font-medium">{group.group_name}</span>

                    {/* ▼▼▼ เพิ่มส่วนนี้เข้าไป ▼▼▼ */}
                    {group.is_private === 1 && (
                      <FontAwesomeIcon
                        icon={faLock}
                        className="text-xs text-gray-400 ml-2"
                        title="Private Group"
                      />
                    )}
                    {/* ▲▲▲ สิ้นสุดส่วนที่เพิ่ม ▲▲▲ */}

                    {/* <span className="text-sm text-gray-400 block">
                      {group.members} members
                    </span> */}
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
            {/* --- ส่วนที่อัปเดต --- */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="group-is-private-input"
                className="w-4 h-4 rounded"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <label htmlFor="group-is-private-input">Private Group?</label>
            </div>
            <input
              type="password"
              id="group-password-input"
              placeholder="Group Password (optional)"
              className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={groupPassword}
              onChange={(e) => setGroupPassword(e.target.value)}
            />
            {/* --- จบส่วนที่อัปเดต --- */}
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
