# AI-Generated Video Shorts Engine 🎬

A full-stack web application that analyzes YouTube videos and intelligently identifies the most viral-worthy moments, then generates short-form clips optimized for YouTube Shorts, TikTok, and Instagram Reels.

## Features ✨

- **Smart Video Analysis** — Upload any YouTube video URL and get AI-powered analysis
- **Viral Moment Detection** — Automatically identifies the best moments for short-form content
- **Multi-Category Clips** — Generates clips across different categories:
  - 🪝 Hook (attention-grabbing openings)
  - 🔥 Trending (trend-aligned content)
  - 😂 Funny (comedy moments)
  - 🎓 Educational (learning-focused)
  - 💪 Motivational (inspiring content)
  - 💔 Emotional (heartfelt moments)

- **Engagement Metrics** — Each clip includes:
  - Viral score prediction
  - Estimated view range
  - Hook strength rating
  - Audience retention prediction
  - Shareability score

- **Copyright Safety** — Evaluates copyright risk for each clip
- **One-Click Posting** — Setup to automatically post to YouTube and Instagram
- **Real-time Processing** — Fast clip generation with FFmpeg

## Tech Stack 🛠️

### Frontend
- **React** — UI framework
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Styling
- **Vite** — Build tool

### Backend
- **Node.js + Express** — REST API server
- **ytdl-core** — YouTube video downloading
- **FFmpeg** — Video encoding and clip generation
- **TypeScript** — Type-safe backend

## Project Structure 📁

```
aigenerated-video-site/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   ├── InputStep.tsx
│   │   │   ├── AnalyzingStep.tsx
│   │   │   ├── ResultsStep.tsx
│   │   │   ├── ClipCard.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── HeroSection.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── clipGenerator.ts
│   │   │   └── cn.ts
│   │   └── index.css
│   ├── backend/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── index.html
└── README.md
```
## Infrastructure & Deployment 🐳

### Docker Setup

This project is fully containerized for easy deployment and local development.

#### Build and Run with Docker Compose

