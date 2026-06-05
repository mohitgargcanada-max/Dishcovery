import { ALLERGENS } from '../../utils/constants'
import AllergenBadge from '../ui/AllergenBadge'

export default function AllergenPicker({ value = [], onChange }) {
  function toggle(allergen) {
    if (value.includes(allergen)) {
      onChange(value.filter((a) => a !== allergen))
    } else {
      onChange([...value, allergen])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ALLERGENS.map((a) => {
        const selected = value.includes(a)
        return (
          <button key={a} type="button" onClick={() => toggle(a)}
            className={`transition-all rounded-full border px-3 py-1 text-sm ${
              selected
                ? 'bg-red-900/30 border-red-700/50 text-red-400'
                : 'bg-[#242424] border-white/10 text-[#888880] hover:border-white/20'
            }`}>
            {a}
          </button>
        )
      })}
    </div>
  )
}
