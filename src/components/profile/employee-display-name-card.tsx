import { useAuth } from '@clerk/react'
import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import type { AppLayoutContext } from '../app-layout'
import { Form } from '../forms/form'
import { Input } from '../forms/input'
import { SubmitButton } from '../forms/submit-button'
import { createClerkSupabaseClient } from '../../lib/supabase'
import { WorkspaceRepository } from '../../repositories/workspace-repository'
import {
  employeeSelfDisplayNameSchema,
  type EmployeeSelfDisplayNameFormValues,
} from '../../schemas/employee-self-display-name-schema'
import { employeeDisplayLabel } from '../../utils/employee-display-label'

export const EmployeeDisplayNameCard = () => {
  const { employee, refreshWorkspace } = useOutletContext<AppLayoutContext>()
  const { getToken } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [savedHint, setSavedHint] = useState(false)
  const supabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken])
  const repository = useMemo(() => new WorkspaceRepository(supabase), [supabase])

  if (!employee) return null

  const onSubmit = async (values: EmployeeSelfDisplayNameFormValues) => {
    setFormError(null)
    setSavedHint(false)
    try {
      await repository.setMyEmployeeDisplayName(values.displayName)
      await refreshWorkspace()
      setSavedHint(true)
    } catch (err) {
      setFormError((err as Error).message)
    }
  }

  const previewLabel = employeeDisplayLabel(employee)

  return (
    <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-zinc-100">Como seu nome aparece</h3>
      <p className="mt-1 text-sm leading-relaxed text-zinc-400">
        Esse nome é exibido para você e para a equipe no resumo e na lista de pessoas. O
        gestor também pode ajustá-lo. Se deixar em branco, usamos seu e-mail de contrato:{' '}
        <span className="text-zinc-300">{employee.employee_email}</span>
      </p>
      <p className="mt-3 text-sm text-zinc-500">
        Pré-visualização:{' '}
        <span className="font-medium text-violet-200">{previewLabel}</span>
      </p>

      {formError ? (
        <p className="mt-3 rounded-lg border border-red-800/80 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {formError}
        </p>
      ) : null}

      {savedHint ? (
        <p className="mt-3 text-sm text-emerald-400">Nome atualizado.</p>
      ) : null}

      <Form<EmployeeSelfDisplayNameFormValues>
        key={employee.id + (employee.employee_display_name ?? '')}
        className="mt-4 max-w-md space-y-3"
        schema={employeeSelfDisplayNameSchema}
        defaultValues={{ displayName: employee.employee_display_name ?? '' }}
        onSubmit={onSubmit}
      >
        <Input
          type="text"
          name="displayName"
          label="Nome de exibição"
          placeholder="Ex.: Maria Silva"
          autoComplete="name"
        />
        <SubmitButton className="w-full sm:w-auto">Guardar nome</SubmitButton>
      </Form>
    </div>
  )
}
