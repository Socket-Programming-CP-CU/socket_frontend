// app/components/NavBar.tsx
"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faUsers,
  faListUl,
  faCompass,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

type NavBarProps = {
  username: string; // รับ username มาเพื่อแสดง avatar
  onPanelChange: (panelId: string) => void; // ฟังก์ชันที่แม่ (page.tsx) ส่งมา
};

export default function NavBar({ username, onPanelChange }: NavBarProps) {
  // State ภายในเพื่อจัดการว่าปุ่มไหน active
  const [active, setActive] = useState("panel-private-chats"); // ค่าเริ่มต้น

  const handleClick = (panelId: string) => {
    setActive(panelId); // 1. อัปเดต State ภายใน (เพื่อให้ปุ่มไฮไลท์)
    onPanelChange(panelId); // 2. เรียกฟังก์ชันที่แม่ส่งมา (เพื่อบอก page.tsx)
  };

  return (
    <nav className="w-20 bg-gray-900 flex flex-col items-center py-4 space-y-4 shadow-lg">
      {/* ปุ่ม 1: Private Chats */}
      <button
        className={`nav-btn ${
          active === "panel-private-chats" ? "active" : ""
        }`}
        title="Private Chats (R7)"
        onClick={() => handleClick("panel-private-chats")}
      >
        <FontAwesomeIcon icon={faComments} />
      </button>

      {/* ปุ่ม 2: My Groups */}
      <button
        className={`nav-btn ${active === "panel-groups" ? "active" : ""}`}
        title="My Groups (R11)"
        onClick={() => handleClick("panel-groups")}
      >
        <FontAwesomeIcon icon={faUsers} />
      </button>

      {/* ปุ่ม 3: Online Users */}
      <button
        className={`nav-btn ${active === "panel-online-users" ? "active" : ""}`}
        title="Online Users (R4)"
        onClick={() => handleClick("panel-online-users")}
      >
        <FontAwesomeIcon icon={faListUl} />
      </button>

      {/* ปุ่ม 4: Explore Groups */}
      <button
        className={`nav-btn ${
          active === "panel-explore-groups" ? "active" : ""
        }`}
        title="Explore Groups (R9, R10)"
        onClick={() => handleClick("panel-explore-groups")}
      >
        <FontAwesomeIcon icon={faCompass} />
      </button>

      {/* ปุ่ม 5: Create Group */}
      <button
        className={`nav-btn ${active === "panel-create-group" ? "active" : ""}`}
        title="Create Group (R8)"
        onClick={() => handleClick("panel-create-group")}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      {/* User Avatar (Bottom) */}
      <div
        id="user-info"
        className="mt-auto p-2"
        title={`Logged in as: ${username}`}
      >
        {/*
          ดึงตรรกะมาจากฟังก์ชัน showChat() ใน JS เดิม
          ที่ตั้งค่า userAvatar.innerHTML
        */}
        <div
          id="user-avatar"
          className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center font-bold text-xl"
        >
          {username.charAt(0).toUpperCase()}
        </div>
      </div>
    </nav>
  );
}
