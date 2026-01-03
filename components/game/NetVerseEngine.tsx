// "use client";

// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { GAME_CONFIG, STATIONS, GameStation, isTeacher } from "@/lib/game-config"; 

// // --- COMPONENTS ---
// import Player from "./Player";
// import Station from "./Station";
// import WorldMap from "./WorldMap";
// import StationModalManager from "./StationModalManager";
// import MiniMap from "@/components/hud/MiniMap";
// import ChatModal from "./ChatModal"; 
// import Teacher from "./Teacher"; 
// import TeacherDashboard from "@/components/hud/TeacherDashboard"; 

// import { RemotePlayer, useMultiplayer } from "@/hooks/useMultiplayer";
// import { useAuth } from "../providers/AuthProvider";

// // --- FIREBASE IMPORTS ---
// import { ref, set, onDisconnect } from "firebase/database";
// import { db } from "@/lib/firebase";
// import { Loader2 } from "lucide-react";

// export default function NetVerseEngine({ username }: { username: string }) {
  
//   const { user, loading } = useAuth(); // Get loading state
  
//   // RBAC Check using config function
//   const amITeacher = isTeacher(user?.email);

//   const getChatId = (uid1: string, uid2: string) => {
//     return [uid1, uid2].sort().join("_"); 
//   };

//   // --- 1. STATE ---
//   const [pos, setPos] = useState({ x: 1200, y: 1500 });
//   const [facing, setFacing] = useState<'left' | 'right' | 'up' | 'down'>('down');
//   const [isMoving, setIsMoving] = useState(false);
  
//   // Interaction State
//   const [activeStation, setActiveStation] = useState<GameStation | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   // Chat State
//   const [closestPlayer, setClosestPlayer] = useState<RemotePlayer | null>(null);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [currentChatId, setCurrentChatId] = useState<string>("");

//   // Multiplayer Hook
//   const { otherPlayers } = useMultiplayer("campus-lobby", pos, facing, isMoving);

//   // --- 2. TEACHER IDENTITY LOCK ---
//   useEffect(() => {
//     // Only run this if NOT loading and user is confirmed teacher
//     if (!loading && amITeacher && user) {
//         console.log("🎓 RBAC: Teacher Mode Activated for", user.email);
        
//         // Force Position to Desk
//         setPos({ x: 2100, y: 1350 }); 
//         setFacing("down");

//         // Broadcast Online Status
//         const statusRef = ref(db, "game_state/professor_status");
//         set(statusRef, "online");
//         onDisconnect(statusRef).set("offline");
//     }
//   }, [loading, amITeacher, user]);

//   // --- 3. GAME LOOP ---
//   useEffect(() => {
//     if (loading) return; // Don't run loop while loading

//     let animationFrameId: number;
//     const keysPressed = new Set<string>();

//     const handleKeyDown = (e: KeyboardEvent) => keysPressed.add(e.key);
//     const handleKeyUp = (e: KeyboardEvent) => keysPressed.delete(e.key);
//     const handleBlur = () => { keysPressed.clear(); setIsMoving(false); };

//     const gameLoop = () => {
//       if (isDialogOpen) return; 

//       // 🛑 RBAC MOVEMENT LOCK
//       if (amITeacher) {
//          setIsMoving(false); // Teachers cannot move
//       } else {
//           // Normal Student Movement
//           const moving = keysPressed.size > 0;
//           setIsMoving(moving);

//           setPos((prev) => {
//             let { x, y } = prev;
//             const speed = GAME_CONFIG.playerSpeed;
//             if (keysPressed.has("ArrowUp") || keysPressed.has("w")) { y -= speed; setFacing('up'); }
//             if (keysPressed.has("ArrowDown") || keysPressed.has("s")) { y += speed; setFacing('down'); }
//             if (keysPressed.has("ArrowLeft") || keysPressed.has("a")) { x -= speed; setFacing("left"); }
//             if (keysPressed.has("ArrowRight") || keysPressed.has("d")) { x += speed; setFacing("right"); }
//             return {
//               x: Math.max(GAME_CONFIG.playerSize, Math.min(x, GAME_CONFIG.mapWidth - GAME_CONFIG.playerSize)),
//               y: Math.max(GAME_CONFIG.playerSize, Math.min(y, GAME_CONFIG.mapHeight - GAME_CONFIG.playerSize)),
//             };
//           });
//       }

//       // Find Closest Player
//       let closest: RemotePlayer | null = null;
//       let minDist = 100; 
//       for (const p of otherPlayers) {
//         const dist = Math.hypot(p.x - pos.x, p.y - pos.y);
//         if (dist < minDist) { minDist = dist; closest = p; }
//       }
//       setClosestPlayer(closest);

