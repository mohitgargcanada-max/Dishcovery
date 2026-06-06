import { useState, useEffect, useCallback, useRef } from 'react'
import { Search as SearchIcon, Loader2, X, Info } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { smartSearch } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import RecipeGrid from '../components/recipe/RecipeGrid'
import EmptyState from '../components/ui/EmptyState'
import { DIET_TAGS, ALLERGENS } from '../utils/constants'

// All tag types that can appear on recipes
const CUISINES_LIST = ['Italian','Japanese','Indian','Mexican','Thai','Korean','Vietnamese',
  'Mediterranean','Chinese','French','Moroccan','British','American','Greek']

function getSuggestions(q) {
  if (!q || q.length < 1) return []
  const lower = q.toLowerCase()
  const matches = []

  // Diet tags
  DIET_TAGS.forEach(t => { if (t.includes(lower)) matches.push({ label: t, type: 'diet', color: 'text-green-400 bg-green-900/30 border-green-700/30' }) })
  // Allergens
  ALLERGENS.forEach(a => { if (a.includes(lower)) matches.push({ label: `no ${a}`, type: 'allergen', color: 'text-red-400 bg-red-900/20 border-red-700/30' }) })
  // Cuisines
  CUISINES_LIST.forEach(c => { if (c.toLowerCase().includes(lower)) matches.push({ label: c, type: 'cuisine', color: 'text-blue-400 bg-blue-900/20 border-blue-700/30' }) })

  return matches.slice(0, 8)
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [activeTags, setActiveTags] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [parsed, setParsed] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const { user, profile } = useAuthStore()

  // Update suggestions as user types
  useEffect(() => {
    const s = getSuggestions(query)
    setSuggestions(s)
    setShowSuggestions(query.length > 0 && s.length > 0)
  }, [query])

  function addTag(tag) {
    if (!activeTags.find(t => t.label === tag.label)) {
      setActiveTags(prev => [...prev, tag])
    }
    setQuery('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  function removeTag(label) {
    setActiveTags(prev => prev.filter(t => t.label !== label))
  }

  const runSearch = useCallback(async (q, tags) => {
    const hasInput = q.trim() || tags.length > 0
    if (!hasInput) { setResults([]); setParsed(null); return }
    setLoading(true)
    try {
      let filters = { keywords: [], diet_tags: [], allergen_free: [], cuisine: null }

      // Parse active tags into filters
      tags.forEach(tag => {
        if (tag.type === 'diet') filters.diet_tags.push(tag.label)
        if (tag.type === 'allergen') filters.allergen_free.push(tag.label.replace('no ', ''))
        if (tag.type === 'cuisine') filters.cuisine = tag.label
      })

      // Smart search for text query
      if (q.trim()) {
        try {
          const aiFilters = await smartSearch({ query: q, userId: user?.id })
          setParsed(aiFilters)
          if (aiFilters.keywords?.length) filters.keywords = [...filters.keywords, ...aiFilters.keywords]
          if (aiFilters.diet_tags?.length) filters.diet_tags = [...new Set([...filters.diet_tags, ...aiFilters.diet_tags])]
          if (!filters.cuisine && aiFilters.cuisine) filters.cuisine = aiFilters.cuisine
        } catch {
          filters.keywords = [q.trim()]
        }
      }

      let dbQuery = supabase
        .from('recipes')
        .select(`*, profiles(id, username, full_name, avatar_url)`)
        .eq('is_published', true)
        .limit(40)

      // Keyword search
      if (filters.keywords.length > 0) {
        const conditions = filters.keywords.map(kw =>
          `title.ilike.%${kw}%,description.ilike.%${kw}%,cuisine_type.ilike.%${kw}%`
        ).join(',')
        dbQuery = dbQuery.or(conditions)
      } else if (q.trim()) {
        dbQuery = dbQuery.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%,cuisine_type.ilike.%${q.trim()}%`)
      }

      // Cuisine filter
      if (filters.cuisine) dbQuery = dbQuery.ilike('cuisine_type', `%${filters.cuisine}%`)

      // Diet tag filters (strict — each must be present)
      const allDiets = [...new Set([...filters.diet_tags, ...(profile?.taste_profile?.diets ?? [])])]
      for (const diet of allDiets) {
        dbQuery = dbQuery.contains('ai_diet_tags', [diet])
      }

      // Allergen exclusions
      const allAllergens = [...new Set([...filters.allergen_free, ...(profile?.allergens ?? [])])]
      if (allAllergens.length) {
        dbQuery = dbQuery.not('allergens', 'ov', `{${allAllergens.join(',')}}`)
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => runSearch(query, activeTags), 500)
    return () => clearTimeout(timer)
  }, [query, activeTags, runSearch])

  const hasInput = query.trim() || activeTags.length > 0

  return (
    <div className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-[#F5F5F0] mb-4">Search Recipes</h1>

      {/* Search box with tag chips */}
      <div className="relative mb-2">
        <div className="min-h-[48px] flex flex-wrap items-center gap-1.5 px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl focus-within:border-[#FF6B35]/50 transition-colors">
          <SearchIcon size={16} className="text-[#888880] flex-shrink-0" />

          {/* Active tag chips */}
          {activeTags.map(tag => (
            <span key={tag.label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${tag.color}`}>
              {tag.label}
              <button onClick={() => removeTag(tag.label)} className="hover:opacity-70 ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={activeTags.length === 0 ? 'Search by dish, cuisine, diet tag, allergen...' : 'Add more filters...'}
            className="flex-1 min-w-[140px] bg-transparent outline-none text-sm text-[#F5F5F0] placeholder:text-[#888880]"
          />

          {(query || activeTags.length > 0) && (
            <button onClick={() => { setQuery(''); setActiveTags([]); setResults([]) }}
              className="text-[#888880] hover:text-[#F5F5F0] flex-shrink-0">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Tag suggestions dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
            <p className="text-xs text-[#888880] px-3 pt-2 pb-1">Quick filters:</p>
            <div className="flex flex-wrap gap-1.5 p-2 pt-1">
              {suggestions.map(s => (
                <button key={s.label} onMouseDown={() => addTag(s)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors hover:opacity-80 ${s.color}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Popular tags row when empty */}
      {!hasInput && (
        <div className="mb-4">
          <p className="text-xs text-[#888880] mb-2">Popular tags:</p>
          <div className="flex flex-wrap gap-1.5">
            {['vegan','gluten-free','keto','dairy-free','Italian','Indian','Japanese','Thai','halal'].map(tag => {
              const isDiet = DIET_TAGS.includes(tag)
              const isCuisine = CUISINES_LIST.includes(tag)
              const color = isDiet ? 'text-green-400 bg-green-900/20 border-green-700/30'
                : isCuisine ? 'text-blue-400 bg-blue-900/20 border-blue-700/30'
                : 'text-[#888880] bg-[#242424] border-white/10'
              const type = isDiet ? 'diet' : isCuisine ? 'cuisine' : 'keyword'
              return (
                <button key={tag} onClick={() => addTag({ label: tag, type, color })}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors hover:opacity-80 ${color}`}>
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* AI parsed info */}
      {parsed && query && (
        <div className="mb-3 p-2.5 bg-[#1A1A1A] border border-[#FFB800]/20 rounded-xl flex flex-wrap gap-1.5 items-center">
          <span className="text-[#FFB800] text-xs">✨ AI understood:</span>
          {parsed.keywords?.map(k => <span key={k} className="text-xs bg-[#242424] text-[#F5F5F0] px-2 py-0.5 rounded-full">{k}</span>)}
          {parsed.max_calories && <span className="text-xs bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded-full border border-orange-700/30">≤{parsed.max_calories} cal</span>}
          {parsed.max_time && <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full border border-purple-700/30">≤{parsed.max_time}m</span>}
        </div>
      )}

      {/* Diet preference notice */}
      {profile?.taste_profile?.diets?.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-xs text-[#888880] bg-[#1A1A1A] border border-white/5 rounded-xl px-3 py-2">
          <Info size={12} className="text-[#4CAF7D] flex-shrink-0" />
          Your dietary preferences applied:
          {profile.taste_profile.diets.map(d => <span key={d} className="text-[#4CAF7D] capitalize">{d}</span>)}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-[#888880] text-sm mb-4">
          <Loader2 size={14} className="animate-spin" /> Searching...
        </div>
      )}

      {!loading && hasInput && results.length === 0 && (
        <EmptyState icon="🔍" title="No recipes found" description="Try removing some filters or using different keywords." />
      )}

      {!hasInput && !loading && results.length === 0 && (
        <div className="text-center py-12 text-[#888880]">
          <SearchIcon size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Type a dish name or tap a tag above</p>
          <p className="text-xs mt-1 opacity-60">AI understands natural language too</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="text-xs text-[#888880] mb-4">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          <RecipeGrid recipes={results} />
        </>
      )}
    </div>
  )
}
