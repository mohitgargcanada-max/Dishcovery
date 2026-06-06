import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProfile, useProfileRecipes, useFollowCounts } from '../hooks/useProfile'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { useUIStore } from '../store/uiStore'
import RecipeGrid from '../components/recipe/RecipeGrid'
import EmptyState from '../components/ui/EmptyState'
import { Camera, Loader2, Settings, X, Check } from 'lucide-react'
import { getPublicUrl } from '../utils/helpers'
import { CUISINES, DIET_TAGS, ALLERGENS } from '../utils/constants'

const PROFILE_TABS = ['Recipes', 'Collections']

export default function Profile() {
  const { username } = useParams()
  const { user, profile: myProfile, fetchProfile } = useAuthStore()
  const addToast = useUIStore((s) => s.addToast)
  const [tab, setTab] = useState('Recipes')
  const [uploading, setUploading] = useState(false)
  const [editingPrefs, setEditingPrefs] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)

  const { data: profile, isLoading, refetch } = useProfile(username)
  const { data: recipes = [], isLoading: recipesLoading } = useProfileRecipes(profile?.id)
  const { data: counts } = useFollowCounts(profile?.id)

  const isMe = user?.id === profile?.id

  // Editable prefs state
  const [editCuisines, setEditCuisines] = useState([])
  const [editDiets, setEditDiets] = useState([])
  const [editAllergens, setEditAllergens] = useState([])

  function openEdit() {
    setEditCuisines(profile?.taste_profile?.cuisines ?? [])
    setEditDiets(profile?.taste_profile?.diets ?? [])
    setEditAllergens(profile?.allergens ?? [])
    setEditingPrefs(true)
  }

  function toggle(arr, setArr, val) {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  async function savePrefs() {
    setSavingPrefs(true)
    await supabase.from('profiles').update({
      taste_profile: { cuisines: editCuisines, diets: editDiets },
      allergens: editAllergens,
    }).eq('id', user.id)
    await fetchProfile(user.id)
    await refetch()
    setSavingPrefs(false)
    setEditingPrefs(false)
    addToast('Preferences updated!', 'success')
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      await supabase.storage.from('profile-avatars').upload(path, file, { upsert: true })
      const url = getPublicUrl(supabase, 'profile-avatars', path)
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      await fetchProfile(user.id)
      await refetch()
      addToast('Avatar updated!', 'success')
    } catch {
      addToast('Failed to update avatar', 'error')
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">
      <div className="h-24 bg-[#1A1A1A] rounded-2xl animate-pulse mb-4" />
    </div>
  )
  if (!profile) return <div className="px-4 py-20 text-center text-[#888880]">User not found.</div>

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative flex-shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="w-20 h-20 rounded-2xl object-cover" alt="" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#FF6B35]/20 flex items-center justify-center text-3xl text-[#FF6B35] font-bold">
              {(profile.full_name?.[0] || 'U').toUpperCase()}
            </div>
          )}
          {isMe && (
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#FF6B35] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#e55a25] transition-colors">
              {uploading ? <Loader2 size={12} className="animate-spin text-white" /> : <Camera size={12} className="text-white" />}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
            </label>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-[#F5F5F0]">{profile.full_name || 'User'}</h1>
            {isMe && (
              <button onClick={openEdit} className="text-[#888880] hover:text-[#FF6B35] transition-colors">
                <Settings size={15} />
              </button>
            )}
          </div>
          <p className="text-[#888880] text-sm">@{profile.username || profile.full_name?.split(' ')[0]?.toLowerCase() || 'user'}</p>
          {profile.bio && <p className="text-[#F5F5F0]/80 text-sm mt-1">{profile.bio}</p>}

          <div className="flex gap-4 mt-2 text-sm flex-wrap">
            <span><strong className="text-[#F5F5F0]">{recipes.length}</strong> <span className="text-[#888880]">recipes</span></span>
            <span><strong className="text-[#F5F5F0]">{counts?.followers ?? 0}</strong> <span className="text-[#888880]">followers</span></span>
            <span><strong className="text-[#F5F5F0]">{counts?.following ?? 0}</strong> <span className="text-[#888880]">following</span></span>
          </div>
        </div>
      </div>

      {/* Taste profile & allergens display */}
      {isMe && (
        <div className="mb-5 p-4 bg-[#1A1A1A] border border-white/5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#F5F5F0]">Your Preferences</p>
            <button onClick={openEdit} className="text-xs text-[#FF6B35] hover:underline">Edit</button>
          </div>

          {profile.taste_profile?.cuisines?.length > 0 && (
            <div>
              <p className="text-xs text-[#888880] mb-1.5">Cuisines</p>
              <div className="flex flex-wrap gap-1">
                {profile.taste_profile.cuisines.map((c) => (
                  <span key={c} className="text-xs bg-[#FF6B35]/15 border border-[#FF6B35]/30 text-[#FF6B35] px-2 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          )}

          {profile.taste_profile?.diets?.length > 0 && (
            <div>
              <p className="text-xs text-[#888880] mb-1.5">Dietary</p>
              <div className="flex flex-wrap gap-1">
                {profile.taste_profile.diets.map((d) => (
                  <span key={d} className="text-xs bg-green-900/30 border border-green-700/30 text-green-400 px-2 py-0.5 rounded-full capitalize">{d}</span>
                ))}
              </div>
            </div>
          )}

          {profile.allergens?.length > 0 && (
            <div>
              <p className="text-xs text-[#888880] mb-1.5">Allergens to avoid</p>
              <div className="flex flex-wrap gap-1">
                {profile.allergens.map((a) => (
                  <span key={a} className="text-xs bg-red-900/20 border border-red-700/30 text-red-400 px-2 py-0.5 rounded-full capitalize">{a}</span>
                ))}
              </div>
            </div>
          )}

          {!profile.taste_profile?.cuisines?.length && !profile.taste_profile?.diets?.length && !profile.allergens?.length && (
            <p className="text-xs text-[#888880]">No preferences set. <button onClick={openEdit} className="text-[#FF6B35] hover:underline">Set them now →</button></p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1A1A1A] p-1 rounded-xl w-fit mb-6">
        {PROFILE_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-[#FF6B35] text-white' : 'text-[#888880] hover:text-[#F5F5F0]'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Recipes' && (
        recipes.length === 0
          ? <EmptyState icon="🍽️" title="No recipes yet" description={isMe ? 'Post your first recipe!' : `${profile.full_name} hasn't posted yet.`} />
          : <RecipeGrid recipes={recipes} loading={recipesLoading} />
      )}

      {tab === 'Collections' && (
        <EmptyState
          icon="📚"
          title="Collections — Coming Soon"
          description="Phase 2 feature: curated recipe collections."
          action={<span className="text-xs bg-[#FFB800]/10 border border-[#FFB800]/20 text-[#FFB800] px-3 py-1 rounded-full">Phase 2</span>}
        />
      )}

      {/* Edit Preferences Modal */}
      {editingPrefs && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1A1A1A] flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h2 className="font-semibold text-[#F5F5F0]">Edit Preferences</h2>
              <button onClick={() => setEditingPrefs(false)} className="text-[#888880] hover:text-[#F5F5F0]"><X size={20} /></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Cuisines */}
              <div>
                <p className="text-sm text-[#888880] mb-2">Favourite Cuisines</p>
                <div className="grid grid-cols-2 gap-2">
                  {CUISINES.map(({ label, emoji }) => (
                    <button key={label} type="button" onClick={() => toggle(editCuisines, setEditCuisines, label)}
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors text-left ${editCuisines.includes(label) ? 'bg-[#FF6B35]/20 border-[#FF6B35]/50 text-[#FF6B35]' : 'bg-[#242424] border-white/10 text-[#888880] hover:border-white/20'}`}>
                      {emoji} {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diets */}
              <div>
                <p className="text-sm text-[#888880] mb-2">Dietary Preferences</p>
                <div className="flex flex-wrap gap-2">
                  {DIET_TAGS.map((tag) => (
                    <button key={tag} type="button" onClick={() => toggle(editDiets, setEditDiets, tag)}
                      className={`px-3 py-1.5 rounded-full text-xs border capitalize transition-colors ${editDiets.includes(tag) ? 'bg-[#FF6B35]/20 border-[#FF6B35]/50 text-[#FF6B35]' : 'bg-[#242424] border-white/10 text-[#888880] hover:border-white/20'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergens */}
              <div>
                <p className="text-sm text-[#888880] mb-2">Allergens to Avoid</p>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS.map((a) => (
                    <button key={a} type="button" onClick={() => toggle(editAllergens, setEditAllergens, a)}
                      className={`px-3 py-1.5 rounded-full text-xs border capitalize transition-colors ${editAllergens.includes(a) ? 'bg-red-900/30 border-red-700/50 text-red-400' : 'bg-[#242424] border-white/10 text-[#888880] hover:border-white/20'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={savePrefs} disabled={savingPrefs}
                className="w-full py-3 bg-[#FF6B35] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#e55a25] transition-colors">
                {savingPrefs ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {savingPrefs ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
