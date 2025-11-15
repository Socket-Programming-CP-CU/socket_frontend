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
  username: string;
  onPanelChange: (panelId: string) => void;
};

export default function NavBar({ username, onPanelChange }: NavBarProps) {
  const [active, setActive] = useState("panel-private-chats");

  const handleClick = (panelId: string) => {
    setActive(panelId);
    onPanelChange(panelId);
  };

  return (
    <nav className="w-20 bg-gray-900 flex flex-col items-center py-4 space-y-4 shadow-lg">
      <button
        className={`nav-btn ${
          active === "panel-private-chats" ? "active" : ""
        }`}
        title="My Chats (R7)"
        onClick={() => handleClick("panel-private-chats")}
      >
        <FontAwesomeIcon icon={faComments} />
      </button>

      <button
        className={`nav-btn ${active === "panel-groups" ? "active" : ""}`}
        title="My Chats (R11)"
        onClick={() => handleClick("panel-groups")}
      >
        <FontAwesomeIcon icon={faUsers} />
      </button>

      <button
        className={`nav-btn ${active === "panel-online-users" ? "active" : ""}`}
        title="Online Users (R4)"
        onClick={() => handleClick("panel-online-users")}
      >
        <FontAwesomeIcon icon={faListUl} />
      </button>

      <button
        className={`nav-btn ${
          active === "panel-explore-groups" ? "active" : ""
        }`}
        title="Explore Groups (R9, R10)"
        onClick={() => handleClick("panel-explore-groups")}
      >
        <FontAwesomeIcon icon={faCompass} />
      </button>

      <button
        className={`nav-btn ${active === "panel-create-group" ? "active" : ""}`}
        title="Create Group (R8)"
        onClick={() => handleClick("panel-create-group")}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <div
        id="user-info"
        className="mt-auto p-2"
        title={`Logged in as: ${username}`}
      >
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
