import { useEffect, useState, useRef } from "react";
import { ref, onValue, push, set, serverTimestamp, query, limitToLast } from "firebase/database";
import { db } from "@/lib/firebase";

export interface Message {
  id: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export function useChat(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);

  // 1. Subscribe to Messages
  useEffect(() => {
    if (!chatId) {
        setMessages([]);
        return;
    }

    const messagesRef = ref(db, `chats/${chatId}`);
    // Only load last 50 messages to save bandwidth
    const q = query(messagesRef, limitToLast(50));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const loadedMessages = Object.entries(data).map(([key, val]: any) => ({
        id: key,
        ...val,
      }));
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  // 2. Send Function
  const sendMessage = async (senderName: string, text: string) => {
    if (!chatId || !text.trim()) return;

    const messagesRef = ref(db, `chats/${chatId}`);
    const newMessageRef = push(messagesRef);
    
    await set(newMessageRef, {
      senderName,
      text,
      timestamp: serverTimestamp(),
    });
  };

  return { messages, sendMessage };
}