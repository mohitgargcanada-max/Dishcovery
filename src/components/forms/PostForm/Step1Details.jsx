import { CUISINES } from '../../../utils/constants'

export default function Step1Details({ data, onChange }) {
  const update = (k, v) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-[#888880] mb-1.5">Recipe Title *</label>
        <input
          value={data.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="e.g. Creamy Tuscan Chicken"
          className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2.5 text-[#F5F5F0] placeholder:text-[#888880] focus:outline-none focus:border-[#FF6B35]/50 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-[#888880] mb-1.5">
          Description <span className="text-[#FF6B35]">*</span>
        </label>
        <textarea
          value={data.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Describe your dish in 2–3 sentences. What makes it special? What does it taste like?"
          rows={3}
          className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2.5 text-[#F5F5F0] placeholder:text-[#888880] focus:outline-none focus:border-[#FF6B35]/50 text-sm resize-none"
        />
        <p className="text-xs text-[#888880] mt-1">
          {data.description?.trim().split(/\s+/).filter(Boolean).length || 0} words
          <span className="ml-1">{(data.description?.trim().split(/\s+/).filter(Boolean).length || 0) >= 5 ? '✓' : '— need at least 5'}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-[#888880] mb-1.5">Prep (min)</label>
          <input type="number" min="0"
            value={data.prep_time}
            onChange={(e) => update('prep_time', +e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#FF6B35]/50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-[#888880] mb-1.5">Cook (min)</label>
          <input type="number" min="0"
            value={data.cook_time}
            onChange={(e) => update('cook_time', +e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#FF6B35]/50 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-[#888880] mb-1.5">Servings</label>
          <input type="number" min="1"
            value={data.serving_size}
            onChange={(e) => update('serving_size', +e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#FF6B35]/50 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-[#888880] mb-2">Cuisine</label>
        <div className="grid grid-cols-4 gap-2">
          {CUISINES.map(({ label, emoji }) => (
            <button key={label} type="button" onClick={() => update('cuisine_type', label)}
              className={`py-2 rounded-lg text-sm border transition-colors ${
                data.cuisine_type === label
                  ? 'bg-[#FF6B35]/20 border-[#FF6B35]/50 text-[#FF6B35]'
                  : 'bg-[#1A1A1A] border-white/10 text-[#888880] hover:border-white/20'
              }`}>
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
