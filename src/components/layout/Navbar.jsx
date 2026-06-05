import { Link, useNavigate } from 'react-router-dom'
import { Search, PlusCircle, ChefHat, LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { signOut } from '../../lib/supabase'

export default function Navbar() {
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

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

      {profile ? (
        <div className="relative group">
          <button className="flex items-center gap-2">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] text-sm font-bold">
                {(profile.full_name?.[0] || 'U').toUpperCase()}
              </div>
            )}
          </button>
          <div className="absolute right-0 top-full mt-1 w-44 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
            <Link to={`/profile/${profile.username || user?.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-[#F5F5F0] hover:bg-white/5 rounded-t-xl">
              <User size={14} /> Profile
            </Link>
            <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#888880] hover:text-red-400 hover:bg-white/5 rounded-b-xl">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  )
}
