import { Plus, Trash2 } from 'lucide-react'

export default function Step2Recipe({ data, onChange }) {
  const update = (k, v) => onChange({ ...data, [k]: v })

  function addIngredient() {
    update('ingredients', [...data.ingredients, { amount: '', unit: '', item: '' }])
  }
  function updateIngredient(i, field, val) {
    const list = [...data.ingredients]
    list[i] = { ...list[i], [field]: val }
    update('ingredients', list)
  }
  function removeIngredient(i) {
    update('ingredients', data.ingredients.filter((_, idx) => idx !== i))
  }

  function addStep() {
    update('steps', [...data.steps, ''])
  }
  function updateStep(i, val) {
    const list = [...data.steps]
    list[i] = val
    update('steps', list)
  }
  function removeStep(i) {
    update('steps', data.steps.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-6">
      {/* Ingredients */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-[#888880]">Ingredients *</label>
          <button type="button" onClick={addIngredient}
            className="flex items-center gap-1 text-xs text-[#FF6B35] hover:text-[#e55a25]">
            <Plus size={13} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {data.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={ing.amount}
                onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                placeholder="1"
                className="w-14 bg-[#1A1A1A] border border-white/10 rounded-lg px-2 py-2 text-[#F5F5F0] text-sm focus:outline-none focus:border-[#FF6B35]/50"
              />
              <input
                value={ing.unit}
                onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                placeholder="cup"
                className="w-16 bg-[#1A1A1A] border border-white/10 rounded-lg px-2 py-2 text-[#F5F5F0] text-sm focus:outline-none focus:border-[#FF6B35]/50"
              />
              <input
                value={ing.item}
                onChange={(e) => updateIngredient(i, 'item', e.target.value)}
                placeholder="flour"
                className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-lg px-2 py-2 text-[#F5F5F0] text-sm focus:outline-none focus:border-[#FF6B35]/50"
              />
              <button type="button" onClick={() => removeIngredient(i)}
                className="text-[#888880] hover:text-red-400 p-2">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {data.ingredients.length === 0 && (
            <button type="button" onClick={addIngredient}
              className="w-full py-6 border border-dashed border-white/10 rounded-lg text-[#888880] text-sm hover:border-white/20 transition-colors">
              + Add first ingredient
            </button>
          )}
        </div>
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-[#888880]">Steps *</label>
          <button type="button" onClick={addStep}
            className="flex items-center gap-1 text-xs text-[#FF6B35] hover:text-[#e55a25]">
            <Plus size={13} /> Add
          </button>
        </div>
        <div className="space-y-2">
          {data.steps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-shrink-0 w-6 h-6 mt-2 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] text-xs flex items-center justify-center font-medium">
                {i + 1}
              </div>
              <textarea
                value={step}
                onChange={(e) => updateStep(i, e.target.value)}
                placeholder={`Step ${i + 1}...`}
                rows={2}
                className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-2 text-[#F5F5F0] text-sm focus:outline-none focus:border-[#FF6B35]/50 resize-none"
              />
              <button type="button" onClick={() => removeStep(i)}
                className="text-[#888880] hover:text-red-400 p-2 mt-0.5">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {data.steps.length === 0 && (
            <button type="button" onClick={addStep}
              className="w-full py-6 border border-dashed border-white/10 rounded-lg text-[#888880] text-sm hover:border-white/20 transition-colors">
              + Add first step
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
