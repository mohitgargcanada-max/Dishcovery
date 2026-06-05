export default function SkeletonCard({ tall = false }) {
  return (
    <div className={`bg-[#1A1A1A] rounded-xl border border-white/5 overflow-hidden animate-pulse ${tall ? 'h-80' : 'h-56'}`}>
      <div className={`bg-[#242424] ${tall ? 'h-48' : 'h-32'}`} />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-[#242424] rounded w-3/4" />
        <div className="h-3 bg-[#242424] rounded w-1/2" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-[#242424] rounded-full w-16" />
          <div className="h-5 bg-[#242424] rounded-full w-12" />
        </div>
      </div>
    </div>
  )
}
