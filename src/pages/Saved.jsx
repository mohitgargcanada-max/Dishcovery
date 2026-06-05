import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useSavedRecipes } from '../hooks/useSaves'
import RecipeGrid from '../components/recipe/RecipeGrid'
import EmptyState from '../components/ui/EmptyState'
import { Link } from 'react-router-dom'

const TABS = ['All Saved', 'Favourites']

export default function Saved() {
  const [tab, setTab] = useState('All Saved')
  const { user } = useAuthStore()
  const { data: saves = [], isLoading } = useSavedRecipes(user?.id)

  const recipes = saves
    .filter((s) => tab === 'All Saved' || s.is_favourite)
    .map((s) => s.recipes)
    .filter(Boolean)

  return (
    <div className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-[#F5F5F0] mb-6">Saved Recipes</h1>

      <div className="flex gap-1 bg-[#1A1A1A] p-1 rounded-xl w-fit mb-6">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-[#FF6B35] text-white' : 'text-[#888880] hover:text-[#F5F5F0]'}`}>
            {t} {t === 'Favourites' ? '❤️' : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <RecipeGrid recipes={[]} loading />
      ) : recipes.length === 0 ? (
        <EmptyState
          icon="🔖"
          title={tab === 'Favourites' ? 'No favourites yet' : 'No saved recipes'}
          description="Save recipes from the feed to find them here."
          action={<Link to="/feed" className="px-4 py-2 bg-[#FF6B35] text-white rounded-xl text-sm font-medium">Browse Feed</Link>}
        />
      ) : (
        <RecipeGrid recipes={recipes} />
      )}
    </div>
  )
}
