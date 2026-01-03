import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send } from "lucide-react";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  myUsername: string;
  partnerName: string;
}

export default function ChatModal({ isOpen, onClose, chatId, myUsername, partnerName }: ChatModalProps) {
  const { messages, sendMessage } = useChat(chatId);
  const [inputText, setInputText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = () => {
    sendMessage(myUsername, inputText);
    setInputText("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col h-96 animate-in slide-in-from-right-10">
      
      {/* Header */}
      <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
           <span className="font-bold text-white text-sm">Chat with {partnerName}</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
        {messages.map((msg) => {
          const isMe = msg.senderName === myUsername;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
               <span className="text-[10px] text-slate-500 mb-0.5">{msg.senderName}</span>
               <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] break-words ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-700 text-slate-200 rounded-bl-none"}`}>
                 {msg.text}
               </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
        <Input 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="bg-slate-900 border-slate-600 text-white h-9 text-xs"
        />
        <Button size="icon" onClick={handleSend} className="h-9 w-9 bg-blue-600 hover:bg-blue-500">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}