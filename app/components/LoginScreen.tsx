// app/components/LoginScreen.tsx
"use client";
import { useState } from "react";

type LoginScreenProps = {
  onLogin: (username: string) => void;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");

  const handleJoin = () => {
    if (username.trim() === "") return;
    onLogin(username);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // ส่งเมื่อกด Enter
    if (e.key === "Enter") {
      handleJoin();
    }
  };

  return (
    // นี่คือโค้ด HTML+Tailwind ที่หายไป
    <div
      id="login-screen"
      className="min-h-screen flex items-center justify-center transition-opacity duration-500"
    >
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">Socket Chat Project</h1>
        <p className="text-gray-400 mb-6">
          Enter a unique name to connect (R3).
        </p>
        <input
          type="text"
          id="username-input"
          placeholder="Your Unique Name"
          className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          id="join-button"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg transition-all duration-200 shadow-lg"
          onClick={handleJoin}
        >
          Connect
        </button>
      </div>
    </div>
  );
}
