export const nuData = {
  studentPopulation: 20000,
  facultyStaff: 4000,
  avgQueriesPerPersonPerDay: 8,
  energyPerQueryKwh: 0.003,
  co2PerKwhKg: 0.386,
  semesterStartDate: "2026-01-13",
};

export const totalUsers = nuData.studentPopulation + nuData.facultyStaff;

export type AITool = {
  name: string;
  category: string;
  energyPerUseKwh: number;
  estimatedDailyUsersPercent: number;
  description: string;
  color: string;
};

export const aiTools: AITool[] = [
  {
    name: "ChatGPT",
    category: "Writing",
    energyPerUseKwh: 0.003,
    estimatedDailyUsersPercent: 65,
    description: "General-purpose text generation, writing assistance, and Q&A",
    color: "#10b981",
  },
  {
    name: "Claude",
    category: "Writing / Research",
    energyPerUseKwh: 0.002,
    estimatedDailyUsersPercent: 35,
    description: "Long-context research assistance, summarization, and analysis",
    color: "#6366f1",
  },
  {
    name: "GitHub Copilot",
    category: "Coding",
    energyPerUseKwh: 0.004,
    estimatedDailyUsersPercent: 40,
    description: "AI-powered code completion and pair programming in IDEs",
    color: "#f59e0b",
  },
  {
    name: "Midjourney",
    category: "Image",
    energyPerUseKwh: 0.02,
    estimatedDailyUsersPercent: 15,
    description: "Text-to-image generation for creative and design projects",
    color: "#ec4899",
  },
  {
    name: "Grammarly",
    category: "Writing",
    energyPerUseKwh: 0.001,
    estimatedDailyUsersPercent: 55,
    description: "Inline grammar checking, tone analysis, and writing suggestions",
    color: "#14b8a6",
  },
  {
    name: "Google Gemini",
    category: "Research",
    energyPerUseKwh: 0.003,
    estimatedDailyUsersPercent: 25,
    description: "Multimodal research assistant integrated with Google Workspace",
    color: "#3b82f6",
  },
  {
    name: "Perplexity",
    category: "Research",
    energyPerUseKwh: 0.002,
    estimatedDailyUsersPercent: 20,
    description: "AI-powered search engine with cited, real-time answers",
    color: "#8b5cf6",
  },
  {
    name: "Whisper / Speech Tools",
    category: "Audio",
    energyPerUseKwh: 0.005,
    estimatedDailyUsersPercent: 10,
    description: "Automatic speech recognition and audio transcription",
    color: "#f97316",
  },
];

export function calcDailyCO2Kg(tool: AITool): number {
  const dailyUsers = Math.round(totalUsers * (tool.estimatedDailyUsersPercent / 100));
  const dailyQueries = dailyUsers * nuData.avgQueriesPerPersonPerDay;
  const dailyKwh = dailyQueries * tool.energyPerUseKwh;
  return dailyKwh * nuData.co2PerKwhKg;
}

export function calcTotalDailyCO2Kg(): number {
  return aiTools.reduce((sum, tool) => sum + calcDailyCO2Kg(tool), 0);
}

export function calcSemesterCO2Kg(): number {
  const start = new Date(nuData.semesterStartDate);
  const now = new Date();
  const days = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
  return calcTotalDailyCO2Kg() * days;
}
