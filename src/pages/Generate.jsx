import { useState, useEffect, useRef } from 'react'
import { Sparkles, Loader2, Plus, Bookmark, ArrowLeft, MessageSquare, Tag } from 'lucide-react'
import { generateRecipe } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import ChipInput from '../components/ui/ChipInput'
import DietTag from '../components/ui/DietTag'
import { DIET_TAGS } from '../utils/constants'
import { useNavigate } from 'react-router-dom'
import { formatTime } from '../utils/helpers'
import { getImageByTitle } from '../utils/foodImages'

const MODES = [
  { id: 'ingredients', label: 'By Ingredients', icon: Tag },
  { id: 'natural', label: 'Ask Naturally', icon: MessageSquare },
]

export default function Generate() {
  const [mode, setMode] = useState('ingredients')
  const [ingredients, setIngredients] = useState([])
  const [allergens, setAllergens] = useState([])
  const [dietary, setDietary] = useState([])
  const [nlQuery, setNlQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState([])
  const [error, setError] = useState(null)
  const { user, profile } = useAuthStore()
  const addToast = useUIStore((s) => s.addToast)
  const navigate = useNavigate()
  const debounceRef = useRef(null)

  // Auto-generate as user types (debounced)
  useEffect(() => {
    const canAutoGenerate =
      (mode === 'ingredients' && ingredients.length >= 2) ||
      (mode === 'natural' && nlQuery.trim().length >= 15)

    if (!canAutoGenerate) return

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      handleGenerate()
    }, 15000)

    return () => clearTimeout(debounceRef.current)
  }, [ingredients, nlQuery, mode])

  function toggleDiet(tag) {
    setDietary((d) => d.includes(tag) ? d.filter((t) => t !== tag) : [...d, tag])
  }

  async function handleGenerate() {
    let finalIngredients = ingredients
    let finalDietary = [...dietary, ...(profile?.taste_profile?.diets ?? [])]
    let finalAllergens = [...allergens, ...(profile?.allergens ?? [])]

    if (mode === 'natural') {
      if (!nlQuery.trim()) { addToast('Please describe what you want to cook', 'error'); return }
      // Parse natural language into structured data
      const parsed = parseNaturalQuery(nlQuery)
      finalIngredients = parsed.ingredients.length ? parsed.ingredients : ['any ingredients']
      finalDietary = [...new Set([...finalDietary, ...parsed.dietary])]
      finalAllergens = [...new Set([...finalAllergens, ...parsed.allergens])]
    } else {
      if (finalIngredients.length === 0) { addToast('Add at least one ingredient', 'error'); return }
    }

    setLoading(true)
    setError(null)
    setRecipes([])
    try {
      const result = await generateRecipe({
        ingredients: finalIngredients,
        dietary: finalDietary,
        allergens: finalAllergens,
        ...(mode === 'natural' ? { freeform: nlQuery } : {}),
      })
      setRecipes(result.recipes ?? [])
    } catch (e) {
      setError(e.message || 'Generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function parseNaturalQuery(q) {
    const lower = q.toLowerCase()
    const dietary = DIET_TAGS.filter((t) => lower.includes(t.replace('-', ' ')) || lower.includes(t))
    const allergenWords = ['nuts', 'dairy', 'gluten', 'eggs', 'soy', 'shellfish', 'fish', 'sesame']
    const allergens = allergenWords.filter((a) => lower.includes('no ' + a) || lower.includes('without ' + a) || lower.includes('free ' + a))
    const words = q.match(/\b[a-zA-Z]{3,}\b/g) ?? []
    const stopWords = new Set(['want', 'make', 'cook', 'with', 'for', 'the', 'and', 'that', 'this', 'have', 'using', 'some', 'can', 'please', 'dish', 'meal', 'food', 'recipe', 'something', 'quick', 'easy', 'healthy'])
    const ingredients = words.filter((w) => !stopWords.has(w.toLowerCase()) && !DIET_TAGS.includes(w.toLowerCase()) && !allergenWords.includes(w.toLowerCase())).slice(0, 6)
    return { ingredients, dietary, allergens }
  }

  async function handleSave(recipe) {
    if (!user) { addToast('Sign in to save', 'error'); return }
    const { data, error } = await supabase.from('recipes').insert({
      user_id: user.id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      cuisine_type: recipe.cuisine,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      serving_size: recipe.serving_size,
      ai_diet_tags: recipe.diet_tags ?? [],
      photo_url: getImageByTitle(recipe.title),
      is_published: true,
    }).select().single()
    if (!error) {
      addToast('Recipe saved! ✨', 'success')
      navigate(`/recipe/${data.id}`)
    } else {
      addToast('Failed to save recipe', 'error')
    }
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 text-[#888880] hover:text-[#F5F5F0] hover:bg-white/5 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[#FFB800] text-2xl">✨</span>
          <h1 className="font-display text-2xl font-bold text-[#F5F5F0]">AI Recipe Generator</h1>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-[#1A1A1A] p-1 rounded-xl mb-5">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setMode(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === id ? 'bg-[#FF6B35] text-white' : 'text-[#888880] hover:text-[#F5F5F0]'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 space-y-5">

        {mode === 'natural' ? (
          <div>
            <label className="block text-sm text-[#888880] mb-1.5">Describe what you want</label>
            <textarea
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              placeholder={'e.g. "I want a quick vegan dinner with chickpeas and spinach, no nuts"\nor "Healthy chicken meal under 500 calories for meal prep"'}
              rows={4}
              className="w-full bg-[#242424] border border-white/10 rounded-xl px-4 py-3 text-[#F5F5F0] placeholder:text-[#888880]/60 focus:outline-none focus:border-[#FF6B35]/50 text-sm resize-none leading-relaxed"
            />
            <p className="text-xs text-[#888880] mt-1.5">✨ AI will understand your request naturally — mention ingredients, dietary needs, cuisine, or any preferences</p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm text-[#888880] mb-1.5">Ingredients you have *</label>
              <ChipInput
                value={ingredients}
                onChange={setIngredients}
                placeholder="Type an ingredient and press Enter or comma..."
              />
              <p className="text-xs text-[#888880] mt-1">Press Enter, comma, or click away to add each ingredient</p>
            </div>

            <div>
              <label className="block text-sm text-[#888880] mb-2">Dietary preferences</label>
              <div className="flex flex-wrap gap-2">
                {DIET_TAGS.map((tag) => (
                  <button key={tag} type="button" onClick={() => toggleDiet(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs border capitalize transition-colors ${dietary.includes(tag) ? 'bg-[#FF6B35]/20 border-[#FF6B35]/50 text-[#FF6B35]' : 'bg-[#242424] border-white/10 text-[#888880] hover:border-white/20'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#888880] mb-1.5">Exclude allergens</label>
              <ChipInput
                value={allergens}
                onChange={setAllergens}
                placeholder="e.g. nuts, dairy..."
              />
            </div>
          </>
        )}

        {/* Auto-generate hint */}
        {!loading && recipes.length === 0 && (
          <p className="text-center text-xs text-[#888880]">
            {mode === 'ingredients'
              ? ingredients.length < 2
                ? `Add ${2 - ingredients.length} more ingredient${ingredients.length === 1 ? '' : 's'} to auto-generate`
                : '✨ Auto-generating in 15 seconds — or press Generate now'
              : nlQuery.trim().length < 15
              ? 'Keep typing — AI will generate automatically'
              : '✨ Auto-generating in 15 seconds — or press Generate now'}
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || (mode === 'ingredients' && ingredients.length === 0) || (mode === 'natural' && !nlQuery.trim())}
          className="w-full py-3 bg-[#FF6B35] text-white rounded-xl font-medium disabled:opacity-40 hover:bg-[#e55a25] transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Dishcovery AI is cooking...</>
          ) : (
            <><Sparkles size={16} /> {recipes.length > 0 ? 'Regenerate' : 'Generate 3 Recipes'}</>
          )}
        </button>
      </div>

      {loading && (
        <div className="mt-4 p-4 bg-[#FFB800]/5 border border-[#FFB800]/20 rounded-xl flex items-center gap-3">
          <span className="text-2xl animate-bounce">👨‍🍳</span>
          <div>
            <p className="text-[#FFB800] text-sm font-medium">Dishcovery AI is cooking...</p>
            <p className="text-[#888880] text-xs mt-0.5">Crafting 3 personalised recipes for you</p>
          </div>
          <Loader2 size={18} className="ml-auto text-[#FFB800] animate-spin" />
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-700/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      {/* Results */}
      {recipes.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="font-display text-lg font-semibold text-[#F5F5F0]">✨ Generated Recipes</h2>
          {recipes.map((r, i) => (
            <div key={i} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 hover:border-orange-500/30 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-display font-semibold text-[#F5F5F0] text-lg">{r.title}</h3>
                <span className="text-xs text-[#888880] bg-[#242424] px-2 py-0.5 rounded-full flex-shrink-0">{r.cuisine}</span>
              </div>
              <p className="text-[#888880] text-sm leading-relaxed mb-3">{r.description}</p>

              <div className="flex gap-4 text-xs text-[#888880] mb-3">
                {r.prep_time && <span>Prep: {formatTime(r.prep_time)}</span>}
                {r.cook_time && <span>Cook: {formatTime(r.cook_time)}</span>}
                <span>{r.serving_size} servings</span>
              </div>

              {r.diet_tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {r.diet_tags.map((t) => <DietTag key={t} tag={t} />)}
                </div>
              )}

              <details className="mb-3">
                <summary className="text-sm text-[#888880] cursor-pointer hover:text-[#F5F5F0] mb-2">
                  {r.ingredients?.length} ingredients
                </summary>
                <ul className="space-y-1 mt-2">
                  {r.ingredients?.map((ing, j) => (
                    <li key={j} className="text-xs text-[#888880]">
                      <span className="text-[#FF6B35] font-mono">{ing.amount} {ing.unit}</span> {ing.item}
                    </li>
                  ))}
                </ul>
              </details>

              <details className="mb-4">
                <summary className="text-sm text-[#888880] cursor-pointer hover:text-[#F5F5F0] mb-2">
                  {r.steps?.length} steps
                </summary>
                <ol className="space-y-2 mt-2">
                  {r.steps?.map((step, j) => (
                    <li key={j} className="flex gap-2 text-xs text-[#888880]">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center text-[10px] font-bold">{j + 1}</span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </details>

              <div className="flex gap-2">
                <button onClick={() => handleSave(r)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B35] text-white rounded-xl text-sm font-medium hover:bg-[#e55a25] transition-colors">
                  <Bookmark size={14} /> Save & View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
