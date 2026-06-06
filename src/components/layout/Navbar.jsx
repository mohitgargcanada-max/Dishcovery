import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, PlusCircle, ChefHat, LogOut, User, Settings } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { signOut } from '../../lib/supabase'

export default function Navbar() {
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  const profilePath = `/profile/${profile?.username || user?.id}`

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-14 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5 flex items-center px-4 gap-4">
      <Link to="/feed" className="flex items-center gap-2 mr-auto">
        <ChefHat className="text-[#FF6B35]" size={22} />
        <span className="font-display font-bold text-[#F5F5F0] text-xl hidden sm:block">Dishcovery</span>
      </Link>

      <Link to="/search" className="p-2 text-[#888880] hover:text-[#F5F5F0] transition-colors">
        <Search size={20} />
      </Link>

      <Link to="/generate" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35]/15 border border-[#FF6B35]/30 text-[#FF6B35] rounded-lg text-sm font-medium hover:bg-[#FF6B35]/25 transition-colors">
        <span className="text-[#FFB800]">✨</span> AI Generate
      </Link>

      <Link to="/post" className="p-2 text-[#888880] hover:text-[#FF6B35] transition-colors">
        <PlusCircle size={20} />
      </Link>

      {user && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 focus:outline-none"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent hover:ring-[#FF6B35]/50 transition-all" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] text-sm font-bold hover:bg-[#FF6B35]/30 transition-colors">
                {(profile?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-[#F5F5F0] text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                <p className="text-[#888880] text-xs truncate">{user.email}</p>
              </div>

              <Link
                to={profilePath}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F5F0] hover:bg-white/5 transition-colors"
              >
                <User size={15} className="text-[#888880]" /> My Profile
              </Link>

              <Link
                to={profilePath}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F5F0] hover:bg-white/5 transition-colors"
              >
                <Settings size={15} className="text-[#888880]" /> Preferences
              </Link>

              <div className="border-t border-white/5">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
