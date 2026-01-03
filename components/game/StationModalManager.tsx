// "use client";

// import React, { useState, useEffect } from "react";
// import CodeEditorWindow from "@/components/modals/CodeEditorWindow";
// import ProctorDashboard from "@/components/modals/ProctorDashboard";
// import TerminalWindow from "@/components/modals/TerminalWindow";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Coffee, Construction, Send, Clock, Wifi, WifiOff, MessageCircle } from "lucide-react";
// import { GameStation } from "@/lib/game-config";
// import { toast } from "sonner";
// import { push, ref as dbRef, onValue, query, orderByChild, equalTo } from "firebase/database";
// import { db } from "@/lib/firebase";
// import { useAuth } from "@/components/providers/AuthProvider";
// import ClassroomWindow from "@/components/modals/ClassroomWindow"; // (+)
// import CalendarWindow from "@/components/modals/CalendarWindow";   // (+)
// import { toast } from "sonner"; // For the Sheets restriction

// interface ModalManagerProps {
//   activeStation: GameStation | null;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function StationModalManager({ activeStation, isOpen, onClose }: ModalManagerProps) {
//   const { user } = useAuth();
//   const [doubt, setDoubt] = useState("");
//   const [realTimeStatus, setRealTimeStatus] = useState<"online" | "offline">("offline");
  
//   // New: Store my previous doubts
//   const [myHistory, setMyHistory] = useState<any[]>([]);

//   useEffect(() => {
//     if (activeStation?.type === "npc-teacher" && user) {
//       // 1. Listen for Professor Status
//       const statusRef = dbRef(db, "game_state/professor_status");
//       const unsubStatus = onValue(statusRef, (s) => setRealTimeStatus(s.val() === "online" ? "online" : "offline"));

//       // 2. Listen for MY doubts (History)
//       const myDoubtsRef = query(dbRef(db, "doubts"), orderByChild("studentId"), equalTo(user.uid));
//       const unsubDoubts = onValue(myDoubtsRef, (snapshot) => {
//         const data = snapshot.val();
//         if (data) {
//           const list = Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp);
//           setMyHistory(list);
//         } else {
//           setMyHistory([]);
//         }
//       });

//       return () => { unsubStatus(); unsubDoubts(); };
//     }
//   }, [activeStation, user]);

//   if (!activeStation || !isOpen) return null;

//   // ... (Keep Security, Exam, Terminal blocks exactly as they were) ...
//   if (activeStation.type === "security") return <ProctorDashboard isOpen={isOpen} onClose={onClose} />;
//   if (activeStation.type === "exam" || activeStation.type === "dev" || activeStation.type === "code-editor") return <CodeEditorWindow isOpen={isOpen} onClose={onClose} station={activeStation} />;
//   if (activeStation.type === "server") return <TerminalWindow isOpen={isOpen} onClose={onClose} stationName={activeStation.label} stationId={activeStation.id} />;

//   if (activeStation.type === "classroom") {
//     return <ClassroomWindow isOpen={isOpen} onClose={onClose} />;
//   }

//   if (activeStation.type === "calendar") {
//     return <CalendarWindow isOpen={isOpen} onClose={onClose} />;
//   }

//   if (activeStation.type === "sheets") {
//     // RBAC Check for Sheets (Teachers Only)
//     // We assume 'user' is available from useAuth() which you likely already have in this file or can import
//     const { user } = useAuth(); 
//     // Import 'isTeacher' from game-config
//     if (!isTeacher(user?.email)) {
//        // Close immediately and show error if student tries to open gradebook
//        onClose();
//        toast.error("Access Denied: Faculty Clearance Required.");
//        return null; 
//     }
//     // If Teacher, show placeholder (or create a GradeSheetWindow similar to above)
//     return (
//        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
//          <DialogContent className="bg-zinc-900 text-white">
//            <DialogTitle>Teacher Gradebook</DialogTitle>
//            <p>This would open the Google Sheets export interface.</p>
//          </DialogContent>
//        </Dialog>
//     );
//   }
//   // 4. TEACHER NPC
//   if (activeStation.type === "npc-teacher") {
//     const handleSendDoubt = async () => {
//       if (!doubt.trim() || !user) return;
//       try {
//         await push(dbRef(db, "doubts"), {
//           studentName: user.displayName || "Student",
//           studentId: user.uid,
//           text: doubt,
//           timestamp: Date.now(),
//           status: "pending"
//         });
//         toast.success("Sent!");
//         setDoubt("");
//       } catch (e) { toast.error("Failed to send."); }
//     };

