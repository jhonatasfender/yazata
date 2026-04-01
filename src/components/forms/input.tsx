import type { InputHTMLAttributes } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { cn } from '../../lib/utils'

type InputProps = {
  name: string
  label: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'defaultValue'>

export const Input = ({ name, label, className, ...props }: InputProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-300">{label}</span>
          <input
            {...field}
            {...props}
            className={cn(
              'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none ring-violet-400 focus:ring-2',
              className,
            )}
          />
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
