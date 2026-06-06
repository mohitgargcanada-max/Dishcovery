import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Clock, Users, Flame, ChefHat, Bookmark, Heart, ArrowLeft, Utensils, Loader2 } from 'lucide-react'
import { useRecipe } from '../hooks/useRecipe'
import { useSaveRecipe, useSaveStatus, useCookedThis } from '../hooks/useSaves'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import AIScoreCard from '../components/recipe/AIScoreCard'
import StepsBurner from '../components/ui/StepsBurner'
import { scoreRecipe } from '../lib/api'
import AllergenBadge from '../components/ui/AllergenBadge'
import DietTag from '../components/ui/DietTag'
import AdaptModal from '../components/recipe/AdaptModal'
import ShareButton from '../components/ui/ShareButton'
import SkeletonCard from '../components/ui/SkeletonCard'
import { formatTime, timeAgo } from '../utils/helpers'
import { useRecipeImage } from '../hooks/useRecipeImage'

export default function RecipeDetail() {
  const { id } = useParams()
  const { data: recipe, isLoading } = useRecipe(id)
  const { user, profile } = useAuthStore()
  const { data: saveStatus } = useSaveStatus(user?.id, id)
  const saveRecipe = useSaveRecipe()
  const cookedThis = useCookedThis()
  const addToast = useUIStore((s) => s.addToast)
  const imageSrc = useRecipeImage(recipe)
  const [showAdapt, setShowAdapt] = useState(false)
  const [adaptedRecipe, setAdaptedRecipe] = useState(null)
  const navigate = useNavigate()

  if (isLoading) return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">
      <div className="h-64 bg-[#1A1A1A] rounded-2xl animate-pulse" />
      <SkeletonCard />
    </div>
  )
  if (!recipe) return (
    <div className="px-4 py-20 text-center text-[#888880]">Recipe not found.</div>
  )

  const displayed = adaptedRecipe ?? recipe
  const isSaved = !!saveStatus
  const userAllergens = profile?.allergens ?? []
  const warnAllergens = (recipe.allergens ?? []).filter((a) => userAllergens.includes(a))
  const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)

  async function handleSave() {
    if (!user) { addToast('Sign in to save', 'error'); return }
    await saveRecipe.mutateAsync({ userId: user.id, recipeId: recipe.id })
  }

  async function handleCooked() {
    if (!user) { addToast('Sign in first', 'error'); return }
    const result = await cookedThis.mutateAsync({ userId: user.id, recipeId: recipe.id })
    if (result.cooked) addToast('Marked as cooked! 🍳', 'success')
  }

  async function handleAdaptResult({ adapted, changes }) {
    // Show adapted recipe immediately
    setAdaptedRecipe({ ...recipe, ...adapted })
    addToast(`Recipe adapted! Re-scoring nutrition...`, 'success')

    // Re-score with new ingredients/steps to update calories & nutrition
    try {
      const scores = await scoreRecipe({
        title: adapted.title || recipe.title,
        ingredients: adapted.ingredients || recipe.ingredients,
        steps: adapted.steps || recipe.steps,
        cuisine: recipe.cuisine_type,
      })
      if (scores && !scores.error) {
        setAdaptedRecipe(prev => ({
          ...prev,
          ai_nutrition_score: scores.nutrition_score,
          ai_difficulty_score: scores.difficulty_score,
          ai_authenticity_score: scores.authenticity_score,
          ai_calories_per_serving: scores.calories_per_serving,
          ai_diet_tags: scores.diet_tags ?? prev.ai_diet_tags,
          allergens: scores.allergen_warnings ?? prev.allergens,
        }))
        addToast('✨ Nutrition updated for adapted recipe', 'success')
      }
    } catch { /* keep original scores */ }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[#888880] hover:text-[#F5F5F0] text-sm mb-4 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero image */}
      <div className="rounded-2xl overflow-hidden mb-4 h-64">
        <img
          src={imageSrc}
          alt={recipe.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80' }}
        />
      </div>

      {/* Adapted banner */}
      {adaptedRecipe && (
        <div className="mb-4 flex items-center gap-2 bg-[#FFB800]/10 border border-[#FFB800]/20 text-[#FFB800] text-sm rounded-xl px-3 py-2">
          <span>✨</span> Showing AI-adapted version
          <button onClick={() => setAdaptedRecipe(null)} className="ml-auto text-xs underline">Reset</button>
        </div>
      )}

      {/* Title & meta */}
      <h1 className="font-display text-2xl font-bold text-[#F5F5F0] mb-2">{displayed.title}</h1>
      {displayed.description && (
        <p className="text-[#888880] text-sm mb-4 leading-relaxed">{displayed.description}</p>
      )}

      <div className="flex flex-wrap gap-4 text-sm text-[#888880] mb-4">
        {totalTime > 0 && <span className="flex items-center gap-1"><Clock size={14} />{formatTime(totalTime)}</span>}
        {recipe.serving_size && <span className="flex items-center gap-1"><Users size={14} />{recipe.serving_size} servings</span>}
        {recipe.ai_calories_per_serving && <span className="flex items-center gap-1"><Flame size={14} />{recipe.ai_calories_per_serving} cal</span>}
        {recipe.cuisine_type && <span className="flex items-center gap-1"><ChefHat size={14} />{recipe.cuisine_type}</span>}
      </div>

      {/* Diet tags */}
      {recipe.ai_diet_tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {recipe.ai_diet_tags.map((t) => <DietTag key={t} tag={t} />)}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            isSaved ? 'bg-[#FF6B35] text-white' : 'bg-[#1A1A1A] border border-white/10 text-[#888880] hover:text-[#F5F5F0]'
          }`}>
          <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button onClick={handleCooked} disabled={cookedThis.isPending}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] border border-white/10 text-[#888880] hover:text-[#F5F5F0] rounded-xl text-sm font-medium transition-colors">
          🍳 Cooked This
        </button>
        <button onClick={() => setShowAdapt(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FFB800]/10 border border-[#FFB800]/20 text-[#FFB800] rounded-xl text-sm font-medium hover:bg-[#FFB800]/20 transition-colors ai-badge-glow">
          ✨ Adapt
        </button>
        <ShareButton recipe={recipe} />
        <Link to={`/recipe/${id}/cook`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4CAF7D]/15 border border-[#4CAF7D]/30 text-[#4CAF7D] rounded-xl text-sm font-medium hover:bg-[#4CAF7D]/25 transition-colors ml-auto">
          <Utensils size={14} /> Cook Mode
        </Link>
      </div>

      {/* Allergen warnings */}
      {warnAllergens.length > 0 && (
        <div className="mb-6 p-3 bg-red-900/20 border border-red-700/30 rounded-xl">
          <p className="text-red-400 text-sm font-medium mb-2">⚠️ Contains your allergens</p>
          <div className="flex flex-wrap gap-1.5">
            {warnAllergens.map((a) => <AllergenBadge key={a} allergen={a} warn />)}
          </div>
        </div>
      )}

      {/* AI Score */}
      <AIScoreCard recipe={displayed} />

      {/* Steps to burn */}
      {displayed.ai_calories_per_serving && (
        <StepsBurner calories={displayed.ai_calories_per_serving} />
      )}

      {/* Ingredients */}
      <div className="mt-6">
        <h2 className="font-display text-lg font-semibold text-[#F5F5F0] mb-3">Ingredients</h2>
        <div className="bg-[#1A1A1A] border border-white/5 rounded-xl divide-y divide-white/5">
          {(displayed.ingredients ?? []).map((ing, i) => (
            <div key={i} className="flex items-center px-4 py-2.5 text-sm">
              <span className="text-[#FF6B35] font-mono w-16 flex-shrink-0">
                {ing.amount} {ing.unit}
              </span>
              <span className="text-[#F5F5F0]">{ing.item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="mt-6">
        <h2 className="font-display text-lg font-semibold text-[#F5F5F0] mb-3">Instructions</h2>
        <div className="space-y-3">
          {(displayed.steps ?? []).map((step, i) => (
            <div key={i} className="flex gap-3 bg-[#1A1A1A] border border-white/5 rounded-xl p-4">
              <div className="w-7 h-7 flex-shrink-0 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <p className="text-[#F5F5F0] text-sm leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Author */}
      {recipe.profiles && (
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3">
          <Link to={`/profile/${recipe.profiles.username || recipe.profiles.id}`} className="flex items-center gap-3">
            {recipe.profiles.avatar_url ? (
              <img src={recipe.profiles.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] font-bold">
                {(recipe.profiles.full_name?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-[#F5F5F0] text-sm font-medium">{recipe.profiles.full_name}</p>
              <p className="text-[#888880] text-xs">@{recipe.profiles.username || 'user'} · {timeAgo(recipe.created_at)}</p>
            </div>
          </Link>
        </div>
      )}

      {showAdapt && (
        <AdaptModal recipe={recipe} onClose={() => setShowAdapt(false)} onResult={handleAdaptResult} />
      )}
    </div>
  )
}
