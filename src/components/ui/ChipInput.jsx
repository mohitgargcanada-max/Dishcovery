import { useState } from 'react'
import { X } from 'lucide-react'

export default function ChipInput({ value = [], onChange, placeholder = 'Type and press Enter...' }) {
  const [input, setInput] = useState('')

  function handleKey(e) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const v = input.trim().toLowerCase()
      if (!value.includes(v)) onChange([...value, v])
      setInput('')
    }
    if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  function remove(item) {
    onChange(value.filter((v) => v !== item))
  }

  return (
    <div className="min-h-[44px] flex flex-wrap gap-1.5 p-2 bg-[#1A1A1A] border border-white/10 rounded-lg focus-within:border-[#FF6B35]/50 cursor-text"
      onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
      {value.map((v) => (
        <span key={v} className="chip">
          {v}
          <button type="button" onClick={() => remove(v)} className="ml-0.5 hover:text-white">
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-[#F5F5F0] placeholder:text-[#888880]"
      />
    </div>
  )
}
