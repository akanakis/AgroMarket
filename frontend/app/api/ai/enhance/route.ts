import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const MODEL_NAME = 'gemini-2.5-flash';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ description: null }, { status: 503 });
  }

  let name: string, category: string, rawDescription: string;
  try {
    const body = await req.json();
    name = String(body.name || '').trim();
    category = String(body.category || '').trim();
    rawDescription = String(body.rawDescription || '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!name || name.length > 200 || !category || !rawDescription || rawDescription.length > 5000) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a professional copywriter for an agricultural marketplace. Write a short, appetizing, and appealing description (max 2 sentences) for a product.\nProduct Name: ${name}\nCategory: ${category}\nUser Notes: ${rawDescription}\n\nFocus on freshness, local origin, and quality.`;
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return NextResponse.json({ description: response.text?.trim() || null });
  } catch {
    return NextResponse.json({ description: null }, { status: 500 });
  }
}