//     const isOnline = realTimeStatus === "online";

//     return (
//       <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
//         <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-700 text-white shadow-2xl h-[600px] flex flex-col" aria-describedby="teacher-desc">
          
//           <DialogHeader>
//              <DialogTitle className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center border-2 border-yellow-500 overflow-hidden shrink-0">
//                     <img src="/characters/teacher.png" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Professor&clothing=blazerAndShirt"} />
//                 </div>
//                 <div>
//                     <span className="text-xl font-bold text-yellow-400 block">{activeStation.label}</span>
//                     <span className="text-xs text-zinc-400 uppercase tracking-widest font-normal flex items-center gap-1">
//                         {isOnline ? <><Wifi className="w-3 h-3 text-green-500"/><span className="text-green-400">Online</span></> : <><WifiOff className="w-3 h-3 text-red-500"/><span className="text-red-400">Offline</span></>}
//                     </span>
//                 </div>
//              </DialogTitle>
//              <DialogDescription id="teacher-desc" className="sr-only">Ask doubts</DialogDescription>
//           </DialogHeader>

//           <div className="flex-1 flex flex-col gap-4 mt-2 overflow-hidden">
//             {/* Input Area */}
//             <div className="shrink-0 space-y-2">
//                 <textarea 
//                     value={doubt}
//                     onChange={(e) => setDoubt(e.target.value)}
//                     placeholder="Type your doubt here..."
//                     className="w-full h-20 bg-black/50 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 resize-none"
//                 />
//                 <div className="flex justify-end">
//                   <Button onClick={handleSendDoubt} disabled={!doubt.trim()} size="sm" className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold">
//                     <Send className="w-3 h-3 mr-2" /> Ask Professor
//                   </Button>
//                 </div>
//             </div>

//             {/* History Section */}
//             <div className="flex-1 overflow-hidden flex flex-col bg-zinc-950/30 rounded-lg border border-zinc-800">
//                <div className="p-2 bg-zinc-800/50 text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
//                   <MessageCircle className="w-3 h-3" /> Your Previous Doubts
//                </div>
//                <div className="flex-1 overflow-y-auto p-3 space-y-3">
//                   {myHistory.length === 0 ? (
//                     <p className="text-zinc-600 text-xs text-center mt-10">No history yet.</p>
//                   ) : (
//                     myHistory.map((item, i) => (
//                       <div key={i} className="flex flex-col gap-2">
//                          {/* My Question */}
//                          <div className="self-end bg-blue-900/20 border border-blue-900/50 rounded-lg rounded-tr-none p-2 max-w-[85%]">
//                             <p className="text-sm text-blue-100">{item.text}</p>
//                             <span className="text-[10px] text-blue-400/60 block mt-1 text-right">{new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
//                          </div>
                         
//                          {/* Professor Answer */}
//                          {item.status === 'resolved' && item.answer ? (
//                             <div className="self-start bg-yellow-900/20 border border-yellow-900/50 rounded-lg rounded-tl-none p-2 max-w-[90%]">
//                                <p className="text-xs text-yellow-500 font-bold mb-1">Professor Byte:</p>
//                                <p className="text-sm text-yellow-100/90">{item.answer}</p>
//                             </div>
//                          ) : (
//                             <div className="self-end text-[10px] text-zinc-500 italic pr-1">Waiting for reply...</div>
//                          )}
//                       </div>
//                     ))
//                   )}
//                </div>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   // Common Area
//   if (activeStation.type === "common" || activeStation.type === "social") {
//     return (
//       <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
//         <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-xl"><Coffee className="text-orange-400" /> {activeStation.label}</DialogTitle>
//             <DialogDescription className="text-zinc-400">Relax zone.</DialogDescription>
//           </DialogHeader>
//           <div className="flex justify-end"><Button onClick={onClose} variant="secondary">Back</Button></div>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   return null;
// }
////////////////////////////////////////////////////

// "use client";

