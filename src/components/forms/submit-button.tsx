import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { cn } from '../../lib/utils'

type SubmitButtonProps = {
  children: ReactNode
  loadingText?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'disabled'>

export const SubmitButton = ({
  children,
  loadingText = 'Salvando...',
  className,
  ...props
}: SubmitButtonProps) => {
  const {
    formState: { isSubmitting },
  } = useFormContext()

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={cn(
        'w-full cursor-pointer rounded-xl bg-violet-500 px-4 py-2 font-medium text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-70',
        className,
      )}
      {...props}
    >
      {isSubmitting ? loadingText : children}
    </button>
  )
}
