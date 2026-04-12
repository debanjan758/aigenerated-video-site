import { useState } from "react";
import { SocialHandles } from "../types";
import { extractVideoId } from "../utils/clipGenerator";

interface InputStepProps {
  onAnalyze: (url: string, handles: SocialHandles) => void;
}

export default function InputStep({ onAnalyze }: InputStepProps) {
  const [url, setUrl] = useState("");
  const [handles, setHandles] = useState<SocialHandles>({ youtube: "", instagram: "" });
  const [error, setError] = useState("");
  const [urlFocused, setUrlFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a YouTube video URL");
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError("Invalid YouTube URL. Please enter a valid YouTube video link.");
      return;
    }

    if (!handles.youtube.trim() && !handles.instagram.trim()) {
      setError("Please enter at least one social media handle to post clips.");
      return;
    }

    onAnalyze(url, handles);
  };

  const isValidUrl = url.trim() && extractVideoId(url);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Hero content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Badge */}
        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-8">
          <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-purple-300 text-sm font-medium">AI-Powered Viral Clip Engine</span>
          <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full">BETA</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-center text-white leading-[1.05] mb-6 max-w-4xl">
          Turn Any Video Into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-purple-400">
            100 Viral Shorts
          </span>{" "}
          Instantly
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl text-center max-w-2xl mb-12 leading-relaxed">
          Our AI analyzes your YouTube video and identifies the{" "}
          <span className="text-white font-semibold">most viral, copyright-safe moments</span> — then posts them
          directly to your YouTube and Instagram with one click.
        </p>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-12">
          {[
            { value: "100", label: "Clips Generated" },
            { value: "99%", label: "Copyright Safe" },
            { value: "1-Click", label: "Auto-Posting" },
            { value: "10M+", label: "Views Generated" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main form card */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {/* URL Input */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-white font-semibold mb-2.5">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" />
                </svg>
                YouTube Video URL
              </label>
              <div className={`relative flex items-center rounded-2xl border-2 transition-all ${urlFocused ? "border-red-500/60 bg-white/10" : "border-white/10 bg-white/5"}`}>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(""); }}
                  onFocus={() => setUrlFocused(true)}
                  onBlur={() => setUrlFocused(false)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 bg-transparent text-white placeholder-gray-600 px-4 py-3.5 text-sm rounded-2xl outline-none"
                />
                {isValidUrl && (
                  <div className="mr-3 flex items-center gap-1.5 text-green-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-xs mt-1.5 ml-1">Supports youtube.com, youtu.be, and YouTube Shorts links</p>
            </div>

            {/* Social handles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* YouTube handle */}
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-2.5 text-sm">
                  <div className="w-5 h-5 rounded bg-red-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" />
                    </svg>
                  </div>
                  YouTube Channel
                </label>
                <div className="flex items-center rounded-xl border border-white/10 bg-white/5 overflow-hidden focus-within:border-red-500/50">
                  <span className="text-gray-500 px-3 text-sm">@</span>
                  <input
                    type="text"
                    value={handles.youtube}
                    onChange={(e) => setHandles({ ...handles, youtube: e.target.value })}
                    placeholder="yourchannel"
                    className="flex-1 bg-transparent text-white placeholder-gray-600 pr-3 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Instagram handle */}
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-2.5 text-sm">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  Instagram Account
                </label>
                <div className="flex items-center rounded-xl border border-white/10 bg-white/5 overflow-hidden focus-within:border-purple-500/50">
                  <span className="text-gray-500 px-3 text-sm">@</span>
                  <input
                    type="text"
                    value={handles.instagram}
                    onChange={(e) => setHandles({ ...handles, instagram: e.target.value })}
                    placeholder="yourhandle"
                    className="flex-1 bg-transparent text-white placeholder-gray-600 pr-3 py-3 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.99] text-base flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate 100 Viral Clips
            </button>

            <p className="text-center text-gray-600 text-xs mt-4">
              🔒 Copyright-safe • ✅ Platform-compliant • 🚀 AI-optimized for virality
            </p>
          </form>
        </div>

        {/* Features row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full max-w-3xl">
          {[
            {
              icon: "🛡️",
              title: "Copyright Shield",
              desc: "AI detects and avoids music, footage, and content that triggers content ID claims",
            },
            {
              icon: "🤖",
              title: "Viral Score AI",
              desc: "Each clip is scored on hook strength, shareability, and retention potential",
            },
            {
              icon: "⚡",
              title: "One-Click Posting",
              desc: "Post any clip instantly to YouTube Shorts and Instagram Reels simultaneously",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/3 border border-white/8 rounded-2xl p-5 hover:bg-white/5 transition-colors"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-white font-semibold text-sm mb-1">{f.title}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
