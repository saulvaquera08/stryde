export default function DashboardLoading() {
  return (
    <div className="px-5 pt-5 pb-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-[18px]">
        <div className="h-6 w-24 bg-[#1A1A1A] rounded-lg" />
        <div className="h-4 w-20 bg-[#1A1A1A] rounded-lg" />
      </div>

      {/* Greeting */}
      <div className="mb-2">
        <div className="h-3 w-28 bg-[#1A1A1A] rounded mb-2" />
        <div className="h-9 w-40 bg-[#1A1A1A] rounded-lg" />
      </div>

      {/* Coach message */}
      <div className="flex gap-2 mt-[14px] mb-[18px]">
        <div className="w-3 h-3 bg-[#1A1A1A] rounded-full mt-1 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-[#1A1A1A] rounded w-full" />
          <div className="h-3 bg-[#1A1A1A] rounded w-4/5" />
        </div>
      </div>

      {/* Phase card */}
      <div className="h-[100px] bg-[#141414] border border-[#1F1F1F] rounded-[22px] mb-[18px]" />

      {/* Section label */}
      <div className="h-3 w-36 bg-[#1A1A1A] rounded mb-[10px]" />

      {/* Hero workout card */}
      <div className="h-[220px] bg-[#141414] border border-[#1F1F1F] rounded-[22px] mb-[14px]" />

      {/* Hybrid load card */}
      <div className="h-[160px] bg-[#141414] border border-[#1F1F1F] rounded-[22px]" />
    </div>
  )
}
