// FILE: components/modals/GradeSheetWindow.tsx
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sheet, Loader2, CheckCircle, Lock } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { GoogleWorkspace } from "@/lib/google-workspace";
import { toast } from "sonner";
import { isTeacher } from "@/lib/game-config";

interface GradeSheetWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GradeSheetWindow({ isOpen, onClose }: GradeSheetWindowProps) {
  const { accessToken, user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);

  // 1. RBAC Check (Extra safety, though Manager handles it)
  if (!isTeacher(user?.email)) {
    return null; 
  }

  const handleSync = async () => {
    if (!accessToken) return;
    setIsSyncing(true);

    try {
      // A. Create the Sheet
      const dateStr = new Date().toLocaleDateString();
      const sheetData = await GoogleWorkspace.createSheet(accessToken, `NetVerse Gradebook - ${dateStr}`);
      const spreadsheetId = sheetData.spreadsheetId;

      if (!spreadsheetId) throw new Error("Failed to create sheet");

      // B. Mock Data (In a real app, you'd fetch this from your Firebase DB)
      const mockGameData = [
        ["Student ID", "Name", "Modules Completed", "Avg Score", "Status"], // Headers
        ["S-101", "Alice", "4/5", "92%", "Online"],
        ["S-102", "Bob", "2/5", "78%", "Idle"],
        ["S-103", "Charlie", "5/5", "98%", "Coding"],
        ["S-104", "Dave", "3/5", "85%", "Offline"],
      ];

      // C. Append Data
      await GoogleWorkspace.appendDataToSheet(accessToken, spreadsheetId, mockGameData);

      setSheetUrl(sheetData.spreadsheetUrl);
      toast.success("Gradebook synced successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Sync failed. Check console.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="bg-zinc-950 text-white border-zinc-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-400">
            <Sheet className="w-5 h-5" /> Faculty Gradebook
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Sync student performance data directly to your Google Workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center gap-4">
            {!sheetUrl ? (
                <div className="text-center space-y-4">
                    <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
                        <p className="text-sm text-emerald-200 mb-2">Ready to export session data.</p>
                        <ul className="text-xs text-zinc-500 text-left space-y-1 list-disc pl-4">
                            <li>Exports Active Player List</li>
                            <li>Syncs Completion Status</li>
                            <li>Timestamps current session</li>
                        </ul>
                    </div>
                    <Button 
                        onClick={handleSync} 
                        disabled={isSyncing}
                        className="bg-emerald-600 hover:bg-emerald-500 w-full font-bold"
                    >
                        {isSyncing ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Sheet className="w-4 h-4 mr-2"/>}
                        Sync Data to Sheets
                    </Button>
                </div>
            ) : (
                <div className="text-center space-y-4 w-full">
                    <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-sm text-zinc-300">Spreadsheet created successfully.</p>
                    <Button 
                        variant="outline" 
                        onClick={() => window.open(sheetUrl, "_blank")}
                        className="w-full border-zinc-700 hover:bg-zinc-800"
                    >
                        Open in Google Sheets
                    </Button>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}