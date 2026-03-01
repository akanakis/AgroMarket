/**
 * Gemini AI service — SERVER-SIDE ONLY.
 * Uses GEMINI_API_KEY (no NEXT_PUBLIC_ prefix) so it is never bundled into the browser bundle.
 * Client components must call the internal API routes instead:
 *   POST /api/ai/recipe     — recipe suggestions
 *   POST /api/ai/enhance    — product description enhancement
 */
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash';

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
}

export const enhanceProductDescription = async (
  name: string,
  category: string,
  rawDescription: string
): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `You are a professional copywriter for an agricultural marketplace.
Write a short, appetizing, and appealing description (max 2 sentences) for a product.
Product Name: ${name}
Category: ${category}
User Notes: ${rawDescription}

Focus on freshness, local origin, and quality.`;
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text?.trim() || rawDescription;
  } catch {
    return rawDescription;
  }
};

export const generateRecipeSuggestion = async (productName: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `Suggest one simple, delicious recipe idea that features "${productName}" as the main ingredient. Keep it brief (max 50 words). Format it as "Try this: [Recipe Name] - [Brief instruction]".`;
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text?.trim() || "No recipe found.";
  } catch {
    return "Could not generate recipe at this time.";
  }
};
