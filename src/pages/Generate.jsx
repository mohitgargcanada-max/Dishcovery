import { useState } from 'react'
import { Sparkles, Loader2, Plus, Bookmark, ArrowRight } from 'lucide-react'
import { generateRecipe } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import ChipInput from '../components/ui/ChipInput'
import DietTag from '../components/ui/DietTag'
import { DIET_TAGS } from '../utils/constants'
import { Link, useNavigate } from 'react-router-dom'
import { formatTime } from '../utils/helpers'

export default function Generate() {
  const [ingredients, setIngredients] = useState([])
  const [allergens, setAllergens] = useState([])
  const [dietary, setDietary] = useState([])
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState([])
  const [error, setError] = useState(null)
  const { user, profile } = useAuthStore()
  const addToast = useUIStore((s) => s.addToast)
  const navigate = useNavigate()

  function toggleDiet(tag) {
    setDietary((d) => d.includes(tag) ? d.filter((t) => t !== tag) : [...d, tag])
  }

  async function handleGenerate() {
    if (ingredients.length === 0) { addToast('Add at least one ingredient', 'error'); return }
    setLoading(true)
    setError(null)
    setRecipes([])
    try {
      const result = await generateRecipe({
        ingredients,
        dietary: [...dietary, ...(profile?.taste_profile?.diets ?? [])],
        allergens: [...allergens, ...(profile?.allergens ?? [])],
      })
      setRecipes(result.recipes ?? [])
    } catch (e) {
      setError(e.message || 'Generation failed. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
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
    }).select().single()
    if (!error) {
      addToast('Recipe saved!', 'success')
      navigate(`/recipe/${data.id}`)
    }
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[#FFB800] text-2xl ai-badge-glow">✨</span>
        <h1 className="font-display text-2xl font-bold text-[#F5F5F0]">AI Recipe Generator</h1>
      </div>

      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 space-y-5">
        <div>
          <label className="block text-sm text-[#888880] mb-1.5">Ingredients you have *</label>
          <ChipInput
            value={ingredients}
            onChange={setIngredients}
            placeholder="e.g. chicken, garlic, lemon..."
          />
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

        <button onClick={handleGenerate} disabled={loading || ingredients.length === 0}
          className="w-full py-3 bg-[#FF6B35] text-white rounded-xl font-medium disabled:opacity-40 hover:bg-[#e55a25] transition-colors flex items-center justify-center gap-2">
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Dishcovery AI is cooking...</>
          ) : (
            <><Sparkles size={16} /> Generate 3 Recipes</>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-700/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      {/* Results */}
      {recipes.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="font-display text-lg font-semibold text-[#F5F5F0]">Generated Recipes</h2>
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

              <details className="mb-4">
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

              <div className="flex gap-2">
                <button onClick={() => handleSave(r)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B35] text-white rounded-xl text-sm font-medium hover:bg-[#e55a25] transition-colors">
                  <Bookmark size={14} /> Save Recipe
                </button>
                <button onClick={() => handleSave(r)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1A1A1A] border border-white/10 text-[#888880] hover:text-[#F5F5F0] rounded-xl text-sm transition-colors">
                  <Plus size={14} /> Post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