// import React, { useState, useEffect } from "react";

// // --- EXISTING MODALS ---
// import CodeEditorWindow from "@/components/modals/CodeEditorWindow";
// import ProctorDashboard from "@/components/modals/ProctorDashboard";
// import TerminalWindow from "@/components/modals/TerminalWindow";

// // --- NEW GOOGLE WORKSPACE MODALS ---
// import ClassroomWindow from "@/components/modals/ClassroomWindow";
// import CalendarWindow from "@/components/modals/CalendarWindow";

// // --- UI COMPONENTS ---
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Coffee, Send, Wifi, WifiOff, MessageCircle, Sheet } from "lucide-react"; // Added Sheet icon
// import { toast } from "sonner";

// // --- LOGIC & CONFIG ---
// import { GameStation, isTeacher } from "@/lib/game-config";
// import { push, ref as dbRef, onValue, query, orderByChild, equalTo } from "firebase/database";
// import { db } from "@/lib/firebase";
// import { useAuth } from "@/components/providers/AuthProvider";

// interface ModalManagerProps {
//   activeStation: GameStation | null;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function StationModalManager({ activeStation, isOpen, onClose }: ModalManagerProps) {
//   const { user } = useAuth();

//   // --- TEACHER NPC STATE ---
//   const [doubt, setDoubt] = useState("");
//   const [realTimeStatus, setRealTimeStatus] = useState<"online" | "offline">("offline");
//   const [myHistory, setMyHistory] = useState<any[]>([]);

//   // --- TEACHER NPC EFFECT (Only runs if station is NPC) ---
//   useEffect(() => {
//     if (activeStation?.type === "npc-teacher" && user) {
//       // 1. Listen for Professor Status
//       const statusRef = dbRef(db, "game_state/professor_status");
//       const unsubStatus = onValue(statusRef, (s) => setRealTimeStatus(s.val() === "online" ? "online" : "offline"));

//       // 2. Listen for MY doubts (History)
//       const myDoubtsRef = query(dbRef(db, "doubts"), orderByChild("studentId"), equalTo(user.uid));
//       const unsubDoubts = onValue(myDoubtsRef, (snapshot) => {
//         const data = snapshot.val();
//         if (data) {
//           const list = Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp);
//           setMyHistory(list);
//         } else {
//           setMyHistory([]);
//         }
//       });

//       return () => { unsubStatus(); unsubDoubts(); };
//     }
//   }, [activeStation, user]);

//   if (!activeStation || !isOpen) return null;

//   // =========================================================
//   // 1. SECURITY & PROCTORING
//   // =========================================================
//   if (activeStation.type === "security") {
//     return <ProctorDashboard isOpen={isOpen} onClose={onClose} />;
//   }

//   // =========================================================
//   // 2. CODING & EXAMS (IDE)
//   // =========================================================
//   if (activeStation.type === "exam" || activeStation.type === "dev" || activeStation.type === "code-editor") {
//     return <CodeEditorWindow isOpen={isOpen} onClose={onClose} station={activeStation} />;
//   }

//   // =========================================================
//   // 3. SERVER MANAGEMENT (TERMINAL)
//   // =========================================================
//   if (activeStation.type === "server") {
//     return <TerminalWindow isOpen={isOpen} onClose={onClose} stationName={activeStation.label} stationId={activeStation.id} />;
//   }

//   // =========================================================
//   // 4. GOOGLE CLASSROOM (NEW)
//   // =========================================================
//   if (activeStation.type === "classroom") {
//     return <ClassroomWindow isOpen={isOpen} onClose={onClose} />;
//   }

//   // =========================================================
//   // 5. GOOGLE CALENDAR (NEW)
//   // =========================================================
//   if (activeStation.type === "calendar") {
//     return <CalendarWindow isOpen={isOpen} onClose={onClose} />;
//   }

//   // =========================================================
//   // 6. GOOGLE SHEETS / GRADEBOOK (NEW - RBAC PROTECTED)
//   // =========================================================
//   if (activeStation.type === "sheets") {
//     // 🔒 Security Check
//     if (!isTeacher(user?.email)) {
//       onClose(); // Close the modal immediately
//       toast.error("⛔ ACCESS DENIED: Faculty clearance required.");
//       return null;
//     }