//       // Chat Trigger
//       if (keysPressed.has("e") && closest && !isChatOpen && user) {
//         setCurrentChatId(getChatId(user.uid, closest.id));
//         setIsChatOpen(true);
//         keysPressed.delete("e"); 
//       }

//       // Station Logic
//       const nearby = STATIONS.find((s) => {
//         const dx = Math.abs(pos.x - s.x);
//         const dy = Math.abs(pos.y - s.y);
//         return dx < (s.interactionRadius || 80) && dy < (s.interactionRadius || 80); 
//       });
//       setActiveStation(nearby || null);

//       if (keysPressed.has("Enter") && nearby) {
//         setIsDialogOpen(true);
//         keysPressed.delete("Enter");
//       }

//       animationFrameId = requestAnimationFrame(gameLoop);
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("keyup", handleKeyUp);
//     window.addEventListener("blur", handleBlur);
//     animationFrameId = requestAnimationFrame(gameLoop);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("keyup", handleKeyUp);
//       window.removeEventListener("blur", handleBlur);
//       cancelAnimationFrame(animationFrameId);
//     };
//   }, [pos, isDialogOpen, isChatOpen, otherPlayers, user, amITeacher, loading]); 

//   // ✅ 4. LOADING SCREEN (Prevents Glitch)
//   if (loading) {
//     return (
//       <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white gap-4">
//         <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
//         <p className="text-zinc-400 text-sm animate-pulse">Authenticating Identity...</p>
//       </div>
//     );
//   }

//   // ✅ 5. MAIN RENDER
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-black overflow-hidden relative">
      
//       {/* HUD Layer */}
//       <div className="absolute top-4 left-4 z-50">
//         <h1 className="text-white font-bold text-xl tracking-widest">NETVERSE <span className="text-blue-500">LABS</span></h1>
//         <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
//           <div className={`w-2 h-2 rounded-full animate-pulse ${amITeacher ? 'bg-yellow-500' : 'bg-green-500'}`}/>
//           Logged in as {username} {amITeacher && <span className="text-yellow-400 font-bold">(PROFESSOR)</span>}
//         </div>
//       </div>

//       {/* Interaction Prompts */}
//       {closestPlayer && !isChatOpen && (
//         <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
//           <div className="bg-black/80 text-white px-4 py-2 rounded-full border border-white/20 shadow-blue-900/50 shadow-lg flex items-center gap-2">
//             <span className="bg-white text-black w-5 h-5 flex items-center justify-center rounded text-xs font-bold">E</span>
//             <span className="text-sm font-medium">Chat with {closestPlayer.username}</span>
//           </div>
//         </div>
//       )}

//       {activeStation && !isDialogOpen && (
//         <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
//           <div className="bg-black/90 text-white px-6 py-3 rounded-full border border-yellow-500/50 shadow-yellow-500/20 shadow-lg flex items-center gap-3">
//             <span className="bg-yellow-500 text-black w-6 h-6 flex items-center justify-center rounded text-xs font-bold">↵</span>
//             <span className="text-sm font-bold tracking-wide">
//               {activeStation.type === 'npc-teacher' ? "Talk to Professor" : `Open ${activeStation.label}`}
//             </span>
//           </div>
//         </div>
//       )}

//       <MiniMap playerPos={pos} />

//       {/* Game Viewport */}
//       <div 
//         className="relative overflow-hidden bg-slate-900 border-4 border-slate-800 rounded-xl shadow-2xl"
//         style={{ width: GAME_CONFIG.viewportWidth, height: GAME_CONFIG.viewportHeight }}
//       >
//         <motion.div
//           className="absolute origin-top-left"
//           animate={{
//             x: -pos.x + GAME_CONFIG.viewportWidth / 2,
//             y: -pos.y + GAME_CONFIG.viewportHeight / 2,
//           }}
//           transition={{ type: "tween", ease: "linear", duration: 0 }} 
//           style={{ width: GAME_CONFIG.mapWidth, height: GAME_CONFIG.mapHeight }}
//         >
//           <WorldMap />

//           {/* Other Players */}
//           {otherPlayers.map((p) => (
//             <Player 
//               key={p.id}
//               pos={{ x: p.x, y: p.y }}
//               facing={p.facing}
//               isMoving={p.isMoving}
//               username={p.username}
//             />
//           ))}

//           {/* Stations (Hide Professor NPC if I AM the professor) */}
//           {STATIONS.filter(s => s.type !== "npc-teacher").map((station) => (
//             <Station key={station.id} station={station} isActive={activeStation?.id === station.id} />
//           ))}

//           {/* Render Teacher NPC (Only if I am NOT the teacher) */}
//           {!amITeacher && STATIONS.filter(s => s.type === "npc-teacher").map(npc => (
//             <Teacher 
//                 key={npc.id}
//                 x={npc.x}
//                 y={npc.y}
//                 label={npc.label}
//                 status="online" 
//             />
//           ))}

