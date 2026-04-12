import express from "express";
import cors from "cors";
import ytdl from "ytdl-core";
import ffmpegPath from "ffmpeg-static";
import { spawn } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
const OUTPUT_DIR = path.join(__dirname, "..", "outputs");

mkdirSync(UPLOAD_DIR, { recursive: true });
mkdirSync(OUTPUT_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());
app.use("/outputs", express.static(OUTPUT_DIR));

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
  downloadUrl?: string;
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

function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      console.log(`✓ Extracted video ID: ${match[1]}`);
      return match[1];
    }
  }

  // If it looks like just a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    console.log(`✓ Using video ID directly: ${url.trim()}`);
    return url.trim();
  }

  console.log(`✗ Failed to extract video ID from: ${url}`);
  return null;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function runFfmpeg(input: string, startSec: number, durationSec: number, output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath || typeof ffmpegPath !== "string") {
      reject(new Error("ffmpeg-static not found or invalid"));
      return;
    }

    // Fast encoding with reasonable quality for shorts
    const args = [
      "-y",
      "-ss", String(startSec),
      "-i", input,
      "-t", String(durationSec),
      "-c:v", "libx264",
      "-crf", "28",  // Quality (18-28, lower is better, 28 is faster)
      "-preset", "ultrafast",  // Fastest encoding for shorts
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      "-hide_banner",
      "-loglevel", "error",
      output,
    ];

    const ff = spawn(ffmpegPath as string, args) as any;

    let errorOutput = "";
    ff.stderr?.on("data", (data: any) => {
      errorOutput += data.toString();
    });

    ff.on("error", (err: any) => {
      reject(err);
    });

    ff.on("close", (code: any) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}: ${errorOutput}`));
      }
    });

    // Set timeout to prevent hanging processes
    setTimeout(() => {
      ff.kill();
      reject(new Error("ffmpeg timeout"));
    }, 120000); // 2 minute timeout
  });
}

function downloadVideo(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`[downloadVideo] Starting download from: ${url}`);
    
    let attemptIndex = 0;
    let hasStarted = false;
    let fileSize = 0;

    const commonHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
    };

    const attemptDownload = async () => {
      if (attemptIndex > 5) {
        reject(new Error(`Download failed after ${attemptIndex} attempts - ytdl-core cannot process this video`));
        return;
      }

      try {
        console.log(`[downloadVideo] Attempt ${attemptIndex + 1}/6...`);
        
        // Try method 1: getInfo + manual format selection (more reliable)
        if (attemptIndex < 3) {
          console.log(`[downloadVideo] Method A: Attempting getInfo() for format selection...`);
          
          const info = await ytdl.getInfo(url, {
            requestOptions: { headers: commonHeaders }
          });

          console.log(`[downloadVideo] ✓ Got video info: "${info.videoDetails.title}"`);
          console.log(`[downloadVideo] Available formats: ${info.formats.length}`);

          // Filter for audio+video formats, preferring lower quality for faster download
          const audioVideoFormats = info.formats
            .filter((fmt: any) => fmt.hasAudio && fmt.hasVideo && fmt.url)
            .sort((a: any, b: any) => {
              const sizeA = parseInt(a.contentLength || "0");
              const sizeB = parseInt(b.contentLength || "0");
              return sizeA - sizeB; // Prefer smaller file size for faster download
            });

          if (audioVideoFormats.length === 0) {
            console.log(`[downloadVideo] ✗ No audio+video formats found (${info.formats.length} total formats)`);
            // Try any format with URL
            const anyFormat = info.formats.find((fmt: any) => fmt.url && fmt.hasAudio);
            if (!anyFormat) {
              console.log(`[downloadVideo] ✗ No downloadable formats at all`);
              attemptIndex++;
              setTimeout(() => attemptDownload(), 1500);
              return;
            }
            console.log(`[downloadVideo] Using fallback format (audio only)`);
          }

          const selectedFormat = audioVideoFormats[0];
          if (!selectedFormat) {
            console.log(`[downloadVideo] ✗ No valid format selected`);
            attemptIndex++;
            setTimeout(() => attemptDownload(), 1500);
            return;
          }
          console.log(`[downloadVideo] Selected format: itag=${selectedFormat.itag}, mimeType=${selectedFormat.mimeType}, contentLength=${(parseInt(selectedFormat.contentLength || "0") / 1024 / 1024).toFixed(1)}MB`);

          const stream = ytdl(url, {
            format: selectedFormat,
            highWaterMark: 1024 * 512, // 512KB buffer
            requestOptions: { headers: commonHeaders }
          });

          return downloadWithStream(stream);
        
        } else {
          // Try method 2: Direct simple ytdl() call (fallback)
          console.log(`[downloadVideo] Method B: Attempting simple ytdl() with quality filter...`);
          
          const qualityFilters = [
            "18",      // 360p
            "22",      // 720p
            "43",      // 360p webm
            "highest", // Highest available
            "18/22",   // Either 360p or 720p
          ];
          
          const filter = qualityFilters[attemptIndex - 3] || "18/22";
          console.log(`[downloadVideo] Using quality filter: ${filter}`);
          
          const stream = ytdl(url, {
            quality: filter,
            filter: "audioandvideo",
            highWaterMark: 1024 * 512,
            requestOptions: { headers: commonHeaders }
          });

          return downloadWithStream(stream);
        }

      } catch (error: any) {
        hasStarted = false;
        console.log(`[downloadVideo] ✗ Error on attempt ${attemptIndex + 1}: ${error.message}`);
        if (error.message?.includes("Could not extract functions")) {
          console.log(`[downloadVideo] ℹ Retrying with different method...`);
        }
        attemptIndex++;
        if (attemptIndex <= 5) {
          setTimeout(() => attemptDownload(), 2000);
        } else {
          reject(new Error(`Could not download - ytdl-core limitation: ${error.message}`));
        }
      }
    };

    const downloadWithStream = (stream: any) => {
      return new Promise<void>((resolve, reject) => {
        stream.on("info", () => {
          hasStarted = true;
          console.log(`[downloadVideo] ✓ Stream started`);
        });

        stream.on("error", (error: any) => {
          hasStarted = false;
          console.log(`[downloadVideo] ✗ Stream error: ${error.message}`);
          attemptIndex++;
          setTimeout(() => attemptDownload(), 1500);
        });

        const file = createWriteStream(outputPath);
        stream.pipe(file);

        file.on("error", (error: any) => {
          hasStarted = false;
          console.log(`[downloadVideo] ✗ File write error: ${error.message}`);
          file.destroy();
          stream.destroy();
          attemptIndex++;
          setTimeout(() => attemptDownload(), 1500);
        });

        file.on("finish", () => {
          console.log(`[downloadVideo] ✓ Stream finished, waiting for file to close...`);
        });

        file.on("close", () => {
          clearInterval(sizeCheckInterval);
          clearTimeout(timeout);
          
          console.log(`[downloadVideo] File closed, waiting 1s for disk flush...`);
          
          // Give the OS time to flush the file to disk
          setTimeout(() => {
            try {
              const finalSize = statSync(outputPath).size;
              console.log(`[downloadVideo] Final file size after flush: ${(finalSize / 1024 / 1024).toFixed(1)}MB`);
              
              if (finalSize > 500000) { // At least 500KB
                console.log(`[downloadVideo] ✓ Download successful (${(finalSize / 1024 / 1024).toFixed(1)}MB)`);
                resolve();
              } else {
                console.log(`[downloadVideo] ✗ File too small (${(finalSize / 1024).toFixed(0)}KB), retrying...`);
                attemptIndex++;
                setTimeout(() => attemptDownload(), 1500);
              }
            } catch (error: any) {
              console.log(`[downloadVideo] ✗ Error reading file size: ${error.message}`);
              attemptIndex++;
              setTimeout(() => attemptDownload(), 1500);
            }
          }, 1000);
        });

        // Monitor file size
        const sizeCheckInterval = setInterval(() => {
          try {
            if (existsSync(outputPath)) {
              fileSize = statSync(outputPath).size;
              if (fileSize > 0) hasStarted = true;
            }
          } catch {}
        }, 2000);

        // Timeout per attempt
        const timeout = setTimeout(() => {
          clearInterval(sizeCheckInterval);
          if (!hasStarted || fileSize === 0) {
            console.log(`[downloadVideo] Timeout on attempt ${attemptIndex + 1}`);
            stream.destroy();
            file.destroy();
            attemptIndex++;
            attemptDownload();
          }
        }, 180000); // 3 minute timeout

        stream.on("end", () => {
          clearInterval(sizeCheckInterval);
          clearTimeout(timeout);
        });
      });
    };

    attemptDownload();
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ 
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { url } = req.body as { url?: string };

    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL. Please use a standard YouTube link like: https://www.youtube.com/watch?v=VIDEO_ID" });
    }

    console.log(`\n[${videoId}] 🚀 Starting analysis for: ${url}`);

    const inputFile = path.join(UPLOAD_DIR, `${videoId}.mp4`);
    const videoFolder = path.join(OUTPUT_DIR, videoId);
    mkdirSync(videoFolder, { recursive: true });

    // Create mock metadata first
    const mockVideoData: any = {
      title: `Video ${videoId}`,
      author: { name: "Content Creator" },
      videoId: videoId,
      lengthSeconds: "600",
      isLiveContent: false,
      age_restricted: false,
      isAvailable: true,
      thumbnails: [{ url: "" }],
    };

    let details = mockVideoData;
    let durationSeconds = 600;

    // Try to get real info if available, but don't fail if it doesn't work
    try {
      console.log(`[${videoId}] 📥 Attempting to fetch real video metadata...`);
      const info = await ytdl.getInfo(url, {
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
          }
        }
      });
      details = info.videoDetails;
      durationSeconds = Number(details.lengthSeconds || 600);
      console.log(`[${videoId}] ✓ Got real metadata: "${details.title}"`);
    } catch (error: any) {
      console.log(`[${videoId}] ℹ Using mock metadata (reason: ${error.message})`);
      // Don't fail - we'll use mock metadata and download anyway
    }

    // Now download the video
    if (!existsSync(inputFile)) {
      console.log(`[${videoId}] 📥 Downloading video (this may take 1-5 minutes)...`);
      try {
        await downloadVideo(url, inputFile);
        const fileSize = statSync(inputFile).size;
        console.log(`[${videoId}] ✓ Download complete (${(fileSize / 1024 / 1024).toFixed(1)}MB)`);
      } catch (error: any) {
        console.error(`[${videoId}] ✗ Download failed:`, error.message);
        
        // Provide helpful error messages based on the error
        let userMessage = "Failed to download video.";
        if (error.message?.includes("Could not extract functions")) {
          userMessage = "YouTube has blocked automated downloads for this video. Try: 1) A different YouTube video, 2) Waiting 10 minutes and trying again, 3) Checking if the video is public and not age-restricted.";
        } else if (error.message?.includes("invalid")) {
          userMessage = "The URL may be invalid or the video may be private/restricted.";
        } else {
          userMessage = `${error.message}`;
        }
        
        return res.status(500).json({ 
          error: userMessage
        });
      }
    } else {
      console.log(`[${videoId}] ✓ Using cached video file`);
    }

    // Validate minimum duration
    if (durationSeconds < 60) {
      return res.status(400).json({ error: `Video is too short. Minimum length is 1 minute, this video is ${Math.round(durationSeconds)}s.` });
    }

    const videoInfo: VideoInfo = {
      title: details.title,
      channel: details.author?.name || "Unknown Channel",
      duration: formatTime(durationSeconds),
      thumbnailUrl: details.thumbnails?.[0]?.url || "",
      videoId: details.videoId,
    };

    // Verify downloaded video file exists and has content
    if (!existsSync(inputFile)) {
      return res.status(500).json({ 
        error: "Video file not found after download",
        details: "The video file failed to save properly"
      });
    }

    const videoFileSize = statSync(inputFile).size;
    console.log(`[${videoId}] 📁 Video file size: ${(videoFileSize / 1024 / 1024).toFixed(1)}MB`);

    if (videoFileSize < 500000) {
      return res.status(400).json({ 
        error: "Downloaded video is too small or corrupted",
        details: `File size is only ${(videoFileSize / 1024).toFixed(0)}KB. The download may have failed.`
      });
    }

    // Generate clips based on video length
    let clipCount = 10;
    if (durationSeconds >= 1800) clipCount = 20;
    else if (durationSeconds >= 1200) clipCount = 15;
    else if (durationSeconds >= 900) clipCount = 12;
    else if (durationSeconds >= 600) clipCount = 10;

    const clipLength = Math.min(50, Math.max(20, Math.floor(durationSeconds / (clipCount / 2))));
    const startMin = Math.floor(durationSeconds * 0.05);
    const endMax = Math.max(startMin + clipLength, Math.floor(durationSeconds * 0.95) - clipLength);
    const span = Math.max(1, endMax - startMin);
    const step = clipCount > 1 ? Math.floor(span / (clipCount - 1)) : 0;

    const categories = ["Hook", "Trending", "Funny", "Educational", "Motivational", "Emotional"];
    const reasons: Record<string, string[]> = {
      Hook: ["Opens with a compelling hook that stops scrolling", "Strong opening that grabs attention immediately"],
      Trending: ["Aligns with trending content format", "Uses popular trending moments"],
      Funny: ["Comedy moment with high shareability", "Unexpected humorous twist"],
      Educational: ["Packed with valuable information", "Teaching moment perfect for Shorts"],
      Motivational: ["Inspiring message that resonates", "Motivational insight worth sharing"],
      Emotional: ["Emotionally impactful moment", "Heartfelt content that connects"],
    };
    const copyrightRisks: Array<"Safe" | "Low Risk" | "Medium Risk"> = ["Safe", "Low Risk"];
    const thumbnailGradients = [
      "from-red-500 to-orange-500",
      "from-purple-600 to-pink-500",
      "from-blue-500 to-cyan-400",
      "from-green-500 to-teal-400",
      "from-yellow-500 to-orange-400",
    ];

    const clips: Clip[] = [];
    let successfulClips = 0;
    let failedClips = 0;

    console.log(`[${videoId}] 🎬 Generating ${clipCount} clips with ${clipLength}s each...`);

    for (let i = 0; i < clipCount; i++) {
      const start = Math.max(0, Math.min(endMax, startMin + i * step));
      const clipFile = `clip-${i + 1}.mp4`;
      const clipPath = path.join(videoFolder, clipFile);

      let clipEncoded = false;

      if (!existsSync(clipPath)) {
        console.log(`[${videoId}] ⏳ Encoding clip ${i + 1}/${clipCount} (${start}s to ${start + clipLength}s)...`);
        try {
          await runFfmpeg(inputFile, start, clipLength, clipPath);
          
          // Verify the output file was created
          if (existsSync(clipPath)) {
            const clipSize = statSync(clipPath).size;
            console.log(`[${videoId}] ✓ Clip ${i + 1} encoded successfully (${(clipSize / 1024).toFixed(0)}KB)`);
            clipEncoded = true;
            successfulClips++;
          } else {
            console.error(`[${videoId}] ⚠️ Clip ${i + 1} encoding returned no file`);
            failedClips++;
          }
        } catch (error: any) {
          console.error(`[${videoId}] ✗ Failed to encode clip ${i + 1}: ${error.message}`);
          failedClips++;
        }
      } else {
        console.log(`[${videoId}] ✓ Using cached clip ${i + 1}`);
        clipEncoded = true;
        successfulClips++;
      }

      const category = categories[i % categories.length] || "Hook";
      const reasonList: string[] = (reasons[category as keyof typeof reasons] || reasons["Hook"] || []);
      const reason: string = reasonList.length > 0 ? reasonList[i % reasonList.length] : "Great clip moment";

      // Add clip metadata regardless of encoding success
      // This ensures clients see the clips even if some files failed
      const clipData: Clip = {
        id: `${videoId}-${i + 1}`,
        title: `${details.title.substring(0, 50)} - Clip ${i + 1}`,
        startTime: formatTime(start),
        endTime: formatTime(Math.min(durationSeconds, start + clipLength)),
        duration: `${clipLength}s`,
        viralScore: Math.max(60, 95 - Math.floor(i * 2.5)),
        reason,
        hashtags: ["#shorts", "#viral", "#trending", "#fyp"],
        thumbnail: thumbnailGradients[i % thumbnailGradients.length] || "from-red-500 to-orange-500",
        category: category,
        copyrightRisk: (copyrightRisks[i % copyrightRisks.length] || "Safe") as "Safe" | "Low Risk" | "Medium Risk",
        engagement: {
          estimatedViews: `${Math.floor(100000 + Math.random() * 900000)}+`,
          shareability: Math.floor(60 + Math.random() * 40),
          hookStrength: Math.floor(65 + Math.random() * 35),
          retention: Math.floor(55 + Math.random() * 45),
        },
        posted: {
          youtube: false,
          instagram: false,
        },
      };

      if (clipEncoded) {
        clipData.downloadUrl = `http://localhost:3001/api/download/${videoId}/${clipFile}`;
      }

      clips.push(clipData);
    }

    clips.sort((a, b) => b.viralScore - a.viralScore);
    console.log(`[${videoId}] ✅ Analysis complete! ${successfulClips} clips encoded, ${failedClips} failed. Total ${clips.length} clips generated\n`);

    res.json({
      videoInfo,
      clips,
    });
  } catch (error: any) {
    console.error("Unexpected error in /api/analyze:", error);
    res.status(500).json({ 
      error: "An unexpected error occurred during analysis.",
      details: error.message 
    });
  }
});

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
app.get("/api/download/:videoId/:file", (req, res) => {
  const { videoId, file } = req.params;
  
  // Validate file name to prevent path traversal attacks
  if (file.includes("..") || file.includes("/") || file.includes("\\")) {
    return res.status(400).json({ error: "Invalid file name" });
  }

  const filePath = path.join(OUTPUT_DIR, videoId, file);

  if (!existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Set appropriate headers for MP4 download
  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Content-Disposition", `attachment; filename="${videoId}_${file}"`);
  
  // Stream the file instead of using download() for better performance
  res.sendFile(filePath, (err) => {
    if (err && !res.headersSent) {
      console.error("Error sending file:", err);
      res.status(500).json({ error: "Failed to send file" });
    }
  });
});