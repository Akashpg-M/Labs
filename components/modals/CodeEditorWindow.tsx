"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { 
  Play, RotateCcw, Save, Loader2, Terminal, X, 
  ChevronDown, Code2, FileText, RefreshCw, Bot 
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { CloudFile, CloudAPI } from "@/lib/cloud-shell-api";

// --- LANGUAGE CONFIG ---
// IDs match Monaco Editor language identifiers
const LANGUAGES = [
  { id: "cpp", label: "C++ (GCC)", snippet: "#include <iostream>\n\nint main() {\n\tstd::cout << \"Hello NetVerse\";\n\treturn 0;\n}" },
  { id: "python", label: "Python 3", snippet: "print('Hello NetVerse')" },
  { id: "javascript", label: "Node.js", snippet: "console.log('Hello NetVerse');" },
  { id: "go", label: "Go 1.20", snippet: "package main\nimport \"fmt\"\nfunc main() {\n\tfmt.Println(\"Hello\")\n}" },
];

interface CodeEditorWindowProps {
  isOpen: boolean;
  onClose: () => void;
  station: any;
}

export default function CodeEditorWindow({ isOpen, onClose, station }: CodeEditorWindowProps) {
  const { user } = useAuth();
  
  // --- STATE ---
  const [activeLang, setActiveLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].snippet);
  const [output, setOutput] = useState("");
  
  // Loading States
  const [isRunning, setIsRunning] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // File System State
  const [currentFilename, setCurrentFilename] = useState("main.cpp");
  const [files, setFiles] = useState<CloudFile[]>([]);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    if (isOpen && user?.email) {
      refreshFiles();
    }
  }, [isOpen, user]);

  const refreshFiles = async () => {
    if (!user?.email) return;
    setIsLoadingFiles(true);
    const data = await CloudAPI.listFiles(user.email);
    if (data.files) setFiles(data.files);
    setIsLoadingFiles(false);
  };

  // --- 2. ACTIONS ---

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("📡 Sending to Cloud VM...");
    
    // Call Cloud API
    const result = await CloudAPI.execute(code, activeLang.id);
    
    if (result.isError) {
      setOutput(`⚠️ Error:\n${result.output}`);
    } else {
      setOutput(`✅ Execution Time: ${result.executionTime || "0ms"}\n\n${result.output}`);
    }
    setIsRunning(false);
  };

  const handleSave = async () => {
    if (!user?.email) return toast.error("You must be logged in to save.");
    
    let filename = currentFilename;
    if (filename === "untitled" || filename === "main.cpp") {
      const input = prompt("Enter filename to save (e.g., mysolution.cpp):");
      if (!input) return;
      filename = input;
    }

    const toastId = toast.loading("Saving to cloud...");
    const res = await CloudAPI.saveFile(user.email, filename, code);
    
    toast.dismiss(toastId);
    if (res.success) {
      toast.success("File saved successfully!");
      setCurrentFilename(filename);
      refreshFiles();
    } else {
      toast.error("Save failed: " + res.error);
    }
  };

  const loadFile = async (filename: string) => {
    if (!user?.email) return;
    const toastId = toast.loading(`Loading ${filename}...`);
    
    const data = await CloudAPI.readFile(user.email, filename);
    
    toast.dismiss(toastId);
    if (data.content) {
      setCode(data.content);
      setCurrentFilename(filename);
      setOutput(""); 
      
      // Auto-detect language based on extension
      if (filename.endsWith(".py")) setActiveLang(LANGUAGES[1]);
      else if (filename.endsWith(".js")) setActiveLang(LANGUAGES[2]);
      else if (filename.endsWith(".go")) setActiveLang(LANGUAGES[3]);
      else setActiveLang(LANGUAGES[0]);
    }
  };

  // --- 3. AI ASSISTANT LOGIC ---
  const handleAskAI = async () => {
    if (!output) {
      toast.error("Run your code first to generate an output/error for the AI to analyze!");
      return;
    }
    
    setIsAiLoading(true);
    try {
      // Assuming you have a Next.js API route at /api/hint
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code, 
          error: output, 
          language: activeLang.id 
        }),
      });
      
      if (!res.ok) throw new Error("AI Service unavailable");
      
      const data = await res.json();
      setOutput((prev) => prev + "\n\n🤖 AI LAB ASSISTANT:\n" + data.hint);
    } catch (err) {
      toast.error("AI Assistant is offline.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      {/* FORCE FULL WIDTH/HEIGHT */}
      <DialogContent className="!max-w-[95vw] !w-[95vw] h-[90vh] bg-[#1e1e1e] border-zinc-800 p-0 gap-0 flex flex-col overflow-hidden sm:rounded-xl shadow-2xl">
        
        {/* --- HEADER --- */}
        <div className="h-16 bg-[#252526] border-b border-black/40 flex items-center justify-between px-4 shrink-0 select-none">
          {/* Left: Title & File Name */}
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
               {/* DialogTitle for Shadcn Accessibility */}
               <DialogTitle className="text-white font-bold text-sm flex items-center gap-2">
                 <Code2 className="w-4 h-4 text-blue-400"/>
                 {station?.label || "IDE Environment"}
               </DialogTitle>
               
               <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                 {currentFilename} {files.find(f => f.name === currentFilename) ? "(Saved)" : "(Unsaved)"}
               </span>
             </div>

             {/* Language Select */}
             <div className="relative ml-4 group">
               <select 
                  value={activeLang.id}
                  onChange={(e) => {
                    const selected = LANGUAGES.find(l => l.id === e.target.value) || LANGUAGES[0];
                    setActiveLang(selected);
                    setCode(selected.snippet); // Update Code
                    setOutput("");             // Clear Output
                  }}
                  className="appearance-none bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer hover:border-zinc-500 transition-colors"
               >
                 {LANGUAGES.map(lang => (
                   <option key={lang.id} value={lang.id}>{lang.label}</option>
                 ))}
               </select>
               <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-zinc-500 pointer-events-none"/>
             </div>
          </div>

          {/* Right: Buttons */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setCode(activeLang.snippet)} className="text-zinc-400 hover:text-white hidden sm:flex">
              <RotateCcw className="w-4 h-4 mr-2"/> Reset
            </Button>
            
            {/* AI BUTTON */}
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleAskAI} 
              disabled={isAiLoading || !output}
              className="bg-purple-900/20 text-purple-300 hover:bg-purple-900/40 border border-purple-500/30"
            >
              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Bot className="w-4 h-4 sm:mr-2"/>}
              <span className="hidden sm:inline">AI Hint</span>
            </Button>

            {/* SAVE BUTTON */}
            <Button size="sm" variant="secondary" onClick={handleSave} className="bg-blue-900/20 text-blue-300 hover:bg-blue-900/40 border border-blue-500/30">
              <Save className="w-4 h-4 mr-2"/> Save
            </Button>

            {/* RUN BUTTON */}
            <Button size="sm" onClick={handleRun} disabled={isRunning} className="bg-green-600 hover:bg-green-500 text-white min-w-[100px] shadow-lg shadow-green-900/20">
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4 mr-2 fill-current"/>}
              Run
            </Button>
            
            <div className="w-px h-6 bg-zinc-700 mx-2"/>
            <Button size="icon" variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white rounded-full w-8 h-8 hover:bg-red-500/20 hover:text-red-400">
              <X className="w-5 h-5"/>
            </Button>
          </div>
        </div>

        {/* --- MAIN BODY --- */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: FILE EXPLORER SIDEBAR */}
          <div className="w-56 bg-[#181818] border-r border-black/40 flex flex-col shrink-0">
            <div className="h-8 flex items-center justify-between px-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider bg-[#1f1f1f]">
              <span>Cloud Files</span>
              <RefreshCw className={`w-3 h-3 cursor-pointer hover:text-white ${isLoadingFiles ? 'animate-spin' : ''}`} onClick={refreshFiles}/>
            </div>
            
            <div className="flex-1 overflow-auto p-2 space-y-1">
               {isLoadingFiles ? (
                 <div className="text-zinc-600 text-xs p-2 text-center">Syncing...</div>
               ) : files.length === 0 ? (
                 <div className="text-zinc-600 text-xs p-2 text-center italic">No files found</div>
               ) : (
                 files.map((file) => (
                   <div 
                     key={file.name} 
                     onClick={() => loadFile(file.name)}
                     className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer select-none transition-colors ${
                       currentFilename === file.name ? "bg-blue-600/20 text-blue-400" : "text-zinc-400 hover:bg-[#2a2a2a] hover:text-zinc-200"
                     }`}
                   >
                     <FileText className="w-3.5 h-3.5 opacity-70"/>
                     <span className="truncate">{file.name}</span>
                   </div>
                 ))
               )}
            </div>
          </div>

          {/* RIGHT: EDITOR + TERMINAL */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* TOP: MONACO EDITOR */}
            <div className="flex-1 relative bg-[#1e1e1e]">
               <Editor
                 height="100%"
                 language={activeLang.id}
                 theme="vs-dark"
                 value={code}
                 onChange={(value) => setCode(value || "")}
                 options={{
                   minimap: { enabled: false },
                   fontSize: 14,
                   lineNumbers: "on",
                   scrollBeyondLastLine: false,
                   automaticLayout: true,
                   padding: { top: 16 }
                 }}
               />
            </div>

            {/* BOTTOM: TERMINAL */}
            <div className="h-48 bg-[#0d0d0d] border-t border-zinc-800 flex flex-col shrink-0">
              <div className="h-8 bg-[#1e1e1e] border-b border-black flex items-center px-4 justify-between select-none">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-3 h-3"/> Console Output
                </span>
                <button onClick={() => setOutput("")} className="text-[10px] text-zinc-500 hover:text-zinc-300 underline">Clear</button>
              </div>
              
              <div className="flex-1 p-4 overflow-auto font-mono text-sm">
                {output ? (
                  <pre className="text-zinc-300 whitespace-pre-wrap font-[inherit]">{output}</pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-800 space-y-2 select-none">
                    <Play className="w-8 h-8 opacity-20"/>
                    <span className="text-xs">Run code to see output</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}