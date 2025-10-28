import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalyticsData, Application } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let ai: GoogleGenerativeAI | null = null;

if (apiKey) {
  ai = new GoogleGenerativeAI(apiKey);
}

export const generateReportSummary = async (
  reportOptions: { includeAnalytics: boolean; includeApplications: boolean; includeStreamerList: boolean; },
  analyticsData: AnalyticsData,
  applications: Application[]
): Promise<string> => {

  if (!ai) {
    return "The AI summary feature is not configured. Please set the VITE_GEMINI_API_KEY environment variable.";
  }

  let prompt = 'Generate a concise, professional summary for a tournament report based on the following data. The summary should be positive and suitable for sponsors. Use markdown for formatting.\n\n';

  if (reportOptions.includeAnalytics) {
    prompt += `**Analytics Data:**\n`;
    prompt += `- Peak Viewers: ${analyticsData.maxViewers.toLocaleString()}\n`;
    prompt += `- Current Viewers: ${analyticsData.currentViewers.toLocaleString()}\n`;
    prompt += `- Live Streamers: ${analyticsData.liveStreamersCount}\n\n`;
  }
  
  if (reportOptions.includeApplications) {
    prompt += `**Application Data:**\n`;
    prompt += `- Total Applications: ${applications.length}\n`;
    prompt += `- Approved Applications: ${applications.filter(a => a.status === 'Approved').length}\n`;
    prompt += `- Pending Applications: ${applications.filter(a => a.status === 'Pending').length}\n`;
    prompt += `- Rejected Applications: ${applications.filter(a => a.status === 'Rejected').length}\n\n`;
  }

  if (reportOptions.includeStreamerList) {
      prompt += `**Approved Streamers:**\n`;
      prompt += `Total approved streamers: ${analyticsData.approvedStreamers}. These streamers represent various languages and communities, broadening the tournament's reach.`
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
};
