import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const MODEL_NAME = 'gemini-2.5-flash';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ suggestion: null }, { status: 503 });
  }

  let productName: string;
  try {
    const body = await req.json();
    productName = String(body.productName || '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!productName || productName.length > 200) {
    return NextResponse.json({ error: 'Invalid product name' }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Suggest one simple, delicious recipe idea that features "${productName}" as the main ingredient. Keep it brief (max 50 words). Format it as "Try this: [Recipe Name] - [Brief instruction]".`;
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return NextResponse.json({ suggestion: response.text?.trim() || null });
  } catch {
    return NextResponse.json({ suggestion: null }, { status: 500 });
  }
}
