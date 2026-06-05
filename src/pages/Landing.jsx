import { ChefHat, Sparkles, Globe, BookOpen } from 'lucide-react'
import { signInWithGoogle } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Navigate } from 'react-router-dom'

export default function Landing() {
  const { user } = useAuthStore()
  if (user) return <Navigate to="/feed" replace />

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <ChefHat className="text-[#FF6B35]" size={24} />
          <span className="font-display font-bold text-[#F5F5F0] text-xl">Dishcovery</span>
        </div>
        <button onClick={signInWithGoogle}
          className="ml-auto px-4 py-2 bg-[#FF6B35] text-white rounded-xl text-sm font-medium hover:bg-[#e55a25] transition-colors">
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
        <div className="ai-badge-glow inline-flex items-center gap-2 bg-[#FFB800]/10 border border-[#FFB800]/20 text-[#FFB800] px-4 py-1.5 rounded-full text-sm mb-8">
          <Sparkles size={14} /> Powered by Claude AI
        </div>

        <h1 className="font-display text-5xl sm:text-7xl font-bold text-[#F5F5F0] mb-6 leading-tight">
          <span className="text-[#FF6B35]">Discover.</span>{' '}
          <span className="text-[#FFB800]">Cook.</span>{' '}
          <span className="text-[#4CAF7D]">Share.</span>
        </h1>

        <p className="text-[#888880] text-lg max-w-xl mb-10 leading-relaxed">
          AI-powered recipe generation, instant nutritional scoring, and a community
          of passionate home cooks. Cook smarter with Dishcovery.
        </p>

        <button onClick={signInWithGoogle}
          className="flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-2xl text-base font-semibold hover:bg-gray-100 transition-colors shadow-lg shadow-black/20">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 w-full max-w-3xl">
          {[
            { icon: Sparkles, color: '#FFB800', title: 'AI Recipe Generator', desc: 'Turn any ingredients into 3 curated recipes instantly' },
            { icon: Globe, color: '#4CAF7D', title: 'Global Community', desc: 'Share and discover recipes from cooks worldwide' },
            { icon: BookOpen, color: '#FF6B35', title: 'Smart Cook Mode', desc: 'Swipe through steps hands-free with screen-always-on' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="text-[#F5F5F0] font-semibold mb-2">{title}</h3>
              <p className="text-[#888880] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-[#888880] border-t border-white/5">
        © 2025 Dishcovery. Built with Claude AI.
      </footer>
    </div>
  )
}
