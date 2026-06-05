export default function EmptyState({ icon = '🍽️', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-[#F5F5F0] mb-2">{title}</h3>
      {description && <p className="text-[#888880] text-sm max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  )
}
