import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { scoreRecipe, generateImage } from '../../../lib/api'
import { useAuthStore } from '../../../store/authStore'
import { useUIStore } from '../../../store/uiStore'
import { uploadRecipeImage, getPublicUrl } from '../../../utils/helpers'
import Step1Details from './Step1Details'
import Step2Recipe from './Step2Recipe'
import Step3Media from './Step3Media'

const STEPS = ['Details', 'Recipe', 'Media']

const DEFAULTS = {
  title: '',
  description: '',
  cuisine_type: '',
  prep_time: 15,
  cook_time: 30,
  serving_size: 2,
  ingredients: [],
  steps: [],
  allergens: [],
  photo_file: null,
  photo_url: null,
}

function isSpam(text) {
  if (!text) return false
  const t = text.trim()
  if (t.length < 3) return true
  if (/(.)\1{4,}/.test(t)) return true          // aaaaa, xxxxx
  if (/^[^a-zA-Z]+$/.test(t)) return true       // only numbers/symbols
  if (/\s{3,}/.test(t)) return true              // too many spaces
  if (/^(.{1,3})\1+$/.test(t)) return true       // repeating patterns: abcabcabc
  return false
}

function looksLikeDishName(title) {
  const t = title.trim()
  // Must have at least 2 words OR one word of 4+ chars
  const words = t.split(/\s+/)
  if (words.length < 1) return false
  if (words.length === 1 && words[0].length < 4) return false
  // Must contain at least one letter-only word of 3+ chars
  if (!words.some(w => /^[a-zA-Z]{3,}$/.test(w))) return false
  return true
}

function looksLikeDescription(desc) {
  const t = desc.trim()
  if (t.length < 20) return false
  const words = t.split(/\s+/)
  if (words.length < 5) return false  // at least 5 words
  if (!t.includes(' ')) return false  // must have spaces
  return true
}

function validateStep(step, data) {
  if (step === 0) {
    // Title validation
    if (!data.title || data.title.trim().length < 3)
      return 'Please enter a recipe title (at least 3 characters)'
    if (isSpam(data.title))
      return 'Recipe title looks invalid — please enter a real dish name like "Chicken Tikka Masala"'
    if (!looksLikeDishName(data.title))
      return 'Title doesn\'t look like a dish name — e.g. "Creamy Mushroom Risotto"'

    // Description is now mandatory
    if (!data.description || data.description.trim().length === 0)
      return 'Please add a description — tell people what makes your recipe special'
    if (isSpam(data.description))
      return 'Description looks like gibberish — please describe your dish in plain English'
    if (!looksLikeDescription(data.description))
      return 'Description is too short — write at least 2 sentences (20+ words) about the dish'

    return null
  }
  if (step === 1) {
    if (data.ingredients.length === 0)
      return 'Please add at least one ingredient'
    if (data.steps.length === 0)
      return 'Please add at least one cooking step'
    const badIngredient = data.ingredients.find((i) => !i.item?.trim() || isSpam(i.item))
    if (badIngredient) return 'One or more ingredients look invalid — please check them'
    const badStep = data.steps.find((s) => !s?.trim() || s.trim().length < 8 || isSpam(s))
    if (badStep) return 'One or more steps are too short — describe each step clearly'
    return null
  }
  return null
}

