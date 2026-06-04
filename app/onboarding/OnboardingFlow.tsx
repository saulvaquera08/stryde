'use client'

import { useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { saveOnboarding } from './actions'
import ProgressBar from './_components/ProgressBar'
import StepName     from './_components/StepName'
import StepProgram  from './_components/StepProgram'
import StepGym      from './_components/StepGym'
import StepRun      from './_components/StepRun'
import StepBody     from './_components/StepBody'
import StepSchedule from './_components/StepSchedule'
import StepSummary  from './_components/StepSummary'
import type { OnboardingData } from './types'

const INITIAL_DATA: OnboardingData = {
  first_name: '', last_name: '',

  program_type: '',

  gym_goal: '', gym_split: '',

  run_goal: '', run_race_date: '',
  current_5k_time: '', current_10k_time: '',
  current_hm_time: '', current_marathon_time: '',

  age: '', weight: '', height: '',

  level: '', training_days: [], equipment: '',

  injuries: [],

  goals: [],
}

const slideVariants = {
  enter:  (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (d: number) => ({ x: d < 0 ? 40 : -40, opacity: 0 }),
}

// Steps lógicos:
// 1 → StepName
// 2 → StepProgram (elige GYM o RUN)
// 3 → StepGym (si gym) | StepRun (si run)
// 4 → StepBody
// 5 → StepSchedule
// 6 → StepSummary
const TOTAL_STEPS = 6

export default function OnboardingFlow() {
  const [step, setStep]           = useState(1)
  const [direction, setDirection] = useState(1)
  const [data, setData]           = useState<OnboardingData>(INITIAL_DATA)
  const [isPending, startTransition] = useTransition()

  const goNext = () => { setDirection(1);  setStep(s => Math.min(s + 1, TOTAL_STEPS)) }
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)) }

  const handleSubmit = () => {
    startTransition(async () => { await saveOnboarding(data) })
  }

  // Step 3 bifurca según programa
  const step3Component = data.program_type === 'run'
    ? <StepRun  key="run"  data={data} onChange={setData} onNext={goNext} onBack={goBack} />
    : <StepGym  key="gym"  data={data} onChange={setData} onNext={goNext} onBack={goBack} />

  const stepComponents = [
    <StepName     key="name"     data={data} onChange={setData} onNext={goNext} />,
    <StepProgram  key="program"  data={data} onChange={setData} onNext={goNext} onBack={goBack} />,
    step3Component,
    <StepBody     key="body"     data={data} onChange={setData} onNext={goNext} onBack={goBack} />,
    <StepSchedule key="schedule" data={data} onChange={setData} onNext={goNext} onBack={goBack} />,
    <StepSummary  key="summary"  data={data} onBack={goBack} onSubmit={handleSubmit} isPending={isPending} />,
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col overflow-hidden">
      <ProgressBar current={step} total={TOTAL_STEPS} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${step}-${data.program_type}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.26, ease: 'easeInOut' }}
          className="flex-1 flex flex-col"
        >
          {stepComponents[step - 1]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
