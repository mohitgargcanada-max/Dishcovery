import { useState } from 'react'
import { ImagePlus, Sparkles, Loader2, RefreshCw } from 'lucide-react'
import AllergenPicker from '../AllergenPicker'
import { generateImage } from '../../../lib/api'

export default function Step3Media({ data, onChange }) {
  const [preview, setPreview] = useState(data.photo_url || null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)
  const update = (k, v) => onChange({ ...data, [k]: v })

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    update('photo_file', file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  async function handleGenerateImage() {
    if (!data.title) {
      setGenError('Please enter a recipe title in Step 1 first')
      return
    }
    setGenerating(true)
    setGenError(null)
    try {
      const result = await generateImage({
        title: data.title,
        cuisine: data.cuisine_type,
        ingredients: data.ingredients?.slice(0, 5).map(i => i.item).join(', ')
      })
      setPreview(result.url)
      update('photo_url', result.url)
      update('photo_file', null)
    } catch (e) {
      setGenError(e.message || 'Image generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Photo */}
      <div>
        <label className="block text-sm text-[#888880] mb-2">Recipe Photo</label>

        {/* Preview */}
        <div className={`relative rounded-xl overflow-hidden border-2 transition-colors mb-3 ${preview ? 'border-[#FF6B35]/40' : 'border-dashed border-white/10'}`}>
          {preview ? (
            <>
              <img src={preview} className="w-full h-52 object-cover" alt="Recipe preview" />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">Change photo</span>
              </div>
            </>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-white/5 transition-colors">
              <ImagePlus size={32} className="text-[#888880] mb-2" />
              <span className="text-sm text-[#888880]">Click to upload photo</span>
              <span className="text-xs text-[#888880]/60 mt-1">JPG, PNG up to 10MB</span>
              <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
            </label>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <label className="flex items-center gap-1.5 px-3 py-2 bg-[#242424] border border-white/10 text-[#888880] hover:text-[#F5F5F0] hover:border-white/20 rounded-xl text-xs cursor-pointer transition-colors">
            <ImagePlus size={13} />
            {preview ? 'Change' : 'Upload'}
            <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
          </label>

          <button
            type="button"
            onClick={handleGenerateImage}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FFB800]/15 border border-[#FFB800]/30 text-[#FFB800] hover:bg-[#FFB800]/25 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
          >
            {generating ? (
              <><Loader2 size={13} className="animate-spin" /> Generating...</>
            ) : preview ? (
              <><RefreshCw size={13} /> Regenerate with AI</>
            ) : (
              <><Sparkles size={13} /> ✨ Generate AI Photo</>
            )}
          </button>
        </div>

        {genError && (
          <p className="text-red-400 text-xs mt-2">{genError}</p>
        )}

        {generating && (
          <div className="mt-3 p-3 bg-[#FFB800]/5 border border-[#FFB800]/20 rounded-xl">
            <div className="flex items-center gap-2 text-[#FFB800] text-xs">
              <Loader2 size={13} className="animate-spin" />
              AI is creating a professional food photo for <strong>{data.title}</strong>...
            </div>
            <div className="mt-2 h-1 bg-[#242424] rounded-full overflow-hidden">
              <div className="h-full bg-[#FFB800] rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}
      </div>

      {/* Allergens */}
      <div>
        <label className="block text-sm text-[#888880] mb-2">Allergen Warnings</label>
        <AllergenPicker value={data.allergens} onChange={(v) => update('allergens', v)} />
      </div>

      {/* Premium placeholder */}
      <div className="flex items-center gap-3 p-3 bg-[#1A1A1A] border border-white/5 rounded-xl">
        <div className="flex-1">
          <p className="text-sm text-[#F5F5F0] font-medium">Sell This Recipe</p>
          <p className="text-xs text-[#888880]">Monetise your recipe — Phase 2</p>
        </div>
        <button type="button" disabled
          className="text-xs bg-[#FFB800]/10 border border-[#FFB800]/20 text-[#FFB800] px-3 py-1.5 rounded-lg cursor-not-allowed opacity-60">
          💰 Coming Soon
        </button>
      </div>
    </div>
  )
}
