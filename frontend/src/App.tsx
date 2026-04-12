import { useState, useCallback } from "react";
import { Clip, SocialHandles, Step, VideoInfo } from "./types";
import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import InputStep from "./components/InputStep";
import AnalyzingStep from "./components/AnalyzingStep";
import ResultsStep from "./components/ResultsStep";

const API_BASE = "http://localhost:3001";

export default function App() {
  const [step, setStep] = useState<Step>("input");
  const [videoUrl, setVideoUrl] = useState("");
  const [handles, setHandles] = useState<SocialHandles>({ youtube: "", instagram: "" });
  const [clips, setClips] = useState<Clip[]>([]);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  const handleAnalyze = useCallback((url: string, socialHandles: SocialHandles) => {
    setVideoUrl(url);
    setHandles(socialHandles);
    setStep("analyzing");
  }, []);

  const handleAnalysisComplete = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: videoUrl,
          handles,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate clips");
      }

      setVideoInfo(data.videoInfo);
      setClips(data.clips);
      setStep("results");
    } catch (error) {
      console.error("Analysis failed:", error);
      alert(error instanceof Error ? error.message : "Something went wrong while generating clips.");
      setStep("input");
    }
  }, [videoUrl, handles]);

  const handleReset = useCallback(() => {
    setStep("input");
    setVideoUrl("");
    setHandles({ youtube: "", instagram: "" });
    setClips([]);
    setVideoInfo(null);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <HeroSection>
        <Navbar onReset={handleReset} />

        {step === "input" && <InputStep onAnalyze={handleAnalyze} />}

        {step === "analyzing" && (
          <AnalyzingStep onComplete={handleAnalysisComplete} videoUrl={videoUrl} />
        )}

        {step === "results" && videoInfo && (
          <ResultsStep
            clips={clips}
            videoInfo={videoInfo}
            handles={handles}
            videoUrl={videoUrl}
          />
        )}
      </HeroSection>

      {step === "results" && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex flex-col gap-2 items-end">
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
              <div className="flex flex-col gap-1">
                {handles.youtube && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 15V9l5.2 3-5.2 3z" />
                      </svg>
                    </div>
                    <span className="text-white text-xs font-medium">@{handles.youtube}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  </div>
                )}
                {handles.instagram && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                    <span className="text-white text-xs font-medium">@{handles.instagram}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  </div>
                )}
              </div>
              <div className="text-gray-600 text-xs border-l border-white/10 pl-3">
                Connected
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}