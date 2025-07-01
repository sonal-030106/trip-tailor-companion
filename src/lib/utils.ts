import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the first valid JSON array from a string.
 * Throws if not found or not valid.
 */
export function extractJsonArrayFromText(text: string): any[] {
  const match = text.match(/\[.*\]/s);
  if (!match) throw new Error("No valid JSON array found in text.");
  try {
    return JSON.parse(match[0]);
  } catch {
    throw new Error("Extracted text is not valid JSON array.");
  }
}

/**
 * Generates a categorized packing list using Together AI.
 * Accepts trip details and returns the parsed packing list object.
 * Throws on error.
 */
export async function generatePackingListWithAI({
  destination,
  startDate,
  endDate,
  numberOfDays,
  travelCompanion,
  budget,
  transport,
  weather = '',
  preferences = '',
  apiKey,
  model = "mistralai/Mixtral-8x7B-Instruct-v0.1"
}) {
  if (!apiKey || apiKey === "YOUR_TOGETHER_API_KEY") {
    throw new Error("Together AI API key is not configured.");
  }

  // Refined, strict, and concise prompt
  const prompt = `You are a smart travel assistant. Generate a categorized packing list for a trip with the following details:\n\nDestination: ${destination}\nStart Date: ${startDate}\nEnd Date: ${endDate}\nNumber of Days: ${numberOfDays}\nTravel Companion(s): ${travelCompanion}\nBudget: ${budget}\nTransport: ${transport}\nWeather: ${weather}\nPreferences: ${preferences}\n\nRespond ONLY with a single JSON code block, no explanation, and limit each category to 5 items.\n\nFormat: { "categories": [ { "name": "Category Name", "items": ["item1", "item2"] } ] }`;

  console.log("Together AI prompt:", prompt);

  const response = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    }),
  });

  console.log("Together AI response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Together AI API error:", errorText);
    throw new Error(`Together AI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Together AI raw data:", data);

  const content = data.choices?.[0]?.message?.content || "";
  let parsed = null;

  // Try to extract JSON from a code block first
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    try {
      parsed = JSON.parse(codeBlockMatch[1]);
    } catch (e) {
      console.error("JSON parse error from code block:", e, "Content:", codeBlockMatch[1]);
      throw new Error("Failed to parse AI response as JSON from code block.");
    }
  } else {
    // Fallback: Try to extract the first JSON object in the text
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch (e) {
        console.error("JSON parse error:", e, "Content:", match[0]);
        throw new Error("Failed to parse AI response as JSON.");
      }
    } else {
      console.error("No valid JSON found in content:", content);
      throw new Error("AI response did not contain valid JSON.");
    }
  }
  if (!parsed || !parsed.categories) {
    console.error("Parsed JSON missing 'categories':", parsed);
    throw new Error("AI response JSON missing 'categories'.");
  }
  return parsed;
}
