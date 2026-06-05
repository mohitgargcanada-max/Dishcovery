export function formatTime(minutes) {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function pluralize(n, word) {
  return `${n} ${n === 1 ? word : word + 's'}`
}

export function scoreColor(score) {
  if (score >= 8) return '#4CAF7D'
  if (score >= 5) return '#FFB800'
  return '#FF4444'
}

export function uploadRecipeImage(supabase, file, userId) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  return supabase.storage.from('recipe-images').upload(path, file, { upsert: true })
}

export function getPublicUrl(supabase, bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
