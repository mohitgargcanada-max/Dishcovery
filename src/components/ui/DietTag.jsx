import { DIET_TAG_COLORS } from '../../utils/constants'

export default function DietTag({ tag }) {
  const cls = DIET_TAG_COLORS[tag] ?? 'bg-gray-800 text-gray-400 border-gray-700/40'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {tag}
    </span>
  )
}
