// // Helper to fetch data from Google APIs
// export const GoogleWorkspace = {
//   // 1. CLASSROOM
//   getCourses: async (token: string) => {
//     const res = await fetch("https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE", {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return await res.json();
//   },

//   getCourseWork: async (token: string, courseId: string) => {
//     const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return await res.json();
//   },

//   // 2. CALENDAR
//   getEvents: async (token: string) => {
//     // Get events for the next 7 days
//     const now = new Date().toISOString();
//     const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
//     const res = await fetch(
//       `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${nextWeek}&orderBy=startTime&singleEvents=true`, 
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     return await res.json();
//   },

//   // 3. SHEETS (For Teacher Gradebook export)
//   readSheet: async (token: string, spreadsheetId: string, range: string) => {
//     const res = await fetch(
//       `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     return await res.json();
//   },

//   createEvent: async (token: string, event: { summary: string; description: string; start: string; end: string }) => {
//     const res = await fetch(
//       `https://www.googleapis.com/calendar/v3/calendars/primary/events`, 
//       { 
//         method: "POST",
//         headers: { 
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           summary: event.summary,
//           description: event.description,
//           start: { dateTime: event.start },
//           end: { dateTime: event.end }
//         })
//       }
//     );
//     return await res.json();
//   },

//   // 🟢 NEW: Create Coursework (Assignment)
//   createAssignment: async (token: string, courseId: string, work: { title: string; description: string }) => {
//     const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
//       method: "POST",
//       headers: { 
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         title: work.title,
//         description: work.description,
//         workType: "ASSIGNMENT",
//         state: "PUBLISHED", // Immediately publish
//       })
//     });
//     return await res.json();
//   }
// };

// FILE: lib/google-workspace.ts

export const GoogleWorkspace = {
  // --- 1. CLASSROOM ---
  getCourses: async (token: string) => {
    const res = await fetch("https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  },

  getCourseWork: async (token: string, courseId: string) => {
    const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  },

  createAssignment: async (token: string, courseId: string, work: { title: string; description: string }) => {
    const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: work.title,
        description: work.description,
        workType: "ASSIGNMENT",
        state: "PUBLISHED",
      })
    });
    return await res.json();
  },

  // --- 2. CALENDAR ---
  getEvents: async (token: string) => {
    const now = new Date().toISOString();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${nextWeek}&orderBy=startTime&singleEvents=true`, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return await res.json();
  },

  createEvent: async (token: string, event: { summary: string; description: string; start: string; end: string }) => {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events`, 
      { 
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description,
          start: { dateTime: event.start },
          end: { dateTime: event.end }
        })
      }
    );
    return await res.json();
  },

  // --- 3. SHEETS (TEACHER ONLY) ---
  createSheet: async (token: string, title: string) => {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        properties: { title: title }
      })
    });
    return await res.json();
  },

  appendDataToSheet: async (token: string, spreadsheetId: string, values: string[][]) => {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ values: values })
      }
    );
    return await res.json();
  }
};