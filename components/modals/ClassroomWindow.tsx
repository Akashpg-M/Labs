// "use client";

// import React, { useEffect, useState } from "react";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import { useAuth } from "@/components/providers/AuthProvider";
// import { GoogleWorkspace } from "@/lib/google-workspace";
// import { Book, CheckCircle, Clock } from "lucide-react";
// import { Button } from "@/components/ui/button";

// interface ClassroomWindowProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function ClassroomWindow({ isOpen, onClose }: ClassroomWindowProps) {
//   const { accessToken } = useAuth();
//   const [courses, setCourses] = useState<any[]>([]);
//   const [assignments, setAssignments] = useState<any[]>([]);
//   const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   // Load Courses on Open
//   useEffect(() => {
//     if (isOpen && accessToken) {
//       setLoading(true);
//       GoogleWorkspace.getCourses(accessToken)
//         .then((data) => setCourses(data.courses || []))
//         .catch(console.error)
//         .finally(() => setLoading(false));
//     }
//   }, [isOpen, accessToken]);

//   // Load Assignments when Course Selected
//   const handleCourseClick = async (courseId: string) => {
//     if (!accessToken) return;
//     setSelectedCourse(courseId);
//     setLoading(true);
//     const data = await GoogleWorkspace.getCourseWork(accessToken, courseId);
//     setAssignments(data.courseWork || []);
//     setLoading(false);
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
//       <DialogContent className="max-w-4xl h-[80vh] bg-zinc-950 border-zinc-800 text-white flex flex-col p-0 overflow-hidden">
//         {/* Header */}
//         <div className="bg-[#0f9d58] p-4 flex items-center gap-4">
//           <Book className="w-8 h-8 text-white" />
//           <div>
//             <DialogTitle className="text-xl font-bold">Google Classroom Integration</DialogTitle>
//             <p className="text-green-100 text-xs">Syncing real-time with your account</p>
//           </div>
//         </div>

