// Average person burns ~0.04 calories per step (70kg, moderate pace)
// So steps needed = calories / 0.04 = calories * 25
const STEPS_PER_CALORIE = 25

function formatSteps(steps) {
  if (steps >= 1000) return `${(steps / 1000).toFixed(1)}k`
  return steps.toString()
}

const LEVELS = [
  { max: 3000,  label: 'Easy walk',     color: '#4CAF7D', bg: 'bg-green-900/20 border-green-700/30',  emoji: '🚶' },
  { max: 7000,  label: 'Brisk walk',    color: '#FFB800', bg: 'bg-yellow-900/20 border-yellow-700/30', emoji: '🚶‍♂️' },
  { max: 12000, label: 'Long walk',     color: '#FF6B35', bg: 'bg-orange-900/20 border-orange-700/30', emoji: '🏃' },
  { max: Infinity, label: 'Run it off', color: '#FF4444', bg: 'bg-red-900/20 border-red-700/30',       emoji: '🏃‍♂️' },
]

export default function StepsBurner({ calories }) {
  if (!calories) return null

  const steps = Math.round(calories * STEPS_PER_CALORIE)
  const level = LEVELS.find((l) => steps <= l.max)
  const km = (steps * 0.0008).toFixed(1)
  const mins = Math.round(steps / 100) // ~100 steps/min walking

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${level.bg}`}>
      <span className="text-2xl">{level.emoji}</span>
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold" style={{ color: level.color }}>
            {formatSteps(steps)} steps
          </span>
          <span className="text-xs text-[#888880]">to burn this meal</span>
        </div>
        <div className="text-xs text-[#888880] mt-0.5">
          ≈ {km} km · {mins} min walk · {level.label}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-[#888880]">{calories}</div>
        <div className="text-xs text-[#888880]">kcal</div>
      </div>
    </div>
  )
}
