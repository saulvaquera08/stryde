export default function ProgressLoading() {
  return (
    <div className="px-5 pt-5 pb-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-24 bg-[#1A1A1A] rounded-lg" />
        <div className="h-3 w-16 bg-[#1A1A1A] rounded" />
      </div>
      <div className="mb-4">
        <div className="h-3 w-28 bg-[#1A1A1A] rounded mb-2" />
        <div className="h-9 w-24 bg-[#1A1A1A] rounded-lg" />
      </div>

      {/* Tabs */}
      <div className="h-12 bg-[#141414] border border-[#222] rounded-2xl mb-[18px]" />

      {/* Bar chart card */}
      <div className="h-[160px] bg-[#141414] border border-[#1F1F1F] rounded-[22px] mb-3" />

      {/* 3 stat tiles */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-[80px] bg-[#141414] border border-[#1F1F1F] rounded-2xl" />
        ))}
      </div>

      {/* History items */}
      <div className="h-3 w-44 bg-[#1A1A1A] rounded mb-3" />
      <div className="flex flex-col gap-1.5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-[72px] bg-[#141414] border border-[#1F1F1F] rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
