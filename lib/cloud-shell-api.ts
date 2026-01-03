// lib/cloud-shell-api.ts

// 🔴 TODO: Replace with your actual ngrok URL from your VM terminal
const API_BASE_URL = "https://unthrown-clemently-isabella.ngrok-free.dev";

const headers = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
};

export interface CloudFile {
  name: string;
  size: number;
  updatedAt: string;
}

export const CloudAPI = {
  // 1. Run Code
  execute: async (code: string, language: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/execute`, {
        method: "POST",
        headers,
        body: JSON.stringify({ code, language }),
      });
      return await res.json();
    } catch (err) {
      return { output: "⚠️ Network Error: Could not connect to Cloud Shell.", isError: true };
    }
  },

  // 2. Save File
  saveFile: async (email: string, filename: string, code: string) => {
    const res = await fetch(`${API_BASE_URL}/save`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, filename, code }),
    });
    return await res.json();
  },

  // 3. List Files
  listFiles: async (email: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/files?email=${encodeURIComponent(email)}`, {
        method: "GET",
        headers,
      });
      return await res.json();
    } catch (err) {
      return { files: [] };
    }
  },

  // 4. Read File
  readFile: async (email: string, filename: string) => {
    const res = await fetch(
      `${API_BASE_URL}/read?email=${encodeURIComponent(email)}&filename=${encodeURIComponent(filename)}`,
      { method: "GET", headers }
    );
    return await res.json();
  }
};