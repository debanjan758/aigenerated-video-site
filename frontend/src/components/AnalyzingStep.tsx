import { useEffect, useState } from "react";

interface AnalyzingStepProps {
  onComplete: () => void;
  videoUrl: string;
}

const steps = [
  { label: "Fetching video information", detail: "Reading video metadata..." },
  { label: "Downloading video file", detail: "This may take a moment..." },
  { label: "Analyzing video content", detail: "Running AI analysis..." },
  { label: "Generating viral clips", detail: "Creating short-form videos..." },
  { label: "Calculating metrics", detail: "Scoring viral potential..." },
  { label: "Preparing results", detail: "Your clips are almost ready..." },
];

export default function AnalyzingStep({ onComplete, videoUrl }: AnalyzingStepProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate progress while waiting for API
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Limit progress to 95% until API completes
        if (prev >= 95) return 95;
        return prev + Math.random() * 15;
      });
    }, 500);

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    // Call onComplete after initial delay (API will handle the actual work)
    const callTimer = setTimeout(() => {
      setProgress(100);
      setCurrentStep(steps.length - 1);
      clearInterval(progressInterval);
      clearInterval(stepTimer);
      onComplete();
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepTimer);
      clearTimeout(callTimer);
    };
  }, [onComplete]);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-black text-white mb-2">Analysis Failed</h2>
            <p className="text-red-300 text-sm mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Main card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
          {/* Animated icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/30 to-purple-600/30 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center shadow-xl shadow-red-500/20">
              <svg className="w-9 h-9 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <path className="opacity-25" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-black text-white mb-1">🚀 Analyzing Video</h2>
          <p className="text-gray-500 text-sm mb-6">Processing your content...</p>

          {/* Progress bar */}
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-0 h-full w-8 bg-white/20 blur-sm rounded-full transition-all duration-500"
              style={{ left: `${Math.max(0, progress - 4)}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-600 mb-6">
            <span>{Math.round(progress)}% complete</span>
            <span>Please wait...</span>
          </div>

          {/* Steps list */}
          <div className="space-y-2 text-left">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                  index === currentStep
                    ? "bg-purple-500/10 border border-purple-500/20"
                    : index < currentStep
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-white/3 border border-white/5"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {index < currentStep ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : index === currentStep ? (
                    <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-600" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className={`text-xs font-semibold ${index === currentStep ? "text-purple-300" : index < currentStep ? "text-green-300" : "text-gray-600"}`}>
                    {step.label}
                  </div>
                  <div className="text-gray-600 text-[11px]">{step.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-gray-600 text-xs">This may take a minute for longer videos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