//           {/* My Player */}
//           <Player pos={pos} facing={facing} username={username} isMoving={false} />

//         </motion.div>
//       </div>

//       <StationModalManager 
//         isOpen={isDialogOpen}
//         onClose={() => setIsDialogOpen(false)}
//         activeStation={activeStation}
//       />

//       {user && closestPlayer && (
//         <ChatModal 
//           isOpen={isChatOpen}
//           onClose={() => setIsChatOpen(false)}
//           chatId={currentChatId}
//           myUsername={username}
//           partnerName={closestPlayer ? closestPlayer.username : "Student"}
//         />
//       )}

//       {/* TEACHER DASHBOARD (Only visible if RBAC confirms teacher) */}
//       {amITeacher && <TeacherDashboard />}

//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GAME_CONFIG, STATIONS, GameStation, isTeacher } from "@/lib/game-config"; 

// --- COMPONENTS ---
import Player from "./Player";
import Station from "./Station";
import WorldMap from "./WorldMap";
import StationModalManager from "./StationModalManager";
import MiniMap from "@/components/hud/MiniMap";
import ChatModal from "./ChatModal"; 
import Teacher from "./Teacher"; 
import TeacherDashboard from "@/components/hud/TeacherDashboard"; 

import { RemotePlayer, useMultiplayer } from "@/hooks/useMultiplayer";
import { useAuth } from "../providers/AuthProvider";

