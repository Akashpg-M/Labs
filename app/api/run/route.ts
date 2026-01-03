import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Get the code and language from the frontend
    const { code, language } = await req.json();

    // 2. Point to your Custom Express Backend (via ngrok)
    const BACKEND_URL = "http://unthrown-clemently-isabella.ngrok-free.dev/execute";

    // 3. Send the request to the backend
    // Your Express server expects JSON: { "code": "...", "language": "..." }
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code,
        language: language, 
      }),
    });

    // 4. Get the result
    // Your Express server returns: { output, isError, executionTime }
    const result = await response.json();

    // 5. Return it to the frontend
    if (response.ok) {
        return NextResponse.json(result);
    } else {
        // Handle cases where the Express server returns a 400/500 error explicitly
        return NextResponse.json(
            { output: result.output || "Execution failed.", isError: true }, 
            { status: response.status }
        );
    }

  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json(
        { output: "Internal Server Error: Could not reach the execution engine." }, 
        { status: 500 }
    );
  }
}