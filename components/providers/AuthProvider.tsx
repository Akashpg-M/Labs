// "use client";

// import React, { createContext, useContext, useEffect, useState } from "react";
// import { 
//   User, 
//   onAuthStateChanged, 
//   signInWithPopup, 
//   signOut 
// } from "firebase/auth";
// import { auth, googleProvider } from "@/lib/firebase";

// // 1. Define the Context Shape (Including the login functions!)
// type AuthContextType = {
//   user: User | null;
//   loading: boolean;
//   signInWithGoogle: () => Promise<void>;
//   logout: () => Promise<void>;
// };

// // 2. Create Context with dummy defaults
// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   loading: true,
//   signInWithGoogle: async () => {},
//   logout: async () => {},
// });

// export const useAuth = () => useContext(AuthContext);

// export default function AuthProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   // 3. Define the Actions
//   const signInWithGoogle = async () => {
//     try {
//       await signInWithPopup(auth, googleProvider);
//     } catch (error) {
//       console.error("Login Failed:", error);
//       alert("Login failed. Check console for details.");
//     }
//   };

//   const logout = async () => {
//     try {
//       await signOut(auth);
//     } catch (error) {
//       console.error("Logout Failed:", error);
//     }
//   };

//   // 4. Listen for Auth State Changes
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   // 5. Expose everything
//   return (
//     <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  GoogleAuthProvider 
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  accessToken: string | null; // (+) Store the Google Access Token
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  accessToken: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // (+) ADD SCOPES HERE
      // provider.addScope("https://www.googleapis.com/auth/classroom.courses.readonly");
      // provider.addScope("https://www.googleapis.com/auth/classroom.coursework.me");
      // provider.addScope("https://www.googleapis.com/auth/calendar.events.readonly");
      // provider.addScope("https://www.googleapis.com/auth/spreadsheets.readonly"); // Teacher might need write later

      // Allows creating/editing calendar events
      provider.addScope("https://www.googleapis.com/auth/calendar"); 
      // Allows teachers to manage coursework
      provider.addScope("https://www.googleapis.com/auth/classroom.coursework.students");
      // Allows reading course lists
      provider.addScope("https://www.googleapis.com/auth/classroom.courses.readonly");
      const result = await signInWithPopup(auth, provider);
      
      // (+) Extract Access Token from credential
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        // Persist briefly for session (in real app, use secure storage or refresh tokens)
        sessionStorage.setItem("google_access_token", credential.accessToken);
      }
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAccessToken(null);
      sessionStorage.removeItem("google_access_token");
    } catch (error) {
      console.error("Logout Failed:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Try to recover token from session if page refreshed
      const cachedToken = sessionStorage.getItem("google_access_token");
      if (cachedToken) setAccessToken(cachedToken);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}