//         <div className="flex flex-1 overflow-hidden">
//           {/* Sidebar: Course List */}
//           <div className="w-1/3 border-r border-zinc-800 bg-zinc-900 p-4 overflow-y-auto">
//             <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Your Courses</h3>
//             <div className="space-y-2">
//               {courses.map((course) => (
//                 <div 
//                   key={course.id} 
//                   onClick={() => handleCourseClick(course.id)}
//                   className={`p-3 rounded-lg cursor-pointer transition-all border ${
//                     selectedCourse === course.id 
//                       ? "bg-green-900/20 border-green-500 text-white" 
//                       : "bg-zinc-800 border-transparent hover:bg-zinc-700"
//                   }`}
//                 >
//                   <div className="font-bold text-sm truncate">{course.name}</div>
//                   <div className="text-[10px] text-zinc-400">{course.section}</div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Main: Assignments */}
//           <div className="flex-1 p-6 overflow-y-auto bg-black">
//             {!selectedCourse ? (
//               <div className="h-full flex flex-col items-center justify-center text-zinc-600">
//                 <Book className="w-12 h-12 mb-2 opacity-20" />
//                 <p>Select a course to view assignments</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 <h3 className="text-lg font-bold text-green-400 mb-4">Active Coursework</h3>
//                 {assignments.length === 0 && <p className="text-zinc-500">No assignments found.</p>}
//                 {assignments.map((work) => (
//                   <div key={work.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
//                     <div>
//                       <h4 className="font-bold hover:underline cursor-pointer" onClick={() => window.open(work.alternateLink, '_blank')}>
//                         {work.title}
//                       </h4>
//                       <p className="text-xs text-zinc-400 mt-1 max-w-md truncate">{work.description}</p>
//                     </div>
//                     <div className="flex items-center gap-4">
//                        <span className="text-xs bg-zinc-800 px-2 py-1 rounded flex items-center gap-1">
//                          <Clock className="w-3 h-3" /> Due: {work.dueDate ? `${work.dueDate.day}/${work.dueDate.month}` : 'No Date'}
//                        </span>
//                        <Button size="sm" variant="outline" onClick={() => window.open(work.alternateLink, '_blank')}>
//                          Open
//                        </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/components/providers/AuthProvider";
import { GoogleWorkspace } from "@/lib/google-workspace";
import { isTeacher } from "@/lib/game-config";
import { Book, Clock, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ClassroomWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClassroomWindow({ isOpen, onClose }: ClassroomWindowProps) {
  const { accessToken, user } = useAuth();
  const amITeacher = isTeacher(user?.email);

  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  
  // Creation State
  const [newWork, setNewWork] = useState({ title: "", desc: "" });
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (isOpen && accessToken) {
      GoogleWorkspace.getCourses(accessToken)
        .then((data) => setCourses(data.courses || []))
        .catch(console.error);
    }
  }, [isOpen, accessToken]);

  const handleCourseClick = async (courseId: string) => {
    if (!accessToken) return;
    setSelectedCourse(courseId);
    const data = await GoogleWorkspace.getCourseWork(accessToken, courseId);
    setAssignments(data.courseWork || []);
  };

  const handleCreateAssignment = async () => {
    if (!accessToken || !selectedCourse || !newWork.title) return;
    setIsPublishing(true);
    try {
        await GoogleWorkspace.createAssignment(accessToken, selectedCourse, {
            title: newWork.title,
            description: newWork.desc
        });
        toast.success("Assignment Posted!");
        setNewWork({ title: "", desc: "" });
        handleCourseClick(selectedCourse); // Refresh
    } catch(e) {
        toast.error("Failed to post.");
    } finally {
        setIsPublishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] bg-zinc-950 border-zinc-800 text-white flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f9d58] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Book className="w-8 h-8 text-white" />
            <div>
                <DialogTitle className="text-xl font-bold">Classroom</DialogTitle>
                <p className="text-green-100 text-xs">NetVerse Integration</p>
            </div>
          </div>
          {amITeacher && <div className="bg-white/20 px-3 py-1 rounded font-bold text-xs">FACULTY ACCESS</div>}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-zinc-800 bg-zinc-900 p-4 overflow-y-auto">
            <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Your Courses</h3>
            <div className="space-y-2">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  onClick={() => handleCourseClick(course.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    selectedCourse === course.id ? "bg-green-900/20 border-green-500 text-white" : "bg-zinc-800 border-transparent hover:bg-zinc-700"
                  }`}
                >
                  <div className="font-bold text-sm truncate">{course.name}</div>
                  <div className="text-[10px] text-zinc-400">{course.section}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col bg-black">
             {/* TEACHER CREATE BAR */}
             {amITeacher && selectedCourse && (
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/30 grid gap-2">
                    <span className="text-xs font-bold text-green-400">POST NEW ASSIGNMENT</span>
                    <Input 
                        placeholder="Assignment Title" 
                        value={newWork.title}
                        onChange={(e) => setNewWork({...newWork, title: e.target.value})}
                        className="bg-black h-8 text-xs border-zinc-700"
                    />
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Description (Optional)" 
                            value={newWork.desc}
                            onChange={(e) => setNewWork({...newWork, desc: e.target.value})}
                            className="bg-black h-8 text-xs border-zinc-700"
                        />
                        <Button size="sm" onClick={handleCreateAssignment} disabled={isPublishing} className="h-8 bg-green-600 hover:bg-green-500">
                             {isPublishing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Plus className="w-3 h-3" />}
                             Post
                        </Button>
                    </div>
                </div>
             )}

             {/* ASSIGNMENT LIST */}
             <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {!selectedCourse && <div className="text-zinc-500 text-center mt-10">Select a course to view assignments</div>}
                {assignments.map((work) => (
                  <div key={work.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold hover:underline cursor-pointer" onClick={() => window.open(work.alternateLink, '_blank')}>
                        {work.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 max-w-md truncate">{work.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-xs bg-zinc-800 px-2 py-1 rounded flex items-center gap-1">
                         <Clock className="w-3 h-3" /> Due: {work.dueDate ? `${work.dueDate.day}/${work.dueDate.month}` : 'No Date'}
                       </span>
                       <Button size="sm" variant="outline" onClick={() => window.open(work.alternateLink, '_blank')}>
                         View
                       </Button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
  
}