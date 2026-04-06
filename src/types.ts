export enum AttentionLevel {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
  DISTRACTED = "Distracted"
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  attentionScore: number; // 0-100
  lastLevel: AttentionLevel;
  status: "active" | "away" | "sleeping";
  history: { time: string; score: number }[];
}

export interface ClassroomStats {
  averageAttention: number;
  activeStudents: number;
  totalStudents: number;
  attentionTrend: { time: string; score: number }[];
}

export interface AIInsight {
  title: string;
  description: string;
  type: "warning" | "tip" | "success";
}
