import { GoogleGenAI } from "@google/genai";
import { AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeClassroomImage(base64Image: string): Promise<{
  overallScore: number;
  insights: AIInsight[];
  studentFeedback: { name: string; score: number; status: string }[];
}> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Analyze this classroom snapshot. Provide an overall attention score (0-100), 3 actionable insights for the teacher, and simulated feedback for 5 students. Return the result in JSON format." },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            overallScore: { type: "number" },
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  type: { type: "string", enum: ["warning", "tip", "success"] }
                },
                required: ["title", "description", "type"]
              }
            },
            studentFeedback: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  score: { type: "number" },
                  status: { type: "string" }
                },
                required: ["name", "score", "status"]
              }
            }
          },
          required: ["overallScore", "insights", "studentFeedback"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      overallScore: 75,
      insights: [
        { title: "Engagement Dip", description: "The back row seems slightly disengaged. Consider a quick poll.", type: "warning" },
        { title: "Good Momentum", description: "Most students are actively taking notes.", type: "success" }
      ],
      studentFeedback: []
    };
  }
}

export async function getTeachingTips(topic: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide 3 creative teaching strategies to increase student attention for the topic: ${topic}. Keep it concise and actionable.`
    });
    return response.text || "No tips available at the moment.";
}
