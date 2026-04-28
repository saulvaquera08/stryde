export default function MoreLoading() {
  return (
    <div className="px-5 pt-5 pb-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="h-6 w-24 bg-[#1A1A1A] rounded-lg" />
        <div className="w-5 h-5 bg-[#1A1A1A] rounded" />
      </div>
      <div className="mb-6">
        <div className="h-3 w-16 bg-[#1A1A1A] rounded mb-2" />
        <div className="h-9 w-32 bg-[#1A1A1A] rounded-lg" />
      </div>

      {/* Profile card */}
      <div className="h-[100px] bg-[#141414] border border-[#1F1F1F] rounded-[22px] mb-3" />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-[72px] bg-[#141414] border border-[#1F1F1F] rounded-2xl" />
        ))}
      </div>

      {/* Plan section */}
      <div className="h-3 w-24 bg-[#1A1A1A] rounded mb-3" />
      <div className="h-[120px] bg-[#141414] border border-[#1F1F1F] rounded-[22px] mb-3" />

      {/* Actions */}
      <div className="h-3 w-20 bg-[#1A1A1A] rounded mb-3" />
      <div className="h-[100px] bg-[#141414] border border-[#1F1F1F] rounded-[22px] mb-3" />
    </div>
  )
}
