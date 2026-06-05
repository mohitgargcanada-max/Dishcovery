import { useState } from 'react'
import { ImagePlus } from 'lucide-react'
import AllergenPicker from '../AllergenPicker'

export default function Step3Media({ data, onChange }) {
  const [preview, setPreview] = useState(null)
  const update = (k, v) => onChange({ ...data, [k]: v })

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    update('photo_file', file)
    setPreview(URL.createObjectURL(file))
  }

  return (
    <div className="space-y-5">
      {/* Photo */}
      <div>
        <label className="block text-sm text-[#888880] mb-2">Recipe Photo</label>
        <label className="relative block cursor-pointer group">
          <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
          <div className={`border-2 border-dashed rounded-xl overflow-hidden transition-colors ${
            preview ? 'border-[#FF6B35]/40' : 'border-white/10 hover:border-white/20'
          }`}>
            {preview ? (
              <img src={preview} className="w-full h-48 object-cover" alt="Preview" />
            ) : (
              <div className="h-48 flex flex-col items-center justify-center gap-2 text-[#888880]">
                <ImagePlus size={32} />
                <span className="text-sm">Click to upload photo</span>
                <span className="text-xs">JPG, PNG up to 10MB</span>
              </div>
            )}
          </div>
          {/* TODO: OpenAI DALL-E integration */}
          <div className="mt-2 flex items-center gap-2">
            <button type="button"
              title="Coming Soon"
              className="text-xs text-[#888880] bg-[#1A1A1A] border border-white/10 px-3 py-1.5 rounded-lg cursor-not-allowed opacity-50">
              ✨ Generate AI Image — Coming Soon
            </button>
          </div>
        </label>
      </div>

      {/* Allergens */}
      <div>
        <label className="block text-sm text-[#888880] mb-2">Allergen Warnings</label>
        <AllergenPicker value={data.allergens} onChange={(v) => update('allergens', v)} />
      </div>

      {/* Premium */}
      <div className="flex items-center gap-3 p-3 bg-[#1A1A1A] border border-white/5 rounded-xl">
        <div className="flex-1">
          <p className="text-sm text-[#F5F5F0] font-medium">Sell This Recipe</p>
          <p className="text-xs text-[#888880]">Monetise your recipe — Phase 2</p>
        </div>
        <div className="relative group">
          <button type="button" disabled
            className="text-xs bg-[#FFB800]/10 border border-[#FFB800]/20 text-[#FFB800] px-3 py-1.5 rounded-lg cursor-not-allowed opacity-60">
            💰 Coming Soon
          </button>
        </div>
      </div>
    </div>
  )
}
