export default function WorkoutLoading() {
  return (
    <div className="px-5 pt-5 pb-6 animate-pulse">
      {/* Nav */}
      <div className="flex items-center justify-between mb-5">
        <div className="w-9 h-9 bg-[#141414] rounded-full border border-[#222]" />
        <div className="h-3 w-28 bg-[#1A1A1A] rounded" />
        <div className="w-9" />
      </div>

      {/* Pills */}
      <div className="flex gap-2 mb-4">
        <div className="h-7 w-20 bg-[#1A1A1A] rounded-full" />
        <div className="h-7 w-16 bg-[#1A1A1A] rounded-full" />
        <div className="h-7 w-16 bg-[#1A1A1A] rounded-full" />
      </div>

      {/* Title */}
      <div className="h-7 w-56 bg-[#1A1A1A] rounded-lg mb-2" />
      <div className="h-3 w-32 bg-[#1A1A1A] rounded mb-4" />

      {/* Blocks */}
      <div className="mt-4 space-y-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-[140px] bg-[#141414] border border-[#1A1A1A] rounded-xl" />
        ))}
      </div>

      {/* CTA */}
      <div className="sticky bottom-[80px] pt-3">
        <div className="h-[52px] bg-[#141414] border border-[#2A2A2A] rounded-xl" />
      </div>
    </div>
  )
}
