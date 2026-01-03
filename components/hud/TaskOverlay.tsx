"use client";

import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TaskOverlay() {
  // Mock Data - In real app, this comes from your backend/state
  const tasks = [
    { id: 1, text: "Locate the Mainframe", completed: true },
    { id: 2, text: "Access Terminal & fix Nginx", completed: false },
    { id: 3, text: "Verify connection speed", completed: false },
  ];

  const currentTask = tasks.find(t => !t.completed);

  return (
    <div className="absolute top-4 right-4 z-50 w-80">
      <Card className="bg-slate-900/90 border-slate-700 text-slate-100 p-4 shadow-xl backdrop-blur-md">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-yellow-400 text-sm tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            CURRENT OBJECTIVE
          </h3>
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 text-[10px]">
            LAB-04
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mb-4 overflow-hidden">
          <div 
            className="bg-green-500 h-full transition-all duration-500" 
            style={{ width: '33%' }} 
          />
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className={`flex items-start gap-3 text-sm ${task.completed ? 'opacity-40' : 'opacity-100'}`}>
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500 shrink-0" />
              )}
              <span className={task.completed ? "line-through" : "font-medium"}>
                {task.text}
              </span>
            </div>
          ))}
        </div>

        {/* Hint Footer */}
        {currentTask && (
          <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-400 italic">
            Tip: Walk to the server room in the East Wing.
          </div>
        )}

      </Card>
    </div>
  );
}