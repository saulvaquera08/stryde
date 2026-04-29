'use client'

import { useState, useTransition } from 'react'
import { X, Check, TrendingUp, Dumbbell, Zap, Activity } from 'lucide-react'
import { logManualActivity } from '../settings/actions'

const ACTIVITY_TYPES = [
  { key: 'run',      label: 'Correr',    icon: TrendingUp, color: '#C8FF00' },
  { key: 'strength', label: 'Gym',       icon: Dumbbell,   color: '#A78BFA' },
  { key: 'hyrox',   label: 'HYROX',     icon: Zap,        color: '#FF6B35' },
  { key: 'other',   label: 'Otro',      icon: Activity,   color: '#888888' },
]

interface Props {
  onClose: () => void
}

export default function LogActivityModal({ onClose }: Props) {
  const today = new Date().toISOString().split('T')[0]

  const [activityType, setActivityType] = useState('run')
  const [durationH, setDurationH]       = useState('0')
  const [durationM, setDurationM]       = useState('30')
  const [loggedDate, setLoggedDate]     = useState(today)
  const [notes, setNotes]               = useState('')
  const [isPending, startTransition]    = useTransition()
  const [done, setDone]                 = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const totalSeconds = (parseInt(durationH || '0') * 3600) + (parseInt(durationM || '0') * 60)

  const submit = () => {
    if (totalSeconds < 60) { setError('Duración mínima: 1 minuto'); return }
    startTransition(async () => {
      try {
        await logManualActivity({ activity_type: activityType, duration_seconds: totalSeconds, logged_date: loggedDate, notes: notes.trim() || undefined })
        setDone(true)
        setTimeout(onClose, 1000)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full rounded-t-[28px] border border-[#1F1F1F] px-5 pt-5 pb-10"
        style={{ background: '#111' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle + header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-bold text-white">Registrar actividad</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#888]">
            <X size={14} />
          </button>
        </div>

        {/* Activity type */}
        <p className="font-mono text-[10px] tracking-[0.18em] text-[#444] font-bold mb-2">TIPO</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {ACTIVITY_TYPES.map(({ key, label, icon: Icon, color }) => {
            const active = activityType === key
            return (
              <button
                key={key}
                onClick={() => setActivityType(key)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                  active ? 'border-opacity-40 bg-opacity-10' : 'border-[#222] bg-[#141414]'
                }`}
                style={active ? { borderColor: color + '66', background: color + '15' } : {}}
              >
                <Icon size={18} style={{ color: active ? color : '#555' }} strokeWidth={1.8} />
                <span className={`font-mono text-[9px] font-bold tracking-[0.1em] ${active ? '' : 'text-[#555]'}`} style={active ? { color } : {}}>
                  {label.toUpperCase()}
                </span>
              </button>
            )
          })}
        </div>

        {/* Duration */}
        <p className="font-mono text-[10px] tracking-[0.18em] text-[#444] font-bold mb-2">DURACIÓN</p>
        <div className="flex gap-2 mb-5">
          <div className="flex-1 flex items-center gap-2 bg-[#141414] border border-[#222] rounded-xl px-4 py-3">
            <input
              type="number"
              min="0" max="23"
              value={durationH}
              onChange={e => setDurationH(e.target.value)}
              className="w-12 bg-transparent text-white text-[18px] font-bold font-mono outline-none text-right"
            />
            <span className="text-[#555] text-[13px] font-mono">h</span>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-[#141414] border border-[#222] rounded-xl px-4 py-3">
            <input
              type="number"
              min="0" max="59"
              value={durationM}
              onChange={e => setDurationM(e.target.value)}
              className="w-12 bg-transparent text-white text-[18px] font-bold font-mono outline-none text-right"
            />
            <span className="text-[#555] text-[13px] font-mono">min</span>
          </div>
        </div>

        {/* Date */}
        <p className="font-mono text-[10px] tracking-[0.18em] text-[#444] font-bold mb-2">FECHA</p>
        <div className="bg-[#141414] border border-[#222] rounded-xl px-4 py-3 mb-5">
          <input
            type="date"
            value={loggedDate}
            max={today}
            onChange={e => setLoggedDate(e.target.value)}
            className="w-full bg-transparent text-white text-[15px] font-medium outline-none"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Notes */}
        <p className="font-mono text-[10px] tracking-[0.18em] text-[#444] font-bold mb-2">NOTAS <span className="text-[#333]">(opcional)</span></p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="¿Cómo fue?"
          rows={2}
          className="w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3 text-white text-[14px] outline-none resize-none placeholder-[#333] mb-5"
        />

        {error && (
          <p className="text-[#FF6B35] text-[12px] mb-3 font-mono">{error}</p>
        )}

        <button
          onClick={submit}
          disabled={isPending || done}
          className={`w-full h-[52px] rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] transition-all ${
            done
              ? 'bg-[#C8FF00]/20 text-[#C8FF00]'
              : 'bg-[#C8FF00] text-black'
          }`}
        >
          {done ? <><Check size={18} strokeWidth={3} /> Registrado</> : isPending ? 'Guardando…' : 'Guardar actividad'}
        </button>
      </div>
    </div>
  )
}
