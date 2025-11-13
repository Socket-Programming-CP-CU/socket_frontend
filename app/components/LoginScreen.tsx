// app/components/LoginScreen.tsx
'use client';
import { useState } from 'react';

// 1. กำหนด Type ของ Prop ที่จะรับ
type LoginScreenProps = {
  onLogin: (username: string) => void;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  // 2. มี State ของตัวเองสำหรับจัดการ Input
  const [username, setUsername] = useState('');

  const handleJoin = () => {
    if (username.trim() === "") return;
    // 3. เรียก Prop ที่แม่ (page.tsx) ส่งมาให้
    onLogin(username); 
  };

  return (
    <div id="login-screen" className="...">
      {/* ... โค้ด HTML/JSX ของหน้า Login ทั้งหมด ... */}
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <buttononClick={handleJoin}>
        Connect
      </buttononClick=>
    </div>
  );
}