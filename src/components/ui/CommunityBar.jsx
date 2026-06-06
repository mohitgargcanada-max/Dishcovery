import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Users } from 'lucide-react'

function useTopCooks() {
  return useQuery({
    queryKey: ['top-cooks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .not('full_name', 'is', null)
        .limit(10)
      return data ?? []
    },
    staleTime: 10 * 60 * 1000,
  })
}

export default function CommunityBar() {
  const { data: cooks = [] } = useTopCooks()
  if (cooks.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Users size={15} className="text-[#888880]" />
        <span className="text-sm text-[#888880] font-medium">Community Cooks</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {cooks.map(cook => (
          <Link key={cook.id}
            to={`/profile/${cook.username || cook.id}`}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group">
            {cook.avatar_url ? (
              <img src={cook.avatar_url}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#FF6B35]/50 transition-all"
                alt={cook.full_name} />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] font-bold text-lg group-hover:bg-[#FF6B35]/30 transition-colors">
                {(cook.full_name?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <span className="text-xs text-[#888880] group-hover:text-[#F5F5F0] transition-colors max-w-[60px] truncate text-center">
              {cook.full_name?.split(' ')[0] || 'Cook'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