1. **Install Docker Desktop** — Download from [docker.com](https://www.docker.com/products/docker-desktop)

2. **Build and start services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: `http://localhost` (Nginx, port 80)
   - Backend API: `http://localhost:3001`

4. **Stop services**
   ```bash
   docker-compose down
   ```

#### Docker Architecture

**Backend Service:**
- Base image: `node:22-alpine`
- Includes FFmpeg for video processing
- Runs on port 3001
- Health checks enabled
- Auto-restart on failure

**Frontend Service:**
- Multi-stage build for optimized image size
- Nginx reverse proxy
- Automatic API proxy to backend (http://backend:3001)
- Static file serving with SPA routing support
- Runs on port 80

### CI/CD Pipeline

Automated testing and building via GitHub Actions:

- ✅ **Build Verification** — Compiles frontend and backend TypeScript
- ✅ **Docker Image Build** — Builds both backend and frontend Docker images
- ✅ **Docker Compose Test** — Starts services and validates health checks
- ✅ **API Health Check** — Verifies backend is accessible and responding

**Workflow triggers:**
- On push to `main` or `develop` branches
- On pull requests to `main` or `develop` branches

View the workflow file: [.github/workflows/ci.yml](.github/workflows/ci.yml)

### Deployment Notes

#### Environment Variables

**Production:**
```bash
NODE_ENV=production
VITE_API_URL=https://your-domain.com  # Frontend
```

**Local Development:**
```bash
NODE_ENV=development
VITE_API_URL=http://localhost:3001    # Frontend
```

#### Performance Optimizations

- **Frontend**: Pre-built assets cached in Nginx, gzip compression enabled
- **Backend**: All dependencies pre-installed, runs with tsx for hot-reload in dev
- **Volumes**: Persistent uploads and outputs directories mounted from host

#### Resource Requirements

- **Memory**: Minimum 2GB recommended for Docker Desktop
- **Disk Space**: ~500MB for container images
- **CPU**: 2+ cores for smooth operation
## Getting Started 🚀

### Prerequisites
- Node.js 16+ 
- npm or yarn
- FFmpeg (automatically installed via `ffmpeg-static`)
- Python 3+ (for some optional features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aigenerated-video-site.git
   cd aigenerated-video-site
   ```

2. **Install dependencies**
   
   Frontend:
   ```bash
   cd frontend
   npm install
   ```
   
   Backend:
   ```bash
   cd frontend/backend
   npm install
   ```

### Running the Application

1. **Start the backend server** (from `frontend/backend/`)
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:3001`

2. **Start the frontend** (from `frontend/`)
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Open in browser**
   Navigate to `http://localhost:5173`

## How It Works 🔄

### Video Analysis Flow
1. **User Input** — Submit a YouTube URL and social media handles
2. **Download** — Backend downloads the video from YouTube
3. **Analysis** — Video is analyzed to identify key moments
4. **Clip Generation** — FFmpeg extracts and encodes optimal clips
5. **Metadata** — Each clip receives viral score, category, and engagement metrics
6. **Display** — Frontend shows all clips sorted by viral score

### Clip Categories & Scoring

Each clip is evaluated for:
- **Viral Score** (0-100) — Likelihood of going viral
- **Hook Strength** — How well it grabs attention in first 3 seconds
- **Retention** — Expected audience retention percentage
- **Shareability** — How likely viewers will share the clip
- **Copyright Risk** — Safe, Low Risk, or Medium Risk

## API Endpoints 📡

### POST `/api/analyze`
Analyzes a YouTube video and generates clips.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "handles": {
    "youtube": "your_channel",
    "instagram": "your_handle"
  }
}
```

**Response:**
```json
{
  "videoInfo": {
    "title": "Video Title",
    "channel": "Channel Name",
    "duration": "10:30",
    "thumbnailUrl": "https://...",
    "videoId": "VIDEO_ID"
  },
  "clips": [
    {
      "id": "clip-1",
      "title": "Clip Title",
      "startTime": "0:15",
      "endTime": "1:00",
      "duration": "45s",
      "viralScore": 87,
      "category": "Hook",
      "reason": "Opens with shocking statement...",
      "hashtags": ["#shorts", "#viral", "#trending"],
      "engagement": {
        "estimatedViews": "800K-1.2M",
        "shareability": 85,
        "hookStrength": 92,
        "retention": 78
      },
      "copyrightRisk": "Safe",
      "downloadUrl": "/outputs/VIDEO_ID/clip-1.mp4"
    }
    // ... more clips
  ]
}
```

### GET `/api/health`
Health check endpoint.

### GET `/api/download/:videoId/:file`
Download a generated clip.

## Configuration ⚙️

### Environment Variables
Create a `.env` file in the root directory (optional):
```env
VITE_API_BASE=http://localhost:3001
NODE_ENV=development
```

### FFmpeg Settings
Video encoding quality settings in `frontend/backend/src/index.ts`:
- `-crf 28` — Quality (18-28, lower is better)
- `-preset ultrafast` — Speed (ultrafast to slow)
- `-b:a 128k` — Audio bitrate

Adjust these for different quality/speed tradeoffs.

## Features in Development 🚧

- [ ] Auto-posting to YouTube and Instagram
- [ ] Batch video processing
- [ ] Custom clip duration settings
- [ ] Subtitle generation
- [ ] Music suggestion engine
- [ ] Analytics dashboard
- [ ] User authentication and history
- [ ] Premium features (higher quality, more clips)

## Troubleshooting 🔧

### "Could not extract functions" Error
This occurs when ytdl-core cannot download the YouTube video (YouTube's anti-bot protection). 

**Solutions:**
1. Try a different YouTube video
2. Wait 10 minutes and try again
3. Ensure the video is public and not age-restricted
4. The app will fall back to demo mode automatically

### FFmpeg Not Found
If FFmpeg isn't working:
```bash
npm install ffmpeg-static --save-dev
```

### Port Already in Use
If ports 3001 or 5173 are in use:
- Backend: Change port in `frontend/backend/src/index.ts` (line with `app.listen`)
- Frontend: Change in `frontend/vite.config.ts`

## Demo Mode 🎭
If YouTube download fails, the app automatically generates demo clips so you can see the full functionality end-to-end.

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap 🗺️

- [ ] Switch to `yt-dlp` for more reliable downloads
- [ ] Add subtitle generation with AI
- [ ] Implement user authentication
- [ ] Build analytics dashboard
- [ ] Add A/B testing for multiple clip versions
- [ ] Create browser extension for direct YouTube integration
- [ ] Mobile app version
- [ ] Support for TikTok uploads

## Known Issues ⚠️

1. **YouTube Download Limitations** — `ytdl-core` cannot download from videos protected by newer YouTube anti-bot measures. Consider using `yt-dlp` (requires Python) for more reliability.

2. **FFmpeg Speed** — First-time clip generation can be slow. Consider having FFmpeg cache precompiled binaries.

3. **Memory Usage** — Processing long videos (30+ minutes) may require significant RAM.

## Support 💬

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting guide above

## Credits 🙏

Built with:
- ytdl-core for YouTube downloading
- FFmpeg for video processing
- Express for backend API
- React for frontend UI
- Tailwind CSS for styling

---

**Made with ❤️ for content creators**
