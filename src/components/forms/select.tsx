import type { SelectHTMLAttributes } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { cn } from '../../lib/utils'

type SelectOption = {
  value: string
  label: string
}

type SelectProps = {
  name: string
  label: string
  options: SelectOption[]
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name' | 'defaultValue'>

export const Select = ({ name, label, options, className, ...props }: SelectProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-300">{label}</span>
          <select
            {...field}
            {...props}
            className={cn(
              'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none ring-violet-400 focus:ring-2',
              className,
            )}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldState.error ? (
            <span className="mt-1 block text-xs text-red-300">
              {fieldState.error.message}
            </span>
          ) : null}
        </label>
      )}
    />
  )
}
