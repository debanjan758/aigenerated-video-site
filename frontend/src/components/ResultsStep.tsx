import { useState, useMemo } from "react";
import { Clip, FilterCategory, SocialHandles, SortOption, VideoInfo } from "../types";
import ClipCard from "./ClipCard";

interface ResultsStepProps {
  clips: Clip[];
  videoInfo: VideoInfo;
  handles: SocialHandles;
  videoUrl: string;
}

const filterCategories: FilterCategory[] = ["All", "Hook", "Funny", "Emotional", "Educational", "Trending", "Motivational"];

export default function ResultsStep({ clips, videoInfo, handles, videoUrl }: ResultsStepProps) {
  const [filter, setFilter] = useState<FilterCategory>("All");
  const [sort, setSort] = useState<SortOption>("viralScore");
  const [search, setSearch] = useState("");
  const [copyrightFilter, setCopyrightFilter] = useState<string>("All");
  const [postingAll, setPostingAll] = useState(false);
  const [postedClips, setPostedClips] = useState<Record<string, string[]>>({});
  const [allPostedSuccess, setAllPostedSuccess] = useState(false);
  const [bulkPostProgress, setBulkPostProgress] = useState(0);

  const filtered = useMemo(() => {
    let result = [...clips];

    if (filter !== "All") {
      result = result.filter((c) => c.category === filter);
    }
    if (copyrightFilter !== "All") {
      result = result.filter((c) => c.copyrightRisk === copyrightFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.reason.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sort === "viralScore") return b.viralScore - a.viralScore;
      if (sort === "duration") return parseInt(a.duration) - parseInt(b.duration);
      if (sort === "hookStrength") return b.engagement.hookStrength - a.engagement.hookStrength;
      if (sort === "retention") return b.engagement.retention - a.engagement.retention;
      return 0;
    });

    return result;
  }, [clips, filter, copyrightFilter, search, sort]);

  const handlePost = (clipId: string, platform: "youtube" | "instagram" | "both") => {
    const platforms = platform === "both" ? ["youtube", "instagram"] : [platform];
    setPostedClips((prev) => ({
      ...prev,
      [clipId]: [...new Set([...(prev[clipId] || []), ...platforms])],
    }));
  };

  const handlePostAll = async () => {
    setPostingAll(true);
    setBulkPostProgress(0);
    const total = filtered.length;
    for (let i = 0; i < total; i++) {
      await new Promise((r) => setTimeout(r, 30));
      setBulkPostProgress(Math.round(((i + 1) / total) * 100));
      handlePost(filtered[i].id, "both");
    }
    setPostingAll(false);
    setAllPostedSuccess(true);
  };

  const totalPosted = Object.keys(postedClips).length;
  const avgViralScore = Math.round(clips.reduce((a, c) => a + c.viralScore, 0) / clips.length);
  const safeClips = clips.filter((c) => c.copyrightRisk === "Safe").length;

  return (
    <div className="min-h-[calc(100vh-64px)] pb-16">
      {/* Top banner */}
      <div className="border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Video info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="text-white font-bold text-base line-clamp-1">{videoInfo.title}</h2>
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                  <span>{videoInfo.channel}</span>
                  <span>•</span>
                  <span>{videoInfo.duration}</span>
                  <span>•</span>
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 flex items-center gap-1">
                    View Source
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Clips Ready", value: clips.length.toString(), icon: "🎬" },
                { label: "Avg Viral Score", value: `${avgViralScore}/99`, icon: "🔥" },
                { label: "Copyright Safe", value: `${safeClips}`, icon: "🛡️" },
                { label: "Posted", value: totalPosted.toString(), icon: "✅" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl px-4 py-2.5 text-center min-w-[80px]">
                  <div className="text-lg">{s.icon}</div>
                  <div className="text-white font-black text-base">{s.value}</div>
                  <div className="text-gray-600 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Post All Banner */}
        {!allPostedSuccess ? (
          <div className="bg-gradient-to-r from-red-500/10 to-purple-600/10 border border-white/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-2xl">🚀</div>
              <div>
                <div className="text-white font-bold text-sm">Post All {filtered.length} Clips at Once</div>
                <div className="text-gray-500 text-xs">
                  Publish every clip to {handles.youtube && `@${handles.youtube} (YouTube)`}
                  {handles.youtube && handles.instagram && " & "}
                  {handles.instagram && `@${handles.instagram} (Instagram)`} simultaneously
                </div>
              </div>
            </div>
            {postingAll ? (
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-purple-500 rounded-full transition-all" style={{ width: `${bulkPostProgress}%` }} />
                </div>
                <span className="text-white text-sm font-bold">{bulkPostProgress}%</span>
              </div>
            ) : (
              <button
                onClick={handlePostAll}
                className="flex-shrink-0 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-red-500/20 text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Post All Now
              </button>
            )}
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-green-300 font-bold text-sm">🎉 All {clips.length} clips posted successfully!</div>
              <div className="text-green-500/70 text-xs">Your content is live and reaching audiences now.</div>
            </div>
          </div>
        )}

        {/* Filters & controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex-1">
            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clips..."
              className="bg-transparent text-white placeholder-gray-600 text-sm outline-none flex-1"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-white/5 border border-white/10 text-gray-300 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
          >
            <option value="viralScore">Sort: Viral Score</option>
            <option value="hookStrength">Sort: Hook Strength</option>
            <option value="retention">Sort: Retention</option>
            <option value="duration">Sort: Duration</option>
          </select>

          {/* Copyright filter */}
          <select
            value={copyrightFilter}
            onChange={(e) => setCopyrightFilter(e.target.value)}
            className="bg-white/5 border border-white/10 text-gray-300 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
          >
            <option value="All">Copyright: All</option>
            <option value="Safe">Safe Only</option>
            <option value="Low Risk">Low Risk</option>
            <option value="Medium Risk">Medium Risk</option>
          </select>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterCategories.map((cat) => {
            const count = cat === "All" ? clips.length : clips.filter((c) => c.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === cat
                    ? "bg-gradient-to-r from-red-500 to-purple-600 text-white shadow-lg shadow-red-500/20"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                {cat}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === cat ? "bg-white/20" : "bg-white/10"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500 text-sm">
            Showing <span className="text-white font-semibold">{filtered.length}</span> clips
            {filter !== "All" && ` in ${filter}`}
          </p>
          {totalPosted > 0 && (
            <div className="flex items-center gap-1.5 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {totalPosted} posted
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 bg-yellow-500/5 border border-yellow-500/15 rounded-xl px-4 py-3 mb-4">
          <span className="text-yellow-400 text-sm flex-shrink-0 mt-0.5">⚠️</span>
          <p className="text-yellow-500/80 text-xs leading-relaxed">
            <strong className="text-yellow-400">Demo Mode:</strong> This is a UI prototype showcasing the full workflow. In production, the AI engine would use your video's actual transcript, audio fingerprinting, and Content ID database to generate real clips and connect to official YouTube & Instagram APIs for posting.
          </p>
        </div>

        {/* Clips grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-white font-semibold mb-1">No clips found</div>
            <div className="text-gray-500 text-sm">Try changing your filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((clip) => (
              <ClipCard
                key={clip.id}
                clip={clip}
                index={clips.indexOf(clip)}
                handles={handles}
                onPost={handlePost}
                videoId={videoInfo.videoId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
