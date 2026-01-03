import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { code, error } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a helpful Teaching Assistant for a computer science student.
      The student has the following code:
      ${code}

      They received this output/error:
      ${error}

      Please provide a SHORT, one-sentence hint on how to fix it. Do not give the full answer code.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const hint = response.text();

    return NextResponse.json({ hint });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ hint: "AI is currently offline." }, { status: 500 });
  }
}