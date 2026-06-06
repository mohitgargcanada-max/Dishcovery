import { useState } from 'react'
import { Share2, Twitter, MessageCircle, Link, Check } from 'lucide-react'

export default function ShareButton({ recipe }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const url = window.location.href
  const text = `Check out this recipe: ${recipe.title} 🍽️`

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.title, text, url })
      } catch {}
    } else {
      setOpen(v => !v)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 2000)
  }

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
  const twitter  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] border border-white/10 text-[#888880] hover:text-[#F5F5F0] hover:border-white/20 rounded-xl text-sm transition-colors"
      >
        <Share2 size={15} /> Share
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <a href={whatsapp} target="_blank" rel="noreferrer"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F5F0] hover:bg-white/5 transition-colors">
            <MessageCircle size={15} className="text-green-400" /> WhatsApp
          </a>
          <a href={twitter} target="_blank" rel="noreferrer"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F5F0] hover:bg-white/5 transition-colors">
            <Twitter size={15} className="text-sky-400" /> Twitter / X
          </a>
          <a href={facebook} target="_blank" rel="noreferrer"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F5F0] hover:bg-white/5 transition-colors">
            <span className="text-blue-400 text-sm font-bold">f</span> Facebook
          </a>
          <div className="border-t border-white/5" />
          <button onClick={copyLink}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#F5F5F0] hover:bg-white/5 transition-colors">
            {copied ? <Check size={15} className="text-[#4CAF7D]" /> : <Link size={15} className="text-[#888880]" />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  )
}
