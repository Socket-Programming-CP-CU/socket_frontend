"use client";
import { useState } from "react";

type LoginScreenProps = {
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string) => void;
  loginError: string;
};

export default function LoginScreen({
  onLogin,
  onRegister,
  loginError,
}: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username.trim() === "" || password.trim() === "") return;
    onLogin(username, password);
  };

  const handleRegister = () => {
    if (username.trim() === "" || password.trim() === "") return;
    onRegister(username, password);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div
      id="login-screen"
      className="min-h-screen flex items-center justify-center transition-opacity duration-500"
    >
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">Socket Chat (API Spec)</h1>
        <p className="text-gray-400 mb-6">Login or Register (R3 Updated)</p>
        <input
          type="text"
          id="username-input"
          placeholder="Username"
          className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <input
          type="password"
          id="password-input"
          placeholder="Password"
          className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div className="flex space-x-4">
          <button
            id="login-button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg transition-all duration-200 shadow-lg"
            onClick={handleLogin}
          >
            Login
          </button>
          <button
            id="register-button"
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold p-3 rounded-lg transition-all duration-200"
            onClick={handleRegister}
          >
            Register
          </button>
        </div>
        <p id="login-error" className="text-red-400 mt-4 h-6">
          {loginError}
        </p>
      </div>
    </div>
  );
}
