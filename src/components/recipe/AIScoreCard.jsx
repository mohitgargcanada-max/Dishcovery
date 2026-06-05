import ArcGauge from '../ui/ArcGauge'
import DietTag from '../ui/DietTag'
import AllergenBadge from '../ui/AllergenBadge'

export default function AIScoreCard({ recipe }) {
  const {
    ai_nutrition_score,
    ai_difficulty_score,
    ai_authenticity_score,
    ai_calories_per_serving,
    ai_diet_tags = [],
    allergens = [],
  } = recipe

  if (!ai_nutrition_score) return null

  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[#FFB800] ai-badge-glow">✨</span>
        <h3 className="text-sm font-semibold text-[#F5F5F0]">AI Analysis</h3>
        {ai_calories_per_serving && (
          <span className="ml-auto text-xs text-[#888880]">{ai_calories_per_serving} cal/serving</span>
        )}
      </div>

      <div className="flex justify-around">
        <ArcGauge score={ai_nutrition_score} label="Nutrition" size={90} />
        <ArcGauge score={ai_difficulty_score} label="Difficulty" size={90} />
        <ArcGauge score={ai_authenticity_score} label="Authenticity" size={90} />
      </div>

      {ai_diet_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ai_diet_tags.map((t) => <DietTag key={t} tag={t} />)}
        </div>
      )}

      {allergens.length > 0 && (
        <div>
          <p className="text-xs text-[#888880] mb-1.5">Contains:</p>
          <div className="flex flex-wrap gap-1.5">
            {allergens.map((a) => <AllergenBadge key={a} allergen={a} />)}
          </div>
        </div>
      )}
    </div>
  )
}
