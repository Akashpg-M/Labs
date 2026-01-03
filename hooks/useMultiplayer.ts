import { useEffect, useState, useRef } from "react";
import { ref, onValue, set, onDisconnect, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/providers/AuthProvider";

// Define the shape of a player in the DB
export interface RemotePlayer {
  id: string;
  x: number;
  y: number;
  facing: 'left' | 'right' | 'up' | 'down';
  isMoving: boolean;
  username: string;
}

export function useMultiplayer(
  roomId: string,
  myPos: { x: number; y: number },
  myFacing: string,
  isMoving: boolean
):{ otherPlayers: RemotePlayer[] } {
  const { user } = useAuth();
  const [otherPlayers, setOtherPlayers] = useState<RemotePlayer[]>([]);
  
  // Throttle writes to avoid hitting DB limits (limit to 100ms)
  const lastUpdateRef = useRef(0);

  // 1. JOIN ROOM & HANDLE DISCONNECT
  useEffect(() => {
    if (!user) return;

    const myRef = ref(db, `active_sessions/${roomId}/${user.uid}`);

    // Set initial data
    set(myRef, {
      x: myPos.x,
      y: myPos.y,
      facing: myFacing,
      isMoving,
      username: user.displayName || "Anonymous",
      lastSeen: Date.now()
    });

    // Magic Line: If tab closes, remove me from DB
    onDisconnect(myRef).remove();

    // Cleanup when component unmounts
    return () => {
      remove(myRef);
    };
  }, [user, roomId]); // Run once on join

  // 2. SYNC MOVEMENT (SEND)
  useEffect(() => {
    if (!user) return;

    const now = Date.now();
    // Only write if 100ms passed OR status changed significantly
    if (now - lastUpdateRef.current > 100) {
      const myRef = ref(db, `active_sessions/${roomId}/${user.uid}`);
      set(myRef, {
        x: myPos.x,
        y: myPos.y,
        facing: myFacing,
        isMoving,
        username: user.displayName,
        lastSeen: now
      }).catch((err) => console.error("Sync failed", err));
      
      lastUpdateRef.current = now;
    }
  }, [myPos, myFacing, isMoving, user, roomId]);

  // 3. LISTEN TO OTHERS (RECEIVE)
  useEffect(() => {
    if (!user) return;

    const roomRef = ref(db, `active_sessions/${roomId}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setOtherPlayers([]);
        return;
      }

      // Convert Object { "uid1": {...}, "uid2": {...} } to Array [ {...}, {...} ]
      const playersArray = Object.keys(data)
        .filter((key) => key !== user.uid) // Remove MYSELF from the list
        .map((key) => ({
          id: key,
          ...data[key]
        }));

      setOtherPlayers(playersArray);
    });

    return () => unsubscribe();
  }, [user, roomId]);

  return { otherPlayers };
}