'use client'

import { useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { saveOnboarding } from './actions'
import ProgressBar from './_components/ProgressBar'
import StepGoals from './_components/StepGoals'
import StepLevel from './_components/StepLevel'
import StepBody from './_components/StepBody'
import StepEquipment from './_components/StepEquipment'
import StepSummary from './_components/StepSummary'
import type { OnboardingData } from './types'

const INITIAL_DATA: OnboardingData = {
  goals: [],
  level: '',
  available_days: 4,
  age: '',
  weight: '',
  height: '',
  current_5k_time: '',
  current_10k_time: '',
  equipment: '',
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit:  (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
  }),
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA)
  const [isPending, startTransition] = useTransition()

  const totalSteps = 5

  const goNext = () => {
    setDirection(1)
    setStep(s => Math.min(s + 1, totalSteps))
  }

  const goBack = () => {
    setDirection(-1)
    setStep(s => Math.max(s - 1, 1))
  }

  const handleSubmit = () => {
    startTransition(async () => {
      await saveOnboarding(data)
    })
  }

  const stepComponents = [
    <StepGoals      key="goals"      data={data} onChange={setData} onNext={goNext} />,
    <StepLevel      key="level"      data={data} onChange={setData} onNext={goNext} onBack={goBack} />,
    <StepBody       key="body"       data={data} onChange={setData} onNext={goNext} onBack={goBack} />,
    <StepEquipment  key="equipment"  data={data} onChange={setData} onNext={goNext} onBack={goBack} />,
    <StepSummary    key="summary"    data={data} onBack={goBack} onSubmit={handleSubmit} isPending={isPending} />,
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col overflow-hidden">
      <ProgressBar current={step} total={totalSteps} />

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
