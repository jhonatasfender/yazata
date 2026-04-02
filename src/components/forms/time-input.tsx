import { parseTime } from '@internationalized/date'
import { Controller, useFormContext } from 'react-hook-form'
import { DateInput, DateSegment, Label, TimeField } from 'react-aria-components'
import { cn } from '../../lib/utils'

type TimeInputProps = {
  name: string
  label: string
  className?: string
  revalidateFieldsOnBlur?: string[]
}

const DEFAULT_TIME = '00:00'

export const TimeInput = ({
  name,
  label,
  className,
  revalidateFieldsOnBlur,
}: TimeInputProps) => {
  const { control, trigger } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const value =
          typeof field.value === 'string' && field.value ? field.value : DEFAULT_TIME

        return (
          <TimeField
            value={parseTime(value)}
            onChange={(nextValue) =>
              field.onChange(nextValue ? nextValue.toString() : DEFAULT_TIME)
            }
            onBlur={(event) => {
              const next = event.relatedTarget as Node | null
              if (next && event.currentTarget.contains(next)) return
              field.onBlur()
              if (revalidateFieldsOnBlur?.length) {
                void trigger(revalidateFieldsOnBlur)
              }
            }}
            granularity="minute"
            hourCycle={24}
            className={cn('block', className)}
          >
            <Label className="mb-1 block text-sm text-zinc-300">{label}</Label>
            <DateInput className="flex h-[42px] w-full items-center rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none ring-violet-400 focus-within:ring-2">
              {(segment) => (
                <DateSegment
                  segment={segment}
                  className="rounded-sm px-0.5 tabular-nums text-zinc-200 outline-none data-[type=literal]:px-0 data-[type=literal]:text-zinc-500 focus:bg-violet-500/20"
                />
              )}
            </DateInput>
            {fieldState.error ? (
              <span className="mt-1 block text-pretty text-xs leading-snug text-red-300">
                {fieldState.error.message}
              </span>
            ) : null}
          </TimeField>
        )
      }}
    />
  )
}
