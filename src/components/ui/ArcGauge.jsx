import { useEffect, useRef, useState } from 'react'
import { scoreColor } from '../../utils/helpers'

export default function ArcGauge({ score = 0, label, size = 80 }) {
  const [animated, setAnimated] = useState(0)
  const radius = (size - 12) / 2
  const circumference = Math.PI * radius
  const filled = (animated / 10) * circumference

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100)
    return () => clearTimeout(t)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        {/* Track */}
        <path
          d={`M 6 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2}`}
          fill="none"
          stroke="#242424"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M 6 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2}`}
          fill="none"
          stroke={scoreColor(score)}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className="arc-gauge-fill"
        />
        <text
          x={size / 2}
          y={size / 2 - 2}
          textAnchor="middle"
          fill="#F5F5F0"
          fontSize={size / 4.5}
          fontFamily="Inter"
          fontWeight="600"
        >
          {score}
        </text>
      </svg>
      <span className="text-xs text-[#888880] text-center leading-tight">{label}</span>
    </div>
  )
}
