import { NavLink } from 'react-router-dom'
import { Home, Search, Sparkles, PlusCircle, Bookmark, User, ChefHat } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const links = [
  { to: '/feed', icon: Home, label: 'Feed' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/generate', icon: Sparkles, label: 'AI Generate' },
  { to: '/post', icon: PlusCircle, label: 'Post Recipe' },
  { to: '/saved', icon: Bookmark, label: 'Saved' },
]

export default function Sidebar() {
  const { profile, user } = useAuthStore()

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-14 bottom-0 w-56 bg-[#0D0D0D] border-r border-white/5 py-4 z-30">
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#FF6B35]/15 text-[#FF6B35] font-medium'
                  : 'text-[#888880] hover:text-[#F5F5F0] hover:bg-white/5'
              }`
            }>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {profile && (
        <NavLink to={`/profile/${profile.username || user?.id}`}
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-3 border-t border-white/5 text-sm transition-colors ${
              isActive ? 'text-[#FF6B35]' : 'text-[#888880] hover:text-[#F5F5F0]'
            }`
          }>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="w-7 h-7 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] text-xs font-bold">
              {(profile.full_name?.[0] || 'U').toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[#F5F5F0] text-xs font-medium leading-tight">{profile.full_name}</span>
            <span className="text-[#888880] text-xs">@{profile.username || 'me'}</span>
          </div>
        </NavLink>
      )}
    </aside>
  )
}
