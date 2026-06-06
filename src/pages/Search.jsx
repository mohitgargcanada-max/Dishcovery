import { useState, useEffect, useCallback } from 'react'
import { Search as SearchIcon, Loader2, X, Info } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { smartSearch } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import RecipeGrid from '../components/recipe/RecipeGrid'
import EmptyState from '../components/ui/EmptyState'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [parsed, setParsed] = useState(null)
  const { user, profile } = useAuthStore()

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setParsed(null); return }
    setLoading(true)
    try {
      let filters = null
      try {
        filters = await smartSearch({ query: q, userId: user?.id })
        setParsed(filters)
      } catch {
        filters = { keywords: [q] }
      }

      let dbQuery = supabase
        .from('recipes')
        .select(`*, profiles(id, username, full_name, avatar_url)`)
        .eq('is_published', true)
        .limit(30)

      if (filters.keywords?.length) {
        dbQuery = dbQuery.ilike('title', `%${filters.keywords[0]}%`)
      }
      if (filters.cuisine) {
        dbQuery = dbQuery.ilike('cuisine_type', filters.cuisine)
      }
      if (filters.max_calories) {
        dbQuery = dbQuery.lte('ai_calories_per_serving', filters.max_calories)
      }
      if (filters.max_time) {
        dbQuery = dbQuery.lte('cook_time', filters.max_time)
      }

      // Merge AI-parsed diet tags with user's own dietary preferences
      const userDiets = profile?.taste_profile?.diets ?? []
      const allDiets = [...new Set([...(filters.diet_tags ?? []), ...userDiets])]
      if (allDiets.length) {
        dbQuery = dbQuery.overlaps('ai_diet_tags', allDiets)
      }

      // Always exclude user's allergens
      const userAllergens = profile?.allergens ?? []
      if (userAllergens.length) {
        dbQuery = dbQuery.not('allergens', 'ov', `{${userAllergens.join(',')}}`)
      }

      const { data, error } = await dbQuery
      if (error) throw error
      setResults(data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user?.id, profile])

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 500)
    return () => clearTimeout(timer)
  }, [query, runSearch])

  return (
    <div className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-[#F5F5F0] mb-4">Search Recipes</h1>

      {/* Search input */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888880]" size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "vegan pasta under 30 mins" or "gluten-free dessert"'
          className="w-full pl-10 pr-10 py-3 bg-[#1A1A1A] border border-white/10 rounded-xl text-[#F5F5F0] placeholder:text-[#888880] focus:outline-none focus:border-[#FF6B35]/50 text-sm"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888880] hover:text-[#F5F5F0]">
            <X size={16} />
          </button>
        )}
      </div>

      {/* AI parsed filters preview */}
      {parsed && query && (
        <div className="mb-4 p-3 bg-[#1A1A1A] border border-[#FFB800]/20 rounded-xl flex flex-wrap gap-2 items-center">
          <span className="text-[#FFB800] text-xs ai-badge-glow">✨ AI parsed:</span>
          {parsed.keywords?.map((k) => (
            <span key={k} className="text-xs bg-[#242424] text-[#F5F5F0] px-2 py-0.5 rounded-full">{k}</span>
          ))}
          {parsed.cuisine && <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">{parsed.cuisine}</span>}
          {parsed.max_calories && <span className="text-xs bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded-full">≤{parsed.max_calories} cal</span>}
          {parsed.max_time && <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full">≤{parsed.max_time}m</span>}
          {parsed.diet_tags?.map((t) => (
            <span key={t} className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-[#888880] text-sm mb-4">
          <Loader2 size={14} className="animate-spin" /> Searching...
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <EmptyState icon="🔍" title="No recipes found" description={`No results for "${query}". Try different keywords.`} />
      )}

      {/* Active dietary filter notice */}
      {profile?.taste_profile?.diets?.length > 0 && (
        <div className="mb-4 flex items-center gap-2 text-xs text-[#888880] bg-[#1A1A1A] border border-white/5 rounded-xl px-3 py-2">
          <Info size={13} className="text-[#4CAF7D] flex-shrink-0" />
          Showing results matching your dietary preferences:
          {profile.taste_profile.diets.map((d) => (
            <span key={d} className="text-[#4CAF7D] capitalize">{d}</span>
          ))}
        </div>
      )}

      {!query && (
        <div className="text-center py-16 text-[#888880]">
          <SearchIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Search with natural language — AI understands your query</p>
          <p className="text-xs mt-1 opacity-60">Your dietary preferences are applied automatically</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="text-xs text-[#888880] mb-4">{results.length} results</p>
          <RecipeGrid recipes={results} />
        </>
      )}
    </div>
  )
}
