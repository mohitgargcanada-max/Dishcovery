import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, ChevronRight, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { CUISINES, DIET_TAGS, ALLERGENS } from '../utils/constants'

const STEPS = ['Welcome', 'Cuisines', 'Diet', 'Allergens']

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [cuisines, setCuisines] = useState([])
  const [diets, setDiets] = useState([])
  const [allergens, setAllergens] = useState([])
  const [saving, setSaving] = useState(false)
  const { user, fetchProfile } = useAuthStore()
  const navigate = useNavigate()

  function toggle(arr, setArr, val) {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  async function finish() {
    setSaving(true)
    await supabase.from('profiles').update({
      taste_profile: { cuisines, diets },
      allergens,
    }).eq('id', user.id)
    await fetchProfile(user.id)
    navigate('/feed')
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <ChefHat className="text-[#FF6B35]" size={28} />
          <span className="font-display font-bold text-2xl text-[#F5F5F0]">Dishcovery</span>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`rounded-full transition-all ${i === step ? 'w-6 h-2 bg-[#FF6B35]' : i < step ? 'w-2 h-2 bg-[#4CAF7D]' : 'w-2 h-2 bg-[#242424]'}`} />
          ))}
        </div>

        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6">
          {step === 0 && (
            <div className="text-center space-y-4">
              <div className="text-5xl">👋</div>
              <h2 className="font-display text-2xl font-bold text-[#F5F5F0]">Welcome to Dishcovery!</h2>
              <p className="text-[#888880]">Let's personalise your experience. We'll ask about your food preferences to show you the best recipes.</p>
              <button onClick={() => setStep(1)}
                className="w-full py-3 bg-[#FF6B35] text-white rounded-xl font-medium hover:bg-[#e55a25] transition-colors flex items-center justify-center gap-2">
                Get Started <ChevronRight size={16} />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-[#F5F5F0]">Favourite Cuisines</h2>
              <p className="text-[#888880] text-sm">Pick all that apply</p>
              <div className="grid grid-cols-2 gap-2">
                {CUISINES.map(({ label, emoji, bg }) => (
                  <button key={label} type="button"
                    onClick={() => toggle(cuisines, setCuisines, label)}
                    className={`relative rounded-xl overflow-hidden h-20 border-2 transition-colors text-left ${cuisines.includes(label) ? 'border-[#FF6B35]' : 'border-transparent'}`}>
                    <img src={bg} alt={label} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative p-2 font-medium text-white text-sm">
                      {emoji} {label}
                      {cuisines.includes(label) && <span className="ml-1">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)}
                className="w-full py-3 bg-[#FF6B35] text-white rounded-xl font-medium hover:bg-[#e55a25] transition-colors flex items-center justify-center gap-2">
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-[#F5F5F0]">Dietary Preferences</h2>
              <p className="text-[#888880] text-sm">Pick all that apply</p>
              <div className="flex flex-wrap gap-2">
                {DIET_TAGS.map((tag) => (
                  <button key={tag} type="button"
                    onClick={() => toggle(diets, setDiets, tag)}
                    className={`px-4 py-2 rounded-full text-sm border capitalize transition-colors ${diets.includes(tag) ? 'bg-[#FF6B35]/20 border-[#FF6B35]/50 text-[#FF6B35]' : 'bg-[#242424] border-white/10 text-[#888880] hover:border-white/20'}`}>
                    {tag}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(3)}
                className="w-full py-3 bg-[#FF6B35] text-white rounded-xl font-medium hover:bg-[#e55a25] transition-colors flex items-center justify-center gap-2">
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-[#F5F5F0]">Allergen Warnings</h2>
              <p className="text-[#888880] text-sm">We'll warn you when recipes contain these</p>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((a) => (
                  <button key={a} type="button"
                    onClick={() => toggle(allergens, setAllergens, a)}
                    className={`px-4 py-2 rounded-full text-sm border capitalize transition-colors ${allergens.includes(a) ? 'bg-red-900/30 border-red-700/50 text-red-400' : 'bg-[#242424] border-white/10 text-[#888880] hover:border-white/20'}`}>
                    {a}
                  </button>
                ))}
              </div>
              <button onClick={finish} disabled={saving}
                className="w-full py-3 bg-[#FF6B35] text-white rounded-xl font-medium disabled:opacity-50 hover:bg-[#e55a25] transition-colors flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? 'Saving...' : "Let's Cook! 🍳"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
