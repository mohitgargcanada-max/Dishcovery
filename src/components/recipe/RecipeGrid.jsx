import RecipeCard from './RecipeCard'
import SkeletonCard from '../ui/SkeletonCard'

export default function RecipeGrid({ recipes = [], loading = false, skeletonCount = 6 }) {
  if (loading && recipes.length === 0) {
    return (
      <div className="masonry-grid">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="masonry-item">
            <SkeletonCard tall={i % 3 === 0} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="masonry-grid">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="masonry-item">
          <RecipeCard recipe={recipe} />
        </div>
      ))}
    </div>
  )
}
