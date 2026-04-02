import { useAuth } from '@clerk/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClerkSupabaseClient, type ProjectRow } from '../lib/supabase'
import { ProjectsRepository } from '../repositories/projects-repository'

type UseProjectsOptions = {
  enabled: boolean
  companyId?: string
  employmentContractId?: string
}

type CreateProjectInput = {
  companyId: string
  createdByContractId?: string
  name: string
}

type ToggleProjectInput = {
  id: string
  companyId: string
}

export const useProjects = ({
  enabled,
  companyId,
  employmentContractId,
}: UseProjectsOptions) => {
  const { getToken } = useAuth()
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken])
  const repository = useMemo(() => new ProjectsRepository(supabase), [supabase])

  const loadProjects = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const rows = companyId
        ? await repository.listByCompany(companyId)
        : await repository.listByEmploymentContract(employmentContractId ?? '')

      setProjects(rows)
      setLoading(false)
    } catch (queryError) {
      setError((queryError as Error).message)
      setLoading(false)
    }
  }, [companyId, enabled, employmentContractId, repository])

  const createProject = useCallback(
    async (input: CreateProjectInput) => {
      const normalizedName = input.name.trim()
      if (!normalizedName) {
        setError('Informe um nome de projeto.')
        return false
      }

      setError(null)
      setLoading(true)

      try {
        await repository.create({
          companyId: input.companyId,
          name: normalizedName,
          createdByContractId: input.createdByContractId,
        })
      } catch (creationError) {
        setError((creationError as Error).message)
        setLoading(false)
        return false
      }

      await loadProjects()
      return true
    },
    [loadProjects, repository],
  )

  const archiveProject = useCallback(
    async (input: ToggleProjectInput) => {
      setError(null)
      setLoading(true)

      try {
        await repository.archive(input)
      } catch (archiveError) {
        setError((archiveError as Error).message)
        setLoading(false)
        return false
      }

      await loadProjects()
      return true
    },
    [loadProjects, repository],
  )

  const unarchiveProject = useCallback(
    async (input: ToggleProjectInput) => {
      setError(null)
      setLoading(true)

      try {
        await repository.unarchive(input)
      } catch (archiveError) {
        setError((archiveError as Error).message)
        setLoading(false)
        return false
      }

      await loadProjects()
      return true
    },
    [loadProjects, repository],
  )

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  return {
    projects,
    loading,
    error,
    createProject,
    archiveProject,
    unarchiveProject,
    reloadProjects: loadProjects,
  }
}
