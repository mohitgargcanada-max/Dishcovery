import { useEffect, useRef, useState } from 'react'
import { useRecipes } from '../hooks/useRecipes'
import { useAuthStore } from '../store/authStore'
import RecipeGrid from '../components/recipe/RecipeGrid'
import CommunityBar from '../components/ui/CommunityBar'
import SkeletonCard from '../components/ui/SkeletonCard'
import EmptyState from '../components/ui/EmptyState'
import { Link } from 'react-router-dom'

const TABS = [
  { id: 'trending', label: '🔥 Trending' },
  { id: 'foryou', label: '✨ For You' },
]

export default function Feed() {
  const [tab, setTab] = useState('trending')
  const { profile } = useAuthStore()
  const sentinelRef = useRef(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useRecipes(
    tab,
    profile?.taste_profile,
    profile?.allergens ?? []
  )

  const recipes = data?.pages.flatMap((p) => p) ?? []

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#F5F5F0]">
            {profile?.full_name ? `Hey, ${profile.full_name.split(' ')[0]} 👋` : 'Discover Recipes'}
          </h1>
          <p className="text-[#888880] text-sm mt-0.5">What are you cooking today?</p>
        </div>
        <Link to="/generate"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#FFB800]/10 border border-[#FFB800]/20 text-[#FFB800] rounded-xl text-sm font-medium hover:bg-[#FFB800]/20 transition-colors ai-badge-glow">
          ✨ Generate
        </Link>
      </div>

      {/* Community cooks */}
      <CommunityBar />

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1A1A1A] p-1 rounded-xl w-fit mb-6">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id ? 'bg-[#FF6B35] text-white' : 'text-[#888880] hover:text-[#F5F5F0]'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {recipes.length === 0 && !isLoading ? (
        <EmptyState
          icon="🍽️"
          title="No recipes yet"
          description={tab === 'foryou' ? 'Update your taste profile to see personalised recipes.' : 'Be the first to post a recipe!'}
          action={<Link to="/post" className="px-4 py-2 bg-[#FF6B35] text-white rounded-xl text-sm font-medium">Post a Recipe</Link>}
        />
      ) : (
        <RecipeGrid recipes={recipes} loading={isLoading} />
      )}

      {/* Load more sentinel */}
      <div ref={sentinelRef} className="h-4" />
      {isFetchingNextPage && (
        <div className="masonry-grid mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="masonry-item"><SkeletonCard /></div>
          ))}
        </div>
      )}
    </div>
  )
}