//     // If Teacher, show placeholder for Grade Export
//     return (
//       <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
//         <DialogContent className="bg-zinc-900 text-white border-zinc-800">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-emerald-500">
//               <Sheet className="w-5 h-5" /> Gradebook Export
//             </DialogTitle>
//             <DialogDescription className="text-zinc-400">
//               Export current game logic and student performance to Google Sheets.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="py-8 flex justify-center">
//             <Button className="bg-emerald-700 hover:bg-emerald-600">
//               Sync Data to Sheets
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   // =========================================================
//   // 7. TEACHER NPC INTERACTION
//   // =========================================================
//   if (activeStation.type === "npc-teacher") {
//     const handleSendDoubt = async () => {
//       if (!doubt.trim() || !user) return;
//       try {
//         await push(dbRef(db, "doubts"), {
//           studentName: user.displayName || "Student",
//           studentId: user.uid,
//           text: doubt,
//           timestamp: Date.now(),
//           status: "pending"
//         });
//         toast.success("Sent to Professor!");
//         setDoubt("");
//       } catch (e) { toast.error("Failed to send."); }
//     };

//     const isOnline = realTimeStatus === "online";

//     return (
//       <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
//         <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-700 text-white shadow-2xl h-[600px] flex flex-col" aria-describedby="teacher-desc">
          
//           <DialogHeader>
//              <DialogTitle className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center border-2 border-yellow-500 overflow-hidden shrink-0">
//                     <img src="/characters/teacher.png" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Professor&clothing=blazerAndShirt"} />
//                 </div>
//                 <div>
//                     <span className="text-xl font-bold text-yellow-400 block">{activeStation.label}</span>
//                     <span className="text-xs text-zinc-400 uppercase tracking-widest font-normal flex items-center gap-1">
//                         {isOnline ? <><Wifi className="w-3 h-3 text-green-500"/><span className="text-green-400">Online</span></> : <><WifiOff className="w-3 h-3 text-red-500"/><span className="text-red-400">Offline</span></>}
//                     </span>
//                 </div>
//              </DialogTitle>
//              <DialogDescription id="teacher-desc" className="sr-only">Ask doubts</DialogDescription>
//           </DialogHeader>

//           <div className="flex-1 flex flex-col gap-4 mt-2 overflow-hidden">
//             {/* Input Area */}
//             <div className="shrink-0 space-y-2">
//                 <textarea 
//                     value={doubt}
//                     onChange={(e) => setDoubt(e.target.value)}
//                     placeholder="Type your doubt here..."
//                     className="w-full h-20 bg-black/50 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 resize-none"
//                 />
//                 <div className="flex justify-end">
//                   <Button onClick={handleSendDoubt} disabled={!doubt.trim()} size="sm" className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold">
//                     <Send className="w-3 h-3 mr-2" /> Ask Professor
//                   </Button>
//                 </div>
//             </div>

//             {/* History Section */}
//             <div className="flex-1 overflow-hidden flex flex-col bg-zinc-950/30 rounded-lg border border-zinc-800">
//                <div className="p-2 bg-zinc-800/50 text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
//                   <MessageCircle className="w-3 h-3" /> Your Previous Doubts
//                </div>
//                <div className="flex-1 overflow-y-auto p-3 space-y-3">
//                   {myHistory.length === 0 ? (
//                     <p className="text-zinc-600 text-xs text-center mt-10">No history yet.</p>
//                   ) : (
//                     myHistory.map((item, i) => (
//                       <div key={i} className="flex flex-col gap-2">
//                           {/* My Question */}
//                           <div className="self-end bg-blue-900/20 border border-blue-900/50 rounded-lg rounded-tr-none p-2 max-w-[85%]">
//                              <p className="text-sm text-blue-100">{item.text}</p>
//                              <span className="text-[10px] text-blue-400/60 block mt-1 text-right">{new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
//                           </div>
                          