export default function PostForm() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(DEFAULTS)
  const [stepError, setStepError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [aiStatus, setAiStatus] = useState(null)
  const { user } = useAuthStore()
  const addToast = useUIStore((s) => s.addToast)
  const navigate = useNavigate()

  const progress = ((step + 1) / STEPS.length) * 100

  async function handleSubmit() {
    if (!data.title || data.ingredients.length === 0 || data.steps.length === 0) {
      addToast('Please fill in title, ingredients and steps', 'error')
      return
    }
    setSubmitting(true)
    try {
      // 1. Upload photo (file upload) or use AI-generated URL directly
      let photoUrl = data.photo_url || null
      if (data.photo_file) {
        const { data: uploadData, error } = await uploadRecipeImage(supabase, data.photo_file, user.id)
        if (!error && uploadData?.path) {
          photoUrl = getPublicUrl(supabase, 'recipe-images', uploadData.path)
        }
      }

      // 2. Insert recipe
      const { data: recipe, error: insertError } = await supabase.from('recipes').insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        ingredients: data.ingredients,
        steps: data.steps,
        cuisine_type: data.cuisine_type,
        prep_time: data.prep_time,
        cook_time: data.cook_time,
        serving_size: data.serving_size,
        allergens: data.allergens,
        photo_url: photoUrl,
      }).select().single()

      if (insertError) throw insertError

      // 3. Score with AI
      setAiStatus('analyzing')
      try {
        const scores = await scoreRecipe({
          title: recipe.title,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          cuisine: recipe.cuisine_type,
        })

        // 4. Update with scores
        await supabase.from('recipes').update({
          ai_nutrition_score: scores.nutrition_score,
          ai_difficulty_score: scores.difficulty_score,
          ai_authenticity_score: scores.authenticity_score,
          ai_calories_per_serving: scores.calories_per_serving,
          ai_diet_tags: scores.diet_tags ?? [],
          allergens: [...new Set([...data.allergens, ...(scores.allergen_warnings ?? [])])],
        }).eq('id', recipe.id)

        setAiStatus('done')
        addToast('✨ AI Analysis Complete!', 'success')
      } catch {
        setAiStatus('failed')
      }

      setTimeout(() => navigate(`/recipe/${recipe.id}`), 1200)
    } catch (e) {
      addToast(e.message || 'Failed to post recipe', 'error')
      setSubmitting(false)
      setAiStatus(null)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((label, i) => (
            <div key={i} className={`flex items-center gap-1 text-sm ${i === step ? 'text-[#FF6B35] font-medium' : i < step ? 'text-[#4CAF7D]' : 'text-[#888880]'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? 'bg-[#FF6B35] text-white' : i < step ? 'bg-[#4CAF7D] text-white' : 'bg-[#242424] text-[#888880]'}`}>
                {i < step ? <Check size={11} /> : i + 1}
              </div>
              {label}
            </div>
          ))}
        </div>
        <div className="h-1 bg-[#242424] rounded-full overflow-hidden">
          <div className="h-full bg-[#FF6B35] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Step content */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6">
        {step === 0 && <Step1Details data={data} onChange={setData} />}
        {step === 1 && <Step2Recipe data={data} onChange={setData} />}
        {step === 2 && <Step3Media data={data} onChange={setData} />}

        {/* AI status */}
        {aiStatus && (
          <div className={`mt-4 flex items-center gap-2 text-sm ${aiStatus === 'done' ? 'text-[#4CAF7D]' : 'text-[#FFB800]'}`}>
            {aiStatus === 'analyzing' ? <Loader2 size={14} className="animate-spin" /> : <span>✨</span>}
            {aiStatus === 'analyzing' ? 'AI analyzing your recipe...' : '✨ AI Analysis Complete!'}
          </div>
        )}
      </div>

      {/* Step validation error */}
      {stepError && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-900/20 border border-red-700/30 rounded-xl text-red-400 text-sm">
          <span className="text-base leading-none">⚠️</span>
          <span>{stepError}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-4">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} disabled={submitting}
            className="flex items-center gap-2 px-4 py-2.5 border border-white/10 text-[#888880] rounded-xl hover:text-[#F5F5F0] hover:border-white/20 transition-colors">
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <div className="flex-1" />
        {step < STEPS.length - 1 ? (
          <button onClick={() => {
            const err = validateStep(step, data)
            if (err) { setStepError(err); return }
            setStepError(null)
            setStep(step + 1)
          }}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B35] text-white rounded-xl font-medium hover:bg-[#e55a25] transition-colors">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B35] text-white rounded-xl font-medium disabled:opacity-50 hover:bg-[#e55a25] transition-colors">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? 'Posting...' : 'Post Recipe'}
          </button>
        )}
      </div>
    </div>
  )
}
