import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

export const enhanceProductDescription = async (
  name: string,
  category: string,
  rawDescription: string
): Promise<string> => {
  if (!apiKey) return rawDescription;

  try {
    const prompt = `
      You are a professional copywriter for an agricultural marketplace.
      Write a short, appetizing, and appealing description (max 2 sentences) for a product.
      Product Name: ${name}
      Category: ${category}
      User Notes: ${rawDescription}
      
      Focus on freshness, local origin, and quality.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return rawDescription; // Fallback to original
  }
};

export const generateRecipeSuggestion = async (productName: string): Promise<string> => {
  if (!apiKey) return "API Key missing. Cannot generate recipe.";

  try {
    const prompt = `
      Suggest one simple, delicious recipe idea that features "${productName}" as the main ingredient. 
      Keep it brief (max 50 words). Format it as "Try this: [Recipe Name] - [Brief instruction]".
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate recipe at this time.";
  }
};
