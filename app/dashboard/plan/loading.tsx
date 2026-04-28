export default function PlanLoading() {
  return (
    <div className="px-5 pt-5 pb-4 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="h-3 w-28 bg-[#1A1A1A] rounded mb-2" />
          <div className="h-7 w-16 bg-[#1A1A1A] rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="w-9 h-9 bg-[#1A1A1A] rounded-full" />
          <div className="w-9 h-9 bg-[#1A1A1A] rounded-full" />
        </div>
      </div>

      {/* Phase pill */}
      <div className="h-7 w-48 bg-[#1A1A1A] rounded-full mb-4" />

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1.5 mb-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="h-2.5 w-4 bg-[#1A1A1A] rounded" />
            <div className="w-full aspect-square bg-[#1A1A1A] rounded-[10px]" />
          </div>
        ))}
      </div>

      {/* Section label */}
      <div className="flex justify-between mb-3">
        <div className="h-3 w-20 bg-[#1A1A1A] rounded" />
        <div className="h-3 w-24 bg-[#1A1A1A] rounded" />
      </div>

      {/* Workout rows */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[72px] bg-[#141414] border border-[#1A1A1A] rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
