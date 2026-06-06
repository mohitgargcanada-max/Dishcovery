import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Heart, Clock, Users, Flame } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useSaveRecipe, useSaveStatus } from '../../hooks/useSaves'
import { useUIStore } from '../../store/uiStore'
import DietTag from '../ui/DietTag'
import AllergenBadge from '../ui/AllergenBadge'
import { formatTime } from '../../utils/helpers'

export default function RecipeCard({ recipe }) {
  const { user, profile } = useAuthStore()
  const { data: saveStatus } = useSaveStatus(user?.id, recipe.id)
  const saveRecipe = useSaveRecipe()
  const addToast = useUIStore((s) => s.addToast)

  const isSaved = !!saveStatus
  const userAllergens = profile?.allergens ?? []
  const warnAllergens = (recipe.allergens ?? []).filter((a) => userAllergens.includes(a))

  async function handleSave(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { addToast('Sign in to save recipes', 'error'); return }
    await saveRecipe.mutateAsync({ userId: user.id, recipeId: recipe.id })
  }

  const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)

  return (
    <Link to={`/recipe/${recipe.id}`}
      className="block bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200 group">
      {/* Image */}
      <div className="relative overflow-hidden bg-[#242424]">
        {recipe.photo_url ? (
          <img
            src={recipe.photo_url}
            alt={recipe.title}
            loading="lazy"
            className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ height: recipe.photo_url ? '180px' : '120px' }}
          />
        ) : (
          <div className="h-28 flex items-center justify-center text-4xl">🍽️</div>
        )}
        {/* Save button */}
        <button
          onClick={handleSave}
          className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-sm transition-colors ${
            isSaved
              ? 'bg-[#FF6B35] text-white'
              : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/60'
          }`}>
          <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        {warnAllergens.length > 0 && (
          <div className="absolute top-2 left-2 bg-red-900/80 text-red-300 text-xs px-1.5 py-0.5 rounded-md backdrop-blur-sm">
            ⚠️ Allergen
          </div>
        )}
        {recipe.ai_nutrition_score && (
          <div className="absolute bottom-2 left-2 ai-badge-glow bg-[#FFB800]/20 border border-[#FFB800]/30 text-[#FFB800] text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            ✨ AI Scored
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="font-display font-semibold text-[#F5F5F0] text-sm leading-tight line-clamp-2">{recipe.title}</h3>

        {recipe.description && (
          <p className="text-[#888880] text-xs line-clamp-2 leading-relaxed">{recipe.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-[#888880]">
          {totalTime > 0 && (
            <span className="flex items-center gap-1"><Clock size={11} />{formatTime(totalTime)}</span>
          )}
          {recipe.serving_size && (
            <span className="flex items-center gap-1"><Users size={11} />{recipe.serving_size}</span>
          )}
          {recipe.ai_calories_per_serving && (
            <span className="flex items-center gap-1"><Flame size={11} />{recipe.ai_calories_per_serving} cal</span>
          )}
        </div>

        {/* Diet tags */}
        {recipe.ai_diet_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.ai_diet_tags.slice(0, 3).map((t) => <DietTag key={t} tag={t} />)}
          </div>
        )}

        {/* Allergen warnings */}
        {warnAllergens.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {warnAllergens.map((a) => <AllergenBadge key={a} allergen={a} warn />)}
          </div>
        )}

        {/* Author */}
        {recipe.profiles && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
            {recipe.profiles.avatar_url ? (
              <img src={recipe.profiles.avatar_url} className="w-4 h-4 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[9px] text-[#FF6B35] font-bold">
                {(recipe.profiles.full_name?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <span className="text-xs text-[#888880]">{recipe.profiles.full_name || recipe.profiles.username}</span>
            <span className="ml-auto flex items-center gap-0.5 text-xs text-[#888880]">
              <Bookmark size={10} /> {recipe.save_count ?? 0}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
