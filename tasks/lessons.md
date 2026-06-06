# Lessons

## Lesson: WorkoutBlock hr_zone must be set on ALL run workout types
**Context**: When building run session builders (buildFartlek, buildEasyRun, etc.)
**Error anterior**: Fartlek main block was missing `hr_zone` — only caught by edge case test with 6 training days
**Rule**: Every `type: 'main'` block in a RUN workout MUST have `hr_zone` set. Fartlek uses Z3 (alternating Z2-Z4).

## Lesson: WorkoutInsert does NOT have a `phase` column
**Context**: The `phase` for each week is stored in `plan.structure.phase_map`, not on individual workout rows.
**Rule**: Don't try to set `phase` on workout inserts — it's not in the DB schema.

## Lesson: calcTotalWeeks must accept optional second arg
**Context**: generatePlan internally calls `calcTotalWeeks(goals, programType)` to differentiate GYM vs RUN default durations.
**Rule**: Keep the signature as `(goals, programType?)` — the second arg is optional for external consumers but used internally.

## Lesson: Test edge cases with max training days
**Context**: Fartlek slots only appear with 6 training days — the default 5-day test missed the hr_zone bug.
**Rule**: Always test with 3, 4, 5, AND 6 training days to catch slot-specific issues.

## Lesson: Phase systems are NOT interchangeable across programs
**Context**: Mix & Match — when primary is GYM, phaseMap contains GymPhase values. Passing them to run builders (which expect RunPhase) crashes at runtime with `undefined is not iterable`.
**Error anterior**: Secondary run workouts received GymPhase ('familiarization') instead of RunPhase ('base'), causing buildEasyRun to fail on `durationMap[phase]`.
**Rule**: Always map phases when crossing program boundaries. Use `gymPhaseToRunPhase()` for secondary run workouts and `runPhaseToGymPhase()` for secondary gym workouts.
