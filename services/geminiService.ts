import { GoogleGenAI, Type } from "@google/genai";
import { TerrainAnalysis } from "../types";

// Fix: Creating the GoogleGenAI instance right before the API call to ensure it uses the latest API key.
export async function getGeographicAnalysis(lat: number, lng: number, elevation: number): Promise<TerrainAnalysis> {
  // Fix: Adhering to strict initialization rule: const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze this specific location in Europe: Latitude ${lat}, Longitude ${lng}, Elevation ${elevation} meters. 
  Provide a detailed geographical report including the name of the area, typical terrain features (mountains, polders, valleys), 
  the climate zone, and one interesting topographic fact.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          elevation: { type: Type.NUMBER },
          locationName: { type: Type.STRING },
          geographicalFeatures: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          climateZone: { type: Type.STRING },
          notableFacts: { type: Type.STRING }
        },
        required: ["elevation", "locationName", "geographicalFeatures", "climateZone", "notableFacts"]
      }
    }
  });

  // Fix: Correctly access the .text property (not a method) from GenerateContentResponse
  const jsonStr = response.text;
  if (!jsonStr) {
    throw new Error("No response from AI analysis.");
  }

  return JSON.parse(jsonStr.trim()) as TerrainAnalysis;
}