export interface Clip {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: string;
  viralScore: number;
  reason: string;
  hashtags: string[];
  thumbnail: string;
  category: string;
  copyrightRisk: "Safe" | "Low Risk" | "Medium Risk";
  engagement: {
    estimatedViews: string;
    shareability: number;
    hookStrength: number;
    retention: number;
  };
  posted?: {
    youtube?: boolean;
    instagram?: boolean;
  };
  downloadUrl?: string | null;
}

export interface SocialHandles {
  youtube: string;
  instagram: string;
}

export interface VideoInfo {
  title: string;
  channel: string;
  duration: string;
  thumbnailUrl: string;
  videoId: string;
}

export type Step = "input" | "analyzing" | "results";
export type FilterCategory = "All" | "Hook" | "Funny" | "Emotional" | "Educational" | "Trending" | "Motivational";
export type SortOption = "viralScore" | "duration" | "hookStrength" | "retention";
