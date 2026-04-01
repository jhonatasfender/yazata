import { useState, type FormEvent } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import type { AppLayoutContext } from '../components/app-layout'
import { useProjects } from '../hooks/use-projects'

export const ProjectsPage = () => {
  const { manager, employee } = useOutletContext<AppLayoutContext>()
  const [name, setName] = useState('')

  const managerId = manager?.id ?? employee?.manager_id
  const { projects, loading, error, createProject, archiveProject, unarchiveProject } =
    useProjects({
      enabled: Boolean(manager || employee),
      managerId: manager?.id,
      employeeId: employee?.id,
    })

  if (!manager && !employee) {
    return <Navigate to="/" replace />
  }

  const activeProjects = projects.filter((project) => project.is_active)
  const inactiveProjects = projects.filter((project) => !project.is_active)

  const onCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!managerId) return

    const success = await createProject({
      name,
      managerId,
      createdByEmployeeId: employee?.id,
    })

    if (success) setName('')
  }

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Projetos da equipe</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Cadastre projetos para que toda a equipe possa usar no registro de horas.
        </p>

        <form
          className="mt-4 flex flex-wrap gap-3"
          onSubmit={(event) => void onCreateProject(event)}
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Migração do app mobile"
            className="min-w-[260px] flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none ring-violet-400 focus:ring-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Criar projeto'}
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-700 bg-red-950/40 p-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </article>

      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="text-base font-semibold">
          Projetos ativos ({activeProjects.length})
        </h3>
        <ul className="mt-3 space-y-2">
          {activeProjects.length === 0 ? (
            <li className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-400">
              Nenhum projeto ativo.
            </li>
          ) : (
            activeProjects.map((project) => (
              <li
                key={project.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3"
              >
                <span className="text-sm text-zinc-100">{project.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    void archiveProject({ id: project.id, managerId: project.manager_id })
                  }
                  className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:border-zinc-500"
                >
                  Arquivar
                </button>
              </li>
            ))
          )}
        </ul>
      </article>

      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="text-base font-semibold">
          Projetos arquivados ({inactiveProjects.length})
        </h3>
        <ul className="mt-3 space-y-2">
          {inactiveProjects.length === 0 ? (
            <li className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-400">
              Nenhum projeto arquivado.
            </li>
          ) : (
            inactiveProjects.map((project) => (
              <li
                key={project.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3"
              >
                <span className="text-sm text-zinc-300">{project.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    void unarchiveProject({
                      id: project.id,
                      managerId: project.manager_id,
                    })
                  }
                  className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:border-zinc-500"
                >
                  Reativar
                </button>
              </li>
            ))
          )}
        </ul>
      </article>
    </section>
  )
}
