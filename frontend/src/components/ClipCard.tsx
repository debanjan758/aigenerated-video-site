import { useState } from "react";
import { Clip, SocialHandles } from "../types";

interface ClipCardProps {
  clip: Clip;
  index: number;
  handles: SocialHandles;
  onPost: (clipId: string, platform: "youtube" | "instagram" | "both") => void;
  videoId: string;
}

const categoryColors: Record<string, string> = {
  Hook: "bg-red-500/20 text-red-300 border-red-500/30",
  Funny: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Emotional: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Educational: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Trending: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Motivational: "bg-green-500/20 text-green-300 border-green-500/30",
};

const copyrightColors: Record<string, string> = {
  Safe: "text-green-400 bg-green-500/10 border-green-500/20",
  "Low Risk": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "Medium Risk": "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

const copyrightIcons: Record<string, string> = {
  Safe: "🛡️",
  "Low Risk": "⚠️",
  "Medium Risk": "🔶",
};

function ScoreBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-400 font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ClipCard({ clip, index, handles, onPost, videoId }: ClipCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState<string[]>([]);

  const handlePost = async (platform: "youtube" | "instagram" | "both") => {
    setPosting(platform);
    await new Promise((r) => setTimeout(r, 1500));
    setPosting(null);
    const platforms = platform === "both" ? ["youtube", "instagram"] : [platform];
    setPostSuccess((prev) => [...new Set([...prev, ...platforms])]);
    onPost(clip.id, platform);
  };

  const youtubeWatchUrl = `https://youtube.com/watch?v=${videoId}&t=${clip.startTime.replace(":", "m")}s`;

  return (
    <div className={`group bg-white/3 hover:bg-white/6 border rounded-2xl overflow-hidden transition-all duration-300 ${
      expanded ? "border-purple-500/30 bg-white/6" : "border-white/8 hover:border-white/15"
    }`}>
      {/* Top section */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Rank & thumbnail */}
          <div className="flex-shrink-0">
            <div className={`w-16 h-24 rounded-xl bg-gradient-to-br ${clip.thumbnail} relative overflow-hidden shadow-lg`}>
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Duration badge */}
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1 rounded">
                {clip.duration}
              </div>
              {/* Rank */}
              <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-black px-1.5 rounded">
                #{index + 1}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-white text-sm font-semibold leading-snug line-clamp-2">{clip.title}</h3>
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 bg-gradient-to-r from-red-500/20 to-purple-500/20 border border-red-500/20 rounded-lg px-2 py-1">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-white font-black text-sm">{clip.viralScore}</span>
                </div>
              </div>
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${categoryColors[clip.category] || categoryColors["Hook"]}`}>
                {clip.category}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${copyrightColors[clip.copyrightRisk]}`}>
                {copyrightIcons[clip.copyrightRisk]} {clip.copyrightRisk}
              </span>
            </div>

            {/* Time + Views */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {clip.startTime} – {clip.endTime}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                ~{clip.engagement.estimatedViews} est. views
              </span>
            </div>
          </div>
        </div>

        {/* Post buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {/* Download button */}
          {clip.downloadUrl ? (
            <a
              href={clip.downloadUrl}
              download={`${clip.id}.mp4`}
              className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-300 hover:text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
              </svg>
              Download MP4
            </a>
          ) : (
            <div
              title="Encoding failed for this clip"
              className="flex items-center gap-1.5 bg-gray-500/10 border border-gray-500/20 text-gray-400 text-xs font-semibold px-3 py-1.5 rounded-xl opacity-50 cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
              </svg>
              Encoding Failed
            </div>
          )}
          {/* Posted indicators */}
          {postSuccess.includes("youtube") ? (
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-xl">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Posted to YouTube
            </div>
          ) : (
            <button
              onClick={() => handlePost("youtube")}
              disabled={posting !== null}
              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-300 hover:text-red-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting === "youtube" ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <path className="opacity-25" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" />
                </svg>
              )}
              {handles.youtube ? `Post @${handles.youtube}` : "Post to YouTube"}
            </button>
          )}

          {postSuccess.includes("instagram") ? (
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-xl">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Posted to Instagram
            </div>
          ) : (
            <button
              onClick={() => handlePost("instagram")}
              disabled={posting !== null}
              className="flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-purple-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting === "instagram" ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <path className="opacity-25" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              )}
              {handles.instagram ? `Post @${handles.instagram}` : "Post to Instagram"}
            </button>
          )}

          {!postSuccess.includes("youtube") && !postSuccess.includes("instagram") && (
            <button
              onClick={() => handlePost("both")}
              disabled={posting !== null}
              className="flex items-center gap-1.5 bg-gradient-to-r from-red-500/20 to-purple-500/20 hover:from-red-500/30 hover:to-purple-500/30 border border-white/10 hover:border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting === "both" ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <path className="opacity-25" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              Post Everywhere
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto flex items-center gap-1 text-gray-600 hover:text-gray-400 text-xs transition-colors"
          >
            {expanded ? "Less" : "Details"}
            <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded detail section */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-4">
          {/* Why viral */}
          <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-base">💡</span>
              <div>
                <div className="text-purple-300 text-xs font-semibold mb-0.5">Why This Goes Viral</div>
                <p className="text-gray-400 text-xs leading-relaxed">{clip.reason}</p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-2.5 mb-4">
            <ScoreBar value={clip.engagement.hookStrength} label="Hook Strength" color="bg-red-500" />
            <ScoreBar value={clip.engagement.shareability} label="Shareability" color="bg-purple-500" />
            <ScoreBar value={clip.engagement.retention} label="Retention Rate" color="bg-blue-500" />
          </div>

          {/* Hashtags */}
          <div className="mb-4">
            <div className="text-gray-500 text-xs mb-2">Recommended Hashtags</div>
            <div className="flex flex-wrap gap-1.5">
              {clip.hashtags.map((tag) => (
                <span key={tag} className="bg-white/5 text-gray-400 text-xs px-2 py-0.5 rounded-lg">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Watch on YouTube link */}
          <a
            href={youtubeWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" />
            </svg>
            Preview on YouTube at {clip.startTime}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
