import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProfile, useProfileRecipes, useFollowCounts } from '../hooks/useProfile'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { useUIStore } from '../store/uiStore'
import RecipeGrid from '../components/recipe/RecipeGrid'
import EmptyState from '../components/ui/EmptyState'
import { Camera, Loader2 } from 'lucide-react'
import { getPublicUrl } from '../utils/helpers'

const PROFILE_TABS = ['Recipes', 'Collections']

export default function Profile() {
  const { username } = useParams()
  const { user, profile: myProfile, fetchProfile } = useAuthStore()
  const addToast = useUIStore((s) => s.addToast)
  const [tab, setTab] = useState('Recipes')
  const [uploading, setUploading] = useState(false)

  const { data: profile, isLoading } = useProfile(username)
  const { data: recipes = [], isLoading: recipesLoading } = useProfileRecipes(profile?.id)
  const { data: counts } = useFollowCounts(profile?.id)

  const isMe = user?.id === profile?.id

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
      addToast('Avatar updated!', 'success')
    } catch {
      addToast('Failed to update avatar', 'error')
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="h-24 bg-[#1A1A1A] rounded-2xl animate-pulse mb-4" />
    </div>
  )
  if (!profile) return <div className="px-4 py-20 text-center text-[#888880]">User not found.</div>

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
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

        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-[#F5F5F0]">{profile.full_name}</h1>
          <p className="text-[#888880] text-sm">@{profile.username || 'user'}</p>
          {profile.bio && <p className="text-[#F5F5F0]/80 text-sm mt-1">{profile.bio}</p>}

          <div className="flex gap-4 mt-2 text-sm">
            <span><strong className="text-[#F5F5F0]">{recipes.length}</strong> <span className="text-[#888880]">recipes</span></span>
            <span><strong className="text-[#F5F5F0]">{counts?.followers ?? 0}</strong> <span className="text-[#888880]">followers</span></span>
            <span><strong className="text-[#F5F5F0]">{counts?.following ?? 0}</strong> <span className="text-[#888880]">following</span></span>
          </div>
        </div>
      </div>

      {/* Allergens & taste profile */}
      {isMe && profile.allergens?.length > 0 && (
        <div className="mb-4 p-3 bg-[#1A1A1A] border border-white/5 rounded-xl">
          <p className="text-xs text-[#888880] mb-1.5">Your allergens</p>
          <div className="flex flex-wrap gap-1">
            {profile.allergens.map((a) => (
              <span key={a} className="text-xs bg-red-900/20 border border-red-700/30 text-red-400 px-2 py-0.5 rounded-full capitalize">{a}</span>
            ))}
          </div>
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
    </div>
  )
}
