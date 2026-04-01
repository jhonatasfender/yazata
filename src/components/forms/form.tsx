import type { FormHTMLAttributes, ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type SubmitHandler,
  type UseFormProps,
} from 'react-hook-form'
import { cn } from '../../lib/utils'

type ZodSchema = Parameters<typeof zodResolver>[0]

type FormProps<T extends FieldValues> = {
  defaultValues: DefaultValues<T>
  onSubmit: SubmitHandler<T>
  schema?: ZodSchema
  children: ReactNode
  formOptions?: Omit<UseFormProps<T>, 'defaultValues' | 'resolver'>
} & Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'>

export const Form = <T extends FieldValues>({
  defaultValues,
  onSubmit,
  schema,
  children,
  formOptions,
  className,
  ...props
}: FormProps<T>) => {
  const resolver = schema ? (zodResolver(schema) as Resolver<T, unknown, T>) : undefined

  const methods = useForm<T>({
    defaultValues,
    resolver,
    ...formOptions,
  })

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={cn(className)}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  )
}
