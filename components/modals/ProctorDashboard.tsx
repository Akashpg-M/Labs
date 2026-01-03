"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Grid, Maximize2, AlertTriangle, CheckCircle } from "lucide-react";

interface ProctorDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

// MOCK DATA: Using your actual uploaded assets as placeholders
const STUDENTS = [
  { id: "S-101", name: "Alice M.", status: "coding", img: "/screenshots/NodeLabs-1.png", warning: false },
  { id: "S-102", name: "Bob D.", status: "idle", img: "/screenshots/NodeLabs-2.png", warning: true },
  { id: "S-103", name: "Charlie", status: "coding", img: "/screenshots/sandbox-1.png", warning: false },
  { id: "S-104", name: "Dave K.", status: "coding", img: "/screenshots/sandbox-2.png", warning: false },
  { id: "S-105", name: "Eve P.", status: "coding", img: "/screenshots/sandbox-3.png", warning: false },
  { id: "S-106", name: "Frank", status: "offline", img: "/screenshots/sandbox-4.png", warning: true },
];

export default function ProctorDashboard({ isOpen, onClose }: ProctorDashboardProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[90vw] h-[85vh] bg-slate-950 border-slate-800 text-white flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Grid className="text-purple-400" />
            <DialogTitle className="text-sm font-mono text-zinc-300 font-normal">
                <div className="text-xl font-bold">Proctor Surveillance Grid</div>
            </DialogTitle>
            <span className="bg-red-900/50 text-red-400 text-xs px-2 py-0.5 rounded border border-red-800 animate-pulse">
              LIVE FEED • REC
            </span>
          </div>
          <div className="text-sm text-slate-400">
            Active Students: <span className="text-white font-bold">6/20</span>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-4 p-4">
          {STUDENTS.map((student) => (
            <div key={student.id} className="relative group bg-slate-900 rounded-lg border border-slate-800 overflow-hidden hover:border-purple-500 transition-all">
              
              {/* Fake Screen Feed */}
              <div className="aspect-video bg-black relative">
                 {/* Using the images you uploaded */}
                 <img src={student.img} alt="screen" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                 
                 {/* Warning Overlay */}
                 {student.warning && (
                   <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                     <AlertTriangle className="w-12 h-12 text-red-500 drop-shadow-lg animate-bounce" />
                   </div>
                 )}
              </div>

              {/* Info Bar */}
              <div className="p-3 flex items-center justify-between bg-slate-900">
                <div>
                   <div className="font-bold text-sm">{student.name}</div>
                   <div className="text-[10px] text-slate-500 uppercase">{student.id} • {student.status}</div>
                </div>
                {student.warning ? (
                  <button className="text-[10px] bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white font-bold">
                    SEND WARNING
                  </button>
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>

            </div>
          ))}
        </div>

      </DialogContent>
    </Dialog>
  );
}