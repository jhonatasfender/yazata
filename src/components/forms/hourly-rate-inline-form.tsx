import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cn } from '../../lib/utils'
import {
  hourlyRateInlineSchema,
  type HourlyRateInlineFormValues,
} from '../../schemas/hourly-rate-inline-schema'

type HourlyRateInlineFormProps = {
  loading: boolean
  onSubmitRate: (value: string) => Promise<void>
}

export const HourlyRateInlineForm = ({
  loading,
  onSubmitRate,
}: HourlyRateInlineFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HourlyRateInlineFormValues>({
    resolver: zodResolver(hourlyRateInlineSchema),
    defaultValues: { hourlyRate: '' },
  })

  const onSubmit = handleSubmit(async ({ hourlyRate }) => {
    await onSubmitRate(hourlyRate)
    reset({ hourlyRate: '' })
  })

  return (
    <form className="mt-3 flex gap-2" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Novo valor/hora"
        {...register('hourlyRate')}
        className={cn(
          'rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm outline-none ring-violet-400 focus:ring-2',
        )}
      />
      <button
        type="submit"
        disabled={loading || isSubmitting}
        className="cursor-pointer rounded-md border border-zinc-600 px-3 py-1 text-sm text-zinc-200 hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Atualizar
      </button>
      {errors.hourlyRate ? (
        <span className="text-xs text-red-300">{errors.hourlyRate.message}</span>
      ) : null}
    </form>
  )
}
