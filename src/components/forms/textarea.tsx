import type { TextareaHTMLAttributes } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { cn } from '../../lib/utils'

type TextareaProps = {
  name: string
  label: string
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'defaultValue'>

export const Textarea = ({ name, label, className, ...props }: TextareaProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-300">{label}</span>
          <textarea
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
