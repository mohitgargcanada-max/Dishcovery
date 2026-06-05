const ICONS = {
  nuts: '🥜', dairy: '🥛', gluten: '🌾', eggs: '🥚',
  soy: '🫘', shellfish: '🦐', fish: '🐟', sesame: '🌿',
}

export default function AllergenBadge({ allergen, warn = false }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
      warn
        ? 'bg-red-900/30 text-red-400 border-red-700/40'
        : 'bg-[#242424] text-[#888880] border-white/10'
    }`}>
      <span>{ICONS[allergen] ?? '⚠️'}</span>
      {allergen}
    </span>
  )
}
