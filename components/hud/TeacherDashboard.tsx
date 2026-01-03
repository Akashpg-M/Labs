"use client";

import React, { useState, useEffect } from "react";
import { User, MessageSquareReply, X, Send } from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Doubt {
  id: string;
  studentName: string;
  text: string;
  timestamp: number;
  status: "pending" | "resolved";
  answer?: string; // New field
}

export default function TeacherDashboard() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  
  // Reply State
  const [replyText, setReplyText] = useState("");
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);

  useEffect(() => {
    // Listen to ALL doubts
    const doubtsRef = ref(db, "doubts");
    const unsubscribe = onValue(doubtsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data)
          .map(([key, val]: [string, any]) => ({ id: key, ...val }))
          // Sort: Pending first, then by time
          .sort((a: any, b: any) => b.timestamp - a.timestamp); 
        setDoubts(list);
      } else {
        setDoubts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleReply = async () => {
    if (!selectedDoubt || !replyText.trim()) return;

    try {
      // Update Firebase instead of removing
      const doubtRef = ref(db, `doubts/${selectedDoubt.id}`);
      await update(doubtRef, {
        status: "resolved",
        answer: replyText,
        resolvedAt: Date.now()
      });

      toast.success(`Replied to ${selectedDoubt.studentName}!`);
      setReplyText("");
      setSelectedDoubt(null);
    } catch (err: any) {
      toast.error("Failed to send reply");
    }
  };

  return (
    <>
      <div className="absolute right-4 top-20 w-80 bg-zinc-900/95 border border-yellow-500/30 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col max-h-[70vh] z-50">
        <div className="bg-yellow-600/20 p-4 border-b border-yellow-500/20 flex justify-between items-center">
          <h3 className="text-yellow-400 font-bold flex items-center gap-2">
            <User className="w-4 h-4" /> Professor Dashboard
          </h3>
          <span className="text-[10px] bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded-full border border-yellow-500/30">
            {doubts.filter(d => d.status === 'pending').length} Pending
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {doubts.length === 0 ? (
            <div className="text-zinc-500 text-xs text-center py-8 italic">No active doubts.</div>
          ) : (
            doubts.map((doubt) => (
              <div 
                key={doubt.id} 
                className={`p-3 rounded-lg border transition-all ${
                  doubt.status === 'resolved' 
                    ? "bg-zinc-900/50 border-zinc-800 opacity-60" 
                    : "bg-black/40 border-yellow-500/30 hover:border-yellow-500/50"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold ${doubt.status === 'resolved' ? 'text-zinc-500' : 'text-blue-400'}`}>
                    {doubt.studentName}
                  </span>
                  <span className="text-zinc-600 text-[10px]">
                     {new Date(doubt.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </span>
                </div>
                
                <p className="text-zinc-300 text-sm mb-3 leading-relaxed">"{doubt.text}"</p>
                
                {doubt.status === 'resolved' && doubt.answer && (
                   <div className="mb-2 pl-2 border-l-2 border-green-500/50 text-xs text-green-400/80">
                      You: {doubt.answer}
                   </div>
                )}

                {doubt.status === 'pending' && (
                  <Button 
                    onClick={() => setSelectedDoubt(doubt)}
                    className="w-full h-7 text-xs bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 border border-yellow-600/30"
                  >
                    <MessageSquareReply className="w-3 h-3 mr-1" /> Reply
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reply Dialog */}
      <Dialog open={!!selectedDoubt} onOpenChange={(open) => !open && setSelectedDoubt(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 flex items-center gap-2">
               <MessageSquareReply className="w-5 h-5"/> Reply to Student
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-black/40 p-3 rounded text-sm text-zinc-400 border border-zinc-800">
               <span className="text-xs text-zinc-500 uppercase font-bold block mb-1">Question from {selectedDoubt?.studentName}:</span>
               "{selectedDoubt?.text}"
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-zinc-300 uppercase">Your Answer</label>
               <textarea 
                  className="w-full h-32 bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Type your explanation here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
               />
            </div>

            <div className="flex justify-end gap-2">
               <Button variant="ghost" onClick={() => setSelectedDoubt(null)} className="text-zinc-400">Cancel</Button>
               <Button 
                 onClick={handleReply} 
                 className="bg-yellow-600 hover:bg-yellow-500 text-white"
                 disabled={!replyText.trim()}
               >
                 <Send className="w-4 h-4 mr-2"/> Send Reply
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}