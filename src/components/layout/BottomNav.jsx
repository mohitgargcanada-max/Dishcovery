import { NavLink } from 'react-router-dom'
import { Home, Search, Sparkles, PlusCircle, Bookmark } from 'lucide-react'

const links = [
  { to: '/feed', icon: Home },
  { to: '/search', icon: Search },
  { to: '/generate', icon: Sparkles },
  { to: '/post', icon: PlusCircle },
  { to: '/saved', icon: Bookmark },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#0D0D0D]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-2">
      {links.map(({ to, icon: Icon }) => (
        <NavLink key={to} to={to}
          className={({ isActive }) =>
            `p-3 rounded-xl transition-colors ${isActive ? 'text-[#FF6B35]' : 'text-[#888880]'}`
          }>
          <Icon size={22} />
        </NavLink>
      ))}
    </nav>
  )
}