// --- FIREBASE IMPORTS ---
import { ref, set, onDisconnect } from "firebase/database";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function NetVerseEngine({ username }: { username: string }) {
  
  const { user, loading } = useAuth();
  
  // RBAC Check
  const amITeacher = isTeacher(user?.email);

  const getChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join("_"); 
  };

  // --- 1. STATE ---
  // Initial position (Teachers spawn near desk, students at entrance)
  const [pos, setPos] = useState({ x: amITeacher ? 2100 : 1200, y: amITeacher ? 1350 : 1500 });
  const [facing, setFacing] = useState<'left' | 'right' | 'up' | 'down'>('down');
  const [isMoving, setIsMoving] = useState(false);
  
  // Interaction State
  const [activeStation, setActiveStation] = useState<GameStation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Chat State
  const [closestPlayer, setClosestPlayer] = useState<RemotePlayer | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>("");

  // Multiplayer Hook
  const { otherPlayers } = useMultiplayer("campus-lobby", pos, facing, isMoving);

  // --- 2. TEACHER STATUS BROADCAST (Modified) ---
  // We removed the code that forced position. Now we just broadcast status.
  useEffect(() => {
    if (!loading && amITeacher && user) {
        console.log("🎓 RBAC: Teacher Mode Activated for", user.email);
        
        // Broadcast Online Status
        const statusRef = ref(db, "game_state/professor_status");
        set(statusRef, "online");
        onDisconnect(statusRef).set("offline");
    }
  }, [loading, amITeacher, user]);

  // --- 3. GAME LOOP ---
  useEffect(() => {
    if (loading) return; 

    let animationFrameId: number;
    const keysPressed = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => keysPressed.add(e.key);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.delete(e.key);
    const handleBlur = () => { keysPressed.clear(); setIsMoving(false); };

    const gameLoop = () => {
      if (isDialogOpen) return; 

      // ✅ UNLOCKED MOVEMENT (Everyone can move now)
      const moving = keysPressed.size > 0;
      setIsMoving(moving);

      setPos((prev) => {
        let { x, y } = prev;
        const speed = GAME_CONFIG.playerSpeed; // You can make teachers faster here if you want: amITeacher ? 16 : 12
        if (keysPressed.has("ArrowUp") || keysPressed.has("w")) { y -= speed; setFacing('up'); }
        if (keysPressed.has("ArrowDown") || keysPressed.has("s")) { y += speed; setFacing('down'); }
        if (keysPressed.has("ArrowLeft") || keysPressed.has("a")) { x -= speed; setFacing("left"); }
        if (keysPressed.has("ArrowRight") || keysPressed.has("d")) { x += speed; setFacing("right"); }
        return {
          x: Math.max(GAME_CONFIG.playerSize, Math.min(x, GAME_CONFIG.mapWidth - GAME_CONFIG.playerSize)),
          y: Math.max(GAME_CONFIG.playerSize, Math.min(y, GAME_CONFIG.mapHeight - GAME_CONFIG.playerSize)),
        };
      });

      // Find Closest Player
      let closest: RemotePlayer | null = null;
      let minDist = 100; 
      for (const p of otherPlayers) {
        const dist = Math.hypot(p.x - pos.x, p.y - pos.y);
        if (dist < minDist) { minDist = dist; closest = p; }
      }
      setClosestPlayer(closest);

      // Chat Trigger
      if (keysPressed.has("e") && closest && !isChatOpen && user) {
        setCurrentChatId(getChatId(user.uid, closest.id));
        setIsChatOpen(true);
        keysPressed.delete("e"); 
      }

      // Station Logic
      const nearby = STATIONS.find((s) => {
        const dx = Math.abs(pos.x - s.x);
        const dy = Math.abs(pos.y - s.y);
        return dx < (s.interactionRadius || 80) && dy < (s.interactionRadius || 80); 
      });
      setActiveStation(nearby || null);

      if (keysPressed.has("Enter") && nearby) {
        setIsDialogOpen(true);
        keysPressed.delete("Enter");
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      cancelAnimationFrame(animationFrameId);
    };
  }, [pos, isDialogOpen, isChatOpen, otherPlayers, user, amITeacher, loading]); 

  // ✅ 4. LOADING SCREEN
  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-zinc-400 text-sm animate-pulse">Authenticating Identity...</p>
      </div>
    );
  }

  // ✅ 5. MAIN RENDER
  return (
    <div className="flex items-center justify-center min-h-screen bg-black overflow-hidden relative">
      
      {/* HUD Layer */}
      <div className="absolute top-4 left-4 z-50">
        <h1 className="text-white font-bold text-xl tracking-widest">NETVERSE <span className="text-blue-500">LABS</span></h1>
        <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
          <div className={`w-2 h-2 rounded-full animate-pulse ${amITeacher ? 'bg-yellow-500' : 'bg-green-500'}`}/>
          Logged in as {username} {amITeacher && <span className="text-yellow-400 font-bold">(PROFESSOR)</span>}
        </div>
      </div>

      {/* Interaction Prompts */}
      {closestPlayer && !isChatOpen && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-black/80 text-white px-4 py-2 rounded-full border border-white/20 shadow-blue-900/50 shadow-lg flex items-center gap-2">
            <span className="bg-white text-black w-5 h-5 flex items-center justify-center rounded text-xs font-bold">E</span>
            <span className="text-sm font-medium">Chat with {closestPlayer.username}</span>
          </div>
        </div>
      )}

      {activeStation && !isDialogOpen && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-black/90 text-white px-6 py-3 rounded-full border border-yellow-500/50 shadow-yellow-500/20 shadow-lg flex items-center gap-3">
            <span className="bg-yellow-500 text-black w-6 h-6 flex items-center justify-center rounded text-xs font-bold">↵</span>
            <span className="text-sm font-bold tracking-wide">
              {activeStation.type === 'npc-teacher' ? "Talk to Professor" : `Open ${activeStation.label}`}
            </span>
          </div>
        </div>
      )}

      <MiniMap playerPos={pos} />

      {/* Game Viewport */}
      <div 
        className="relative overflow-hidden bg-slate-900 border-4 border-slate-800 rounded-xl shadow-2xl"
        style={{ width: GAME_CONFIG.viewportWidth, height: GAME_CONFIG.viewportHeight }}
      >
        <motion.div
          className="absolute origin-top-left"
          animate={{
            x: -pos.x + GAME_CONFIG.viewportWidth / 2,
            y: -pos.y + GAME_CONFIG.viewportHeight / 2,
          }}
          transition={{ type: "tween", ease: "linear", duration: 0 }} 
          style={{ width: GAME_CONFIG.mapWidth, height: GAME_CONFIG.mapHeight }}
        >
          <WorldMap />

          {/* Other Players */}
          {otherPlayers.map((p) => (
            <Player 
              key={p.id}
              pos={{ x: p.x, y: p.y }}
              facing={p.facing}
              isMoving={p.isMoving}
              username={p.username}
            />
          ))}

          {/* Stations (Hide Professor NPC if I AM the professor) */}
          {STATIONS.filter(s => s.type !== "npc-teacher").map((station) => (
            <Station key={station.id} station={station} isActive={activeStation?.id === station.id} />
          ))}

          {/* Render Teacher NPC (Only if I am NOT the teacher) */}
          {!amITeacher && STATIONS.filter(s => s.type === "npc-teacher").map(npc => (
            <Teacher 
                key={npc.id}
                x={npc.x}
                y={npc.y}
                label={npc.label}
                status="online" 
            />
          ))}

          {/* My Player */}
          <Player pos={pos} facing={facing} username={username} isMoving={isMoving} />

        </motion.div>
      </div>

      <StationModalManager 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        activeStation={activeStation}
      />

      {user && closestPlayer && (
        <ChatModal 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          chatId={currentChatId}
          myUsername={username}
          partnerName={closestPlayer ? closestPlayer.username : "Student"}
        />
      )}

      {/* TEACHER DASHBOARD (Only visible if RBAC confirms teacher) */}
      {amITeacher && <TeacherDashboard />}

    </div>
  );
}