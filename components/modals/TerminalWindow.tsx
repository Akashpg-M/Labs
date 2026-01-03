"use client";

import { Terminal, Maximize2, X, Play, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
// 1. Import DialogTitle
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface TerminalWindowProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  stationId: string;
}

export default function TerminalWindow({ isOpen, onClose, stationName, stationId }: TerminalWindowProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-[90vw] h-[85vh] bg-zinc-950 border-zinc-800 p-0 gap-0 flex flex-col overflow-hidden">
        
        {/* Window Title Bar */}
        <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 select-none">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-blue-500" />
            
            {/* 2. Add DialogTitle here. This fixes the accessibility error. */}
            <DialogTitle className="text-sm font-mono text-zinc-300 font-normal">
              root@netverse:{stationId}
            </DialogTitle>
            
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-zinc-300">
              <RefreshCcw className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-zinc-300">
              <Maximize2 className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-red-400 hover:bg-red-900/20">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="h-12 bg-zinc-900/50 border-b border-zinc-800 flex items-center px-4 gap-4">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs text-green-500 font-bold">CONNECTED</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-xs h-7 gap-2">
            <Play className="w-3 h-3" /> Run Script
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-black relative font-mono text-sm p-4 text-zinc-300 overflow-auto">
          <div className="opacity-50">
            <p>NetVerse OS v2.4.0 [Stable]</p>
            <p className="mb-4">Type "help" for a list of commands.</p>
            <p><span className="text-green-500">root@{stationId}:~#</span> apt update</p>
            <p>Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease</p>
            <p>Hit:2 http://security.ubuntu.com/ubuntu jammy-security InRelease</p>
            <p>Reading package lists... Done</p>
            <p className="mt-2"><span className="text-green-500">root@{stationId}:~#</span> <span className="animate-pulse">_</span></p>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}