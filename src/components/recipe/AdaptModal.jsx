import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { adaptRecipe } from '../../lib/api'
import { DIET_TAGS } from '../../utils/constants'
import { useAuthStore } from '../../store/authStore'

export default function AdaptModal({ recipe, onClose, onResult }) {
  const { profile } = useAuthStore()
  const [targetDiet, setTargetDiet] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAdapt() {
    if (!targetDiet) return
    setLoading(true)
    setError(null)
    try {
      const result = await adaptRecipe({
        recipe,
        targetDiet,
        allergens: profile?.allergens ?? [],
      })
      onResult(result)
      onClose()
    } catch (e) {
      setError('Failed to adapt recipe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#FFB800]">✨</span>
            <h2 className="text-[#F5F5F0] font-semibold">Adapt Recipe</h2>
          </div>
          <button onClick={onClose} className="text-[#888880] hover:text-[#F5F5F0]"><X size={20} /></button>
        </div>

        <p className="text-sm text-[#888880]">Choose a dietary style and AI will adapt <strong className="text-[#F5F5F0]">{recipe.title}</strong> for you.</p>

        <div className="grid grid-cols-2 gap-2">
          {DIET_TAGS.map((tag) => (
            <button key={tag} onClick={() => setTargetDiet(tag)}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors capitalize ${
                targetDiet === tag
                  ? 'bg-[#FF6B35]/20 border-[#FF6B35]/50 text-[#FF6B35]'
                  : 'bg-[#242424] border-white/10 text-[#888880] hover:border-white/20 hover:text-[#F5F5F0]'
              }`}>
              {tag}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button onClick={handleAdapt} disabled={!targetDiet || loading}
          className="w-full py-2.5 bg-[#FF6B35] text-white rounded-xl font-medium disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-[#e55a25] transition-colors">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Adapting...</> : '✨ Adapt with AI'}
        </button>
      </div>
    </div>
  )
}
