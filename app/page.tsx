"use client";

import { useState } from "react";
import LobbyScreen from "@/components/landing/LobbyScreen";
import NetVerseEngine from "@/components/game/NetVerseEngine";

export default function Home() {
  const [isGameActive, setIsGameActive] = useState(false);
  const [userData, setUserData] = useState({ name: "Student", role: "student" });

  const handleJoin = (name: string, role: string) => {
    setUserData({ name, role });
    setIsGameActive(true); // <--- Triggers the screen swap
  };

  return (
    <main className="min-h-screen bg-black">
      {!isGameActive ? (
        <LobbyScreen onJoin={handleJoin} />
      ) : (
        // Pass the captured name to the engine
        <NetVerseEngine username={userData.name} />
      )}
    </main>
  );
}