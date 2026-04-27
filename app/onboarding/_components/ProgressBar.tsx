interface Props {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: Props) {
  const percent = (current / total) * 100

  return (
    <div className="px-6 pt-12 pb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#888888] text-xs font-medium tracking-widest uppercase">
          Paso {current} de {total}
        </span>
        <span className="text-[#555555] text-xs tabular-nums">
          {Math.round(percent)}%
        </span>
      </div>
      <div className="h-[2px] bg-[#222222] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#C8FF00] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
