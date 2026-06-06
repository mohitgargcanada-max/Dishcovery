import { useState, useEffect, useCallback, useRef } from 'react'
import { Search as SearchIcon, Loader2, X, Info, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import RecipeGrid from '../components/recipe/RecipeGrid'
import EmptyState from '../components/ui/EmptyState'
import { DIET_TAGS, ALLERGENS } from '../utils/constants'

const CUISINES_LIST = ['Italian','Japanese','Indian','Mexican','Thai','Korean',
  'Vietnamese','Mediterranean','Chinese','French','Moroccan','British','American','Greek','Persian']

function getSuggestions(q) {
  if (!q || q.length < 1) return []
  const lower = q.toLowerCase()
  const matches = []
  DIET_TAGS.forEach(t => { if (t.includes(lower)) matches.push({ label: t, type: 'diet', color: 'text-green-400 bg-green-900/30 border-green-700/30' }) })
  ALLERGENS.forEach(a => { if (a.includes(lower)) matches.push({ label: `no ${a}`, type: 'allergen', color: 'text-red-400 bg-red-900/20 border-red-700/30' }) })
  CUISINES_LIST.forEach(c => { if (c.toLowerCase().includes(lower)) matches.push({ label: c, type: 'cuisine', color: 'text-blue-400 bg-blue-900/20 border-blue-700/30' }) })
  return matches.slice(0, 8)
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [activeTags, setActiveTags] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const { user, profile } = useAuthStore()

  useEffect(() => {
    const s = getSuggestions(query)
    setSuggestions(s)
    setShowSuggestions(query.length > 0 && s.length > 0)
  }, [query])

  function addTag(tag) {
    if (!activeTags.find(t => t.label === tag.label)) setActiveTags(prev => [...prev, tag])
    setQuery('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  function removeTag(label) { setActiveTags(prev => prev.filter(t => t.label !== label)) }

  const runSearch = useCallback(async (q, tags) => {
    const hasInput = q.trim() || tags.length > 0
    if (!hasInput) { setResults([]); return }
    setLoading(true)
    try {
      // Parse tag filters
      const tagDiets = tags.filter(t => t.type === 'diet').map(t => t.label)
      const tagAllergenFree = tags.filter(t => t.type === 'allergen').map(t => t.label.replace('no ', ''))
      const tagCuisine = tags.find(t => t.type === 'cuisine')?.label

      let dbQuery = supabase
        .from('recipes')
        .select(`*, profiles(id, username, full_name, avatar_url)`)
        .eq('is_published', true)
        .limit(40)

      // --- Keyword search: title + description + cuisine ---
      const kw = q.trim()
      if (kw) {
        dbQuery = dbQuery.or(`title.ilike.%${kw}%,description.ilike.%${kw}%,cuisine_type.ilike.%${kw}%`)
      }

      // --- Tag filters ---
      if (tagCuisine) dbQuery = dbQuery.ilike('cuisine_type', `%${tagCuisine}%`)

      // Diet tags from active chips (strict)
      for (const diet of tagDiets) {
        dbQuery = dbQuery.contains('ai_diet_tags', [diet])
      }

      // User dietary prefs — only when NOT doing a keyword search
      // (don't block "tiramisu" search just because user has dairy allergen)
      if (!kw && profile?.taste_profile?.diets?.length) {
        for (const diet of profile.taste_profile.diets) {
          dbQuery = dbQuery.contains('ai_diet_tags', [diet])
        }
      }

      // Allergen exclusions from chips
      if (tagAllergenFree.length) {
        dbQuery = dbQuery.not('allergens', 'ov', `{${tagAllergenFree.join(',')}}`)
      }

      // User allergens — only apply when NOT doing a keyword search
      if (!kw && profile?.allergens?.length) {
        dbQuery = dbQuery.not('allergens', 'ov', `{${profile.allergens.join(',')}}`)
      }

      dbQuery = dbQuery.order('save_count', { ascending: false })

      const { data, error } = await dbQuery
      if (error) throw error
      setResults(data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user?.id, profile])

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query, activeTags), 400)
    return () => clearTimeout(timer)
  }, [query, activeTags, runSearch])

  const hasInput = query.trim() || activeTags.length > 0

  return (
    <div className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-[#F5F5F0] mb-4">Search Recipes</h1>

      {/* Search box */}
      <div className="relative mb-3">
        <div className="min-h-[48px] flex flex-wrap items-center gap-1.5 px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-xl focus-within:border-[#FF6B35]/50 transition-colors">
          <SearchIcon size={16} className="text-[#888880] flex-shrink-0" />
          {activeTags.map(tag => (
            <span key={tag.label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${tag.color}`}>
              {tag.label}
              <button onClick={() => removeTag(tag.label)}><X size={10} /></button>
            </span>
          ))}
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query && setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={activeTags.length === 0 ? 'Search by dish name, cuisine, diet...' : 'Add more filters...'}
            className="flex-1 min-w-[140px] bg-transparent outline-none text-sm text-[#F5F5F0] placeholder:text-[#888880]"
          />
          {(query || activeTags.length > 0) && (
            <button onClick={() => { setQuery(''); setActiveTags([]); setResults([]) }} className="text-[#888880] hover:text-[#F5F5F0]">
              <X size={16} />
            </button>
          )}
        </div>

        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
            <p className="text-xs text-[#888880] px-3 pt-2 pb-1">Quick filters:</p>
            <div className="flex flex-wrap gap-1.5 p-2 pt-1">
              {suggestions.map(s => (
                <button key={s.label} onMouseDown={() => addTag(s)}
                  className={`px-3 py-1 rounded-full text-xs border ${s.color}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Popular tags */}
      {!hasInput && (
        <div className="mb-5">
          <p className="text-xs text-[#888880] mb-2">Popular filters:</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'vegan', type: 'diet', color: 'text-green-400 bg-green-900/20 border-green-700/30' },
              { label: 'gluten-free', type: 'diet', color: 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30' },
              { label: 'keto', type: 'diet', color: 'text-purple-400 bg-purple-900/20 border-purple-700/30' },
              { label: 'halal', type: 'diet', color: 'text-teal-400 bg-teal-900/20 border-teal-700/30' },
              { label: 'Italian', type: 'cuisine', color: 'text-blue-400 bg-blue-900/20 border-blue-700/30' },
              { label: 'Indian', type: 'cuisine', color: 'text-blue-400 bg-blue-900/20 border-blue-700/30' },
              { label: 'Japanese', type: 'cuisine', color: 'text-blue-400 bg-blue-900/20 border-blue-700/30' },
              { label: 'Thai', type: 'cuisine', color: 'text-blue-400 bg-blue-900/20 border-blue-700/30' },
            ].map(tag => (
              <button key={tag.label} onClick={() => addTag(tag)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors hover:opacity-80 ${tag.color}`}>
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Allergen notice when keyword searching */}
      {query.trim() && profile?.allergens?.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-xs bg-yellow-900/20 border border-yellow-700/30 text-yellow-400 rounded-xl px-3 py-2">
          <AlertTriangle size={12} className="flex-shrink-0" />
          Showing all results — allergen warnings will appear on cards
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-[#888880] text-sm mb-4">
          <Loader2 size={14} className="animate-spin" /> Searching...
        </div>
      )}

      {!loading && hasInput && results.length === 0 && (
        <EmptyState icon="🔍" title="No recipes found" description="Try different keywords or remove some filters." />
      )}

      {!hasInput && (
        <div className="text-center py-16 text-[#888880]">
          <SearchIcon size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Type a dish name or tap a filter above</p>
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
