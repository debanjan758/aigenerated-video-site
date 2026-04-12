

interface NavbarProps {
  onReset: () => void;
}

export default function Navbar({ onReset }: NavbarProps) {


  return (
    <nav className="relative z-50 border-b border-white/5 bg-black/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={onReset} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              ViralClip <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-400">Studio</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">How It Works</a>
            <a href="#pricing" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Pricing</a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-medium">AI Online</span>
            </div>
            <button
              onClick={onReset}
              className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
            >
              New Analysis
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
