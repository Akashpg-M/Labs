import React from "react";
import { motion } from "framer-motion";
import { GAME_CONFIG } from "@/lib/game-config";

interface PlayerProps {
  pos: { x: number; y: number };
  facing: 'left' | 'right' | 'up' | 'down';
  isMoving: boolean;
  username: string;
}

export default function Player({ pos, facing, isMoving, username }: PlayerProps) {
  
  // 1. Map directions to your specific files
  const spriteMap = {
    left: "/characters/student-left-removebg.png",
    right: "/characters/student-right-removebg.png",
    up: "/characters/student-up-removebg.png",     // Fallback to right if you lack this
    down: "/characters/student-down-removebg.png", // Fallback to left if you lack this
  };

  return (
    <motion.div
className="absolute flex flex-col items-center justify-center z-20 w-16 h-16 -ml-4 -mt-8"      animate={{ x: pos.x, y: pos.y }}
      transition={{ 
        type: "tween", 
        ease: "linear", 
        duration: isMoving ? 0.1 : 0 // Smooth interpolation when moving
      }}
      style={{
        zIndex: 20,
        // width: GAME_CONFIG.playerSize,   // e.g., 32px
        // height: GAME_CONFIG.playerSize,  // e.g., 32px
      }}
    >
      {/* 2. The Character Sprite */}
      <img 
        src={spriteMap[facing]} 
        alt="Player"
        className="w-16 h-16 object-contain pixelated" 
        // 'pixelated' ensures crisp edges for pixel art (add to global css if needed)
      />

      {/* 3. Username Label (Floating above head) */}
      <div className="absolute -top-6 bg-black/50 px-2 py-0.5 rounded text-[10px] text-white whitespace-nowrap backdrop-blur-sm">
        {username}
      </div>

    </motion.div>
  );
}