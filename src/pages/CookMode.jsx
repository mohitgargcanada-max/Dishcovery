import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, List } from 'lucide-react'
import { useRecipe } from '../hooks/useRecipe'

export default function CookMode() {
  const { id } = useParams()
  const { data: recipe } = useRecipe(id)
  const [stepIdx, setStepIdx] = useState(0)
  const [showIngredients, setShowIngredients] = useState(false)
  const navigate = useNavigate()
  const touchStartX = useRef(null)
  const wakeLockRef = useRef(null)

  const steps = recipe?.steps ?? []
  const total = steps.length

  // WakeLock
  useEffect(() => {
    async function requestWakeLock() {
      try {
        wakeLockRef.current = await navigator.wakeLock?.request('screen')
      } catch {}
    }
    requestWakeLock()
    return () => wakeLockRef.current?.release().catch(() => null)
  }, [])

  // Keyboard
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev()
      if (e.key === 'Escape') navigate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function next() { setStepIdx((i) => Math.min(i + 1, total - 1)) }
  function prev() { setStepIdx((i) => Math.max(i - 1, 0)) }

  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) next(); else prev()
    }
    touchStartX.current = null
  }

  if (!recipe) return null

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white">
          <X size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-white font-display font-semibold text-sm line-clamp-1 max-w-48">{recipe.title}</h2>
          <span className="text-white/40 text-xs">{stepIdx + 1} / {total}</span>
        </div>
        <button onClick={() => setShowIngredients(!showIngredients)} className="text-white/60 hover:text-white">
          <List size={22} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/10">
        <div className="h-full bg-[#FF6B35] transition-all duration-300" style={{ width: `${((stepIdx + 1) / total) * 100}%` }} />
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FF6B35]/20 border-2 border-[#FF6B35]/40 flex items-center justify-center text-[#FF6B35] text-2xl font-bold mb-8">
          {stepIdx + 1}
        </div>
        <p className="text-white text-xl leading-relaxed font-light max-w-lg">
          {steps[stepIdx]}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-6 border-t border-white/5">
        <button onClick={prev} disabled={stepIdx === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 text-white disabled:opacity-30 hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} /> Prev
        </button>
        <span className="text-white/30 text-xs">swipe or use ←→</span>
        {stepIdx < total - 1 ? (
          <button onClick={next}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FF6B35] text-white hover:bg-[#e55a25] transition-colors">
            Next <ChevronRight size={20} />
          </button>
        ) : (
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#4CAF7D] text-white hover:bg-[#3d9e6b] transition-colors">
            Done! 🎉
          </button>
        )}
      </div>

      {/* Ingredients panel */}
      <div className={`slide-up-panel absolute inset-x-0 bottom-0 max-h-[60vh] bg-[#1A1A1A] border-t border-white/10 rounded-t-2xl ${showIngredients ? 'open' : ''}`}
        style={{ backdropFilter: showIngredients ? 'blur(10px)' : 'none' }}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-semibold">Ingredients</h3>
          <button onClick={() => setShowIngredients(false)} className="text-white/60 hover:text-white"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-1 max-h-[calc(60vh-60px)]">
          {(recipe.ingredients ?? []).map((ing, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 text-sm border-b border-white/5 last:border-0">
              <span className="text-[#FF6B35] font-mono w-20 flex-shrink-0">{ing.amount} {ing.unit}</span>
              <span className="text-white">{ing.item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
