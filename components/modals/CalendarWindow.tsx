// "use client";

// import React, { useEffect, useState } from "react";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import { useAuth } from "@/components/providers/AuthProvider";
// import { GoogleWorkspace } from "@/lib/google-workspace";
// import { Calendar as CalendarIcon, MapPin } from "lucide-react";

// interface CalendarWindowProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function CalendarWindow({ isOpen, onClose }: CalendarWindowProps) {
//   const { accessToken } = useAuth();
//   const [events, setEvents] = useState<any[]>([]);

//   useEffect(() => {
//     if (isOpen && accessToken) {
//       GoogleWorkspace.getEvents(accessToken)
//         .then((data) => setEvents(data.items || []))
//         .catch(console.error);
//     }
//   }, [isOpen, accessToken]);

//   return (
//     <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
//       <DialogContent className="max-w-md h-[600px] bg-zinc-950 border-zinc-800 text-white flex flex-col p-0">
//         <div className="bg-[#4285f4] p-4 flex items-center gap-3">
//           <CalendarIcon className="w-6 h-6 text-white" />
//           <DialogTitle className="text-lg font-bold">Campus Schedule</DialogTitle>
//         </div>

//         <div className="flex-1 overflow-y-auto p-4 space-y-3">
//           {events.length === 0 && <p className="text-center text-zinc-500 mt-10">No upcoming events.</p>}
          
//           {events.map((event) => (
//             <div key={event.id} className="bg-zinc-900 border-l-4 border-blue-500 p-3 rounded shadow-sm">
//               <div className="text-xs text-blue-400 font-bold mb-1">
//                 {event.start.dateTime 
//                   ? new Date(event.start.dateTime).toLocaleString([], {weekday: 'short', hour: '2-digit', minute:'2-digit'})
//                   : "All Day"}
//               </div>
//               <h4 className="font-bold text-sm">{event.summary}</h4>
//               {event.location && (
//                 <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-1">
//                   <MapPin className="w-3 h-3" /> {event.location}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import { GoogleWorkspace } from "@/lib/google-workspace";
import { isTeacher } from "@/lib/game-config"; // Import RBAC check
import { Calendar as CalendarIcon, MapPin, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CalendarWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendarWindow({ isOpen, onClose }: CalendarWindowProps) {
  const { accessToken, user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const amITeacher = isTeacher(user?.email);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", time: "" });

  const loadEvents = () => {
    if (accessToken) {
      GoogleWorkspace.getEvents(accessToken)
        .then((data) => setEvents(data.items || []))
        .catch(console.error);
    }
  };

  useEffect(() => {
    if (isOpen) loadEvents();
  }, [isOpen, accessToken]);

  const handleCreateEvent = async () => {
    if (!accessToken || !newEvent.title || !newEvent.time) return;
    
    setIsCreating(true);
    try {
      // Create simplified start/end times (1 hour duration)
      const startDate = new Date(newEvent.time);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 Hour

      await GoogleWorkspace.createEvent(accessToken, {
        summary: `[NETVERSE] ${newEvent.title}`,
        description: "Lecture scheduled via NetVerse Campus.",
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });

      toast.success("Lecture Scheduled!");
      setNewEvent({ title: "", time: "" });
      loadEvents(); // Refresh list
    } catch (e) {
      toast.error("Failed to schedule.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md h-[600px] bg-zinc-950 border-zinc-800 text-white flex flex-col p-0">
        
        {/* Header */}
        <div className="bg-[#4285f4] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-white" />
            <DialogTitle className="text-lg font-bold">Campus Schedule</DialogTitle>
          </div>
          {amITeacher && <span className="text-[10px] bg-white/20 px-2 py-1 rounded font-bold">TEACHER MODE</span>}
        </div>

        {/* TEACHER ONLY: Creation Form */}
        {amITeacher && (
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 space-y-3">
             <div className="text-xs font-bold text-blue-400 uppercase">Schedule Lecture</div>
             <div className="flex gap-2">
                <Input 
                  placeholder="Lecture Topic (e.g. Intro to Node.js)" 
                  className="bg-black border-zinc-700 h-8 text-xs"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                />
             </div>
             <div className="flex gap-2">
                <Input 
                  type="datetime-local" 
                  className="bg-black border-zinc-700 h-8 text-xs"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                />
                <Button size="sm" onClick={handleCreateEvent} disabled={isCreating} className="h-8 bg-blue-600 hover:bg-blue-500">
                  {isCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Add
                </Button>
             </div>
          </div>
        )}

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {events.length === 0 && <p className="text-center text-zinc-500 mt-10">No upcoming events.</p>}
          
          {events.map((event) => (
            <div key={event.id} className="bg-zinc-900 border-l-4 border-blue-500 p-3 rounded shadow-sm">
              <div className="text-xs text-blue-400 font-bold mb-1">
                {event.start.dateTime 
                  ? new Date(event.start.dateTime).toLocaleString([], {weekday: 'short', hour: '2-digit', minute:'2-digit'})
                  : "All Day"}
              </div>
              <h4 className="font-bold text-sm">{event.summary}</h4>
              {event.location && (
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-1">
                  <MapPin className="w-3 h-3" /> {event.location}
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}