//                           {/* Professor Answer */}
//                           {item.status === 'resolved' && item.answer ? (
//                              <div className="self-start bg-yellow-900/20 border border-yellow-900/50 rounded-lg rounded-tl-none p-2 max-w-[90%]">
//                                 <p className="text-xs text-yellow-500 font-bold mb-1">Professor Byte:</p>
//                                 <p className="text-sm text-yellow-100/90">{item.answer}</p>
//                              </div>
//                           ) : (
//                              <div className="self-end text-[10px] text-zinc-500 italic pr-1">Waiting for reply...</div>
//                           )}
//                       </div>
//                     ))
//                   )}
//                </div>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   // =========================================================
//   // 8. COMMON AREA / SOCIAL
//   // =========================================================
//   if (activeStation.type === "common" || activeStation.type === "social") {
//     return (
//       <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
//         <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-xl"><Coffee className="text-orange-400" /> {activeStation.label}</DialogTitle>
//             <DialogDescription className="text-zinc-400">Relax zone.</DialogDescription>
//           </DialogHeader>
//           <div className="flex justify-end"><Button onClick={onClose} variant="secondary">Back</Button></div>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   return null;
// }

"use client";

import React, { useState, useEffect } from "react";

// --- EXISTING MODALS ---
import CodeEditorWindow from "@/components/modals/CodeEditorWindow";
import ProctorDashboard from "@/components/modals/ProctorDashboard";
import TerminalWindow from "@/components/modals/TerminalWindow";

// --- NEW GOOGLE WORKSPACE MODALS ---
import ClassroomWindow from "@/components/modals/ClassroomWindow";
import CalendarWindow from "@/components/modals/CalendarWindow";

// --- UI COMPONENTS ---
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, Send, Wifi, WifiOff, MessageCircle, Sheet } from "lucide-react";
import { toast } from "sonner";

// --- LOGIC & CONFIG ---
import { GameStation, isTeacher } from "@/lib/game-config";
import { push, ref as dbRef, onValue, query, orderByChild, equalTo } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/providers/AuthProvider";

interface ModalManagerProps {
  activeStation: GameStation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StationModalManager({ activeStation, isOpen, onClose }: ModalManagerProps) {
  const { user } = useAuth();

  // --- TEACHER NPC STATE ---
  const [doubt, setDoubt] = useState("");
  const [realTimeStatus, setRealTimeStatus] = useState<"online" | "offline">("offline");
  const [myHistory, setMyHistory] = useState<any[]>([]);

  // --- 1. HANDLE RBAC SECURITY CHECKS (The Fix) ---
  // We check permission here, but perform the 'closing' action inside useEffect
  const isSheetAccessDenied = activeStation?.type === "sheets" && !isTeacher(user?.email);

  useEffect(() => {
    if (isOpen && isSheetAccessDenied) {
      // This now runs safely AFTER the component renders
      toast.error("⛔ ACCESS DENIED: Faculty clearance required.");
      onClose();
    }
  }, [isOpen, isSheetAccessDenied, onClose]);

  // --- TEACHER NPC EFFECT ---
  useEffect(() => {
    if (activeStation?.type === "npc-teacher" && user) {
      const statusRef = dbRef(db, "game_state/professor_status");
      const unsubStatus = onValue(statusRef, (s) => setRealTimeStatus(s.val() === "online" ? "online" : "offline"));

      const myDoubtsRef = query(dbRef(db, "doubts"), orderByChild("studentId"), equalTo(user.uid));
      const unsubDoubts = onValue(myDoubtsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp);
          setMyHistory(list);
        } else {
          setMyHistory([]);
        }
      });

      return () => { unsubStatus(); unsubDoubts(); };
    }
  }, [activeStation, user]);

  // If modal is closed or station is null, render nothing
  if (!activeStation || !isOpen) return null;

  // If access is denied, render nothing (the useEffect above will close the window)
  if (isSheetAccessDenied) return null;

  // =========================================================
  // 2. RENDER STATIONS
  // =========================================================

  if (activeStation.type === "security") {
    return <ProctorDashboard isOpen={isOpen} onClose={onClose} />;
  }

  if (activeStation.type === "exam" || activeStation.type === "dev" || activeStation.type === "code-editor") {
    return <CodeEditorWindow isOpen={isOpen} onClose={onClose} station={activeStation} />;
  }

  if (activeStation.type === "server") {
    return <TerminalWindow isOpen={isOpen} onClose={onClose} stationName={activeStation.label} stationId={activeStation.id} />;
  }

  if (activeStation.type === "classroom") {
    return <ClassroomWindow isOpen={isOpen} onClose={onClose} />;
  }

  if (activeStation.type === "calendar") {
    return <CalendarWindow isOpen={isOpen} onClose={onClose} />;
  }

  // GOOGLE SHEETS (We already handled the denial check above, so this only renders if Allowed)
  if (activeStation.type === "sheets") {
    return (
      <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-500">
              <Sheet className="w-5 h-5" /> Gradebook Export
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Export current game logic and student performance to Google Sheets.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 flex justify-center">
            <Button className="bg-emerald-700 hover:bg-emerald-600">
              Sync Data to Sheets
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // TEACHER NPC INTERACTION
  if (activeStation.type === "npc-teacher") {
    const handleSendDoubt = async () => {
      if (!doubt.trim() || !user) return;
      try {
        await push(dbRef(db, "doubts"), {
          studentName: user.displayName || "Student",
          studentId: user.uid,
          text: doubt,
          timestamp: Date.now(),
          status: "pending"
        });
        toast.success("Sent to Professor!");
        setDoubt("");
      } catch (e) { toast.error("Failed to send."); }
    };

    const isOnline = realTimeStatus === "online";

    return (
      <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
        <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-700 text-white shadow-2xl h-[600px] flex flex-col" aria-describedby="teacher-desc">
          
          <DialogHeader>
             <DialogTitle className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center border-2 border-yellow-500 overflow-hidden shrink-0">
                    <img src="/characters/teacher.png" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Professor&clothing=blazerAndShirt"} />
                </div>
                <div>
                    <span className="text-xl font-bold text-yellow-400 block">{activeStation.label}</span>
                    <span className="text-xs text-zinc-400 uppercase tracking-widest font-normal flex items-center gap-1">
                        {isOnline ? <><Wifi className="w-3 h-3 text-green-500"/><span className="text-green-400">Online</span></> : <><WifiOff className="w-3 h-3 text-red-500"/><span className="text-red-400">Offline</span></>}
                    </span>
                </div>
             </DialogTitle>
             <DialogDescription id="teacher-desc" className="sr-only">Ask doubts</DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-4 mt-2 overflow-hidden">
            <div className="shrink-0 space-y-2">
                <textarea 
                    value={doubt}
                    onChange={(e) => setDoubt(e.target.value)}
                    placeholder="Type your doubt here..."
                    className="w-full h-20 bg-black/50 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-yellow-500 resize-none"
                />
                <div className="flex justify-end">
                  <Button onClick={handleSendDoubt} disabled={!doubt.trim()} size="sm" className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold">
                    <Send className="w-3 h-3 mr-2" /> Ask Professor
                  </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-zinc-950/30 rounded-lg border border-zinc-800">
               <div className="p-2 bg-zinc-800/50 text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                  <MessageCircle className="w-3 h-3" /> Your Previous Doubts
               </div>
               <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {myHistory.length === 0 ? (
                    <p className="text-zinc-600 text-xs text-center mt-10">No history yet.</p>
                  ) : (
                    myHistory.map((item, i) => (
                      <div key={i} className="flex flex-col gap-2">
                          <div className="self-end bg-blue-900/20 border border-blue-900/50 rounded-lg rounded-tr-none p-2 max-w-[85%]">
                             <p className="text-sm text-blue-100">{item.text}</p>
                             <span className="text-[10px] text-blue-400/60 block mt-1 text-right">{new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                          </div>
                          {item.status === 'resolved' && item.answer ? (
                             <div className="self-start bg-yellow-900/20 border border-yellow-900/50 rounded-lg rounded-tl-none p-2 max-w-[90%]">
                                <p className="text-xs text-yellow-500 font-bold mb-1">Professor Byte:</p>
                                <p className="text-sm text-yellow-100/90">{item.answer}</p>
                             </div>
                          ) : (
                             <div className="self-end text-[10px] text-zinc-500 italic pr-1">Waiting for reply...</div>
                          )}
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (activeStation.type === "common" || activeStation.type === "social") {
    return (
      <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl"><Coffee className="text-orange-400" /> {activeStation.label}</DialogTitle>
            <DialogDescription className="text-zinc-400">Relax zone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end"><Button onClick={onClose} variant="secondary">Back</Button></div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}