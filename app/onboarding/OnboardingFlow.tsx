'use client'

import { useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { saveOnboarding } from './actions'
import ProgressBar from './_components/ProgressBar'
import StepName from './_components/StepName'
import StepProgram from './_components/StepProgram'
import StepGymConfig from './_components/StepGymConfig'
import StepRunConfig from './_components/StepRunConfig'
import StepHyroxConfig from './_components/StepHyroxConfig'
import StepBody from './_components/StepBody'
import StepInjuries from './_components/StepInjuries'
import StepSchedule from './_components/StepSchedule'
import StepSummary from './_components/StepSummary'
import type { OnboardingData } from './types'

const INITIAL_DATA: OnboardingData = {
  first_name: '',
  last_name:  '',

  program_type: '',

  gym_goal:        '',
  gym_level:       '',
  equipment:       '',
  priority_muscles: [],

  run_distance:         '',
  run_race_date:        '',
  run_no_date:          false,
  run_current_5k_time:  '',
  run_current_10k_time: '',
  run_weekly_km:        '',
  run_level:            '',

  hyrox_experience:             '',
  hyrox_race_date:              '',
  hyrox_no_date:                false,
  hyrox_last_time:              '',
  hyrox_target_time:            '',
  hyrox_weak_stations:          [],
  hyrox_strength_cardio_balance: null,

  age:    '',
  weight: '',
  height: '',

  injuries:                 [],
  injury_notes:             '',
  low_intensity_preference: false,

  training_days:    [],
  preferred_time:   '',
  session_duration: '',
}

// Steps: 1=name 2=program 3=config(conditional) 4=body 5=injuries 6=schedule 7=summary
const TOTAL_STEPS = 7

const slideVariants = {
  enter:  (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (d: number) => ({ x: d < 0 ? 40 : -40, opacity: 0 }),
}

export default function OnboardingPage() {
  const [step, setStep]           = useState(1)
  const [direction, setDirection] = useState(1)
  const [data, setData]           = useState<OnboardingData>(INITIAL_DATA)
  const [isPending, startTransition] = useTransition()

  const goNext = () => { setDirection(1);  setStep(s => Math.min(s + 1, TOTAL_STEPS)) }
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)) }

  const handleSubmit = () => {
    startTransition(async () => { await saveOnboarding(data) })
  }

  // Step 3 renders the config component matching the selected program
  const ConfigStep = () => {
    if (data.program_type === 'gym')   return <StepGymConfig   data={data} onChange={setData} onNext={goNext} onBack={goBack} />
    if (data.program_type === 'run')   return <StepRunConfig   data={data} onChange={setData} onNext={goNext} onBack={goBack} />
    if (data.program_type === 'hyrox') return <StepHyroxConfig data={data} onChange={setData} onNext={goNext} onBack={goBack} />
    // Fallback: shouldn't reach here (program must be chosen in step 2)
    return null
  }

  const stepComponents: React.ReactNode[] = [
    <StepName     key="name"     data={data} onChange={setData} onNext={goNext} />,
    <StepProgram  key="program"  data={data} onChange={setData} onNext={goNext} onBack={goBack} />,
    <ConfigStep   key="config"   />,
    <StepBody     key="body"     data={data} onChange={setData} onNext={goNext} onBack={goBack} />,
    <StepInjuries key="injuries" data={data} onChange={setData} onNext={goNext} onBack={goBack} />,
    <StepSchedule key="schedule" data={data} onChange={setData} onNext={goNext} onBack={goBack} />,
    <StepSummary  key="summary"  data={data} onBack={goBack} onSubmit={handleSubmit} isPending={isPending} />,
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col overflow-hidden">
      <ProgressBar current={step} total={TOTAL_STEPS} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
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
