import { LucideIcon, Monitor, Coffee, GraduationCap } from "lucide-react";
import { BookOpen, CalendarDays, Sheet } from "lucide-react";

export const GAME_CONFIG = {
  mapWidth: 2400,
  mapHeight: 1600,
  viewportWidth: 900,
  viewportHeight: 600,
  playerSize: 40,
  playerSpeed: 12,
};

export type StationType = "exam" | "server" | "common" | "security" | "dev" | "npc-teacher" | "code-editor" | "classroom" | "calendar" | "sheets";

export interface GameStation {
  id: string;
  label: string;
  type: StationType;
  x: number;
  y: number;
  color?: string;
  icon: LucideIcon;
  description?: string;
  interactionRadius?: number;
  status?: "online" | "available" | "offline";
}

export const STATIONS: GameStation[] = [
  {
    id: "exam-desk-01",
    label: "Exam Station 1",
    type: "exam",
    x: 1850,
    y: 550,
    color: "bg-blue-500",
    icon: Monitor
  },
  {
    id: "cafeteria-table",
    label: "Chill Zone",
    type: "common",
    x: 550,
    y: 535,
    color: "bg-green-500",
    icon: Coffee
  },
  {
    id: "npc-professor",
    label: "Prof. Byte",
    type: "npc-teacher",
    x: 2100, 
    y: 1350, 
    color: "bg-yellow-500",
    icon: GraduationCap,
    description: "Ask for guidance.",
    status: "available" 
  },
  {
    id: "classroom-board",
    label: "Notice Board",
    type: "classroom",
    x: 1400, // Adjust coordinates to fit your map
    y: 500,
    color: "bg-green-600",
    icon: BookOpen,
    description: "Access Google Classroom Assignments"
  },
  {
    id: "campus-calendar",
    label: "Schedule",
    type: "calendar",
    x: 1600,
    y: 500,
    color: "bg-blue-600",
    icon: CalendarDays,
    description: "View Upcoming Lectures & Exams"
  },
  {
    id: "teacher-gradebook",
    label: "Gradebook",
    type: "sheets",
    x: 1750, // Near the teacher desk
    y: 1450,
    color: "bg-emerald-700",
    icon: Sheet,
    interactionRadius: 60,
    description: "Export Grades to Sheets"
  }
];

export const WALLS = [];

// ✅ TEACHER RBAC CONFIG
export const TEACHER_IDS = [
  "bristolrabbit720@gmail.com", 
  "waybooster.pg@gmail.com",
];

export const isTeacher = (email?: string | null) => {
  if (!email) return false;
  return TEACHER_IDS.includes(email);
};