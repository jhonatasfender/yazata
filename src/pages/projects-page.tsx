import { useState, type FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { AppLayoutContext } from '../components/app-layout'
import { useProjects } from '../hooks/use-projects'

export const ProjectsPage = () => {
  const { manager, employee, activeWorkspaceContext } =
    useOutletContext<AppLayoutContext>()
  const [name, setName] = useState('')

  const projectsEnabled =
    (activeWorkspaceContext === 'employee' && Boolean(employee)) ||
    (activeWorkspaceContext === 'manager' && Boolean(manager))

  const companyIdForMutations =
    activeWorkspaceContext === 'manager' ? manager?.company_id : employee?.company_id

  const { projects, loading, error, createProject, archiveProject, unarchiveProject } =
    useProjects({
      enabled: projectsEnabled,
      companyId:
        activeWorkspaceContext === 'manager' && manager ? manager.company_id : undefined,
      employmentContractId:
        activeWorkspaceContext === 'employee' && employee ? employee.id : undefined,
    })

  const isUnlinked = !manager && !employee

  const activeProjects = projects.filter((project) => project.is_active)
  const inactiveProjects = projects.filter((project) => !project.is_active)

  const onCreateProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!companyIdForMutations) return

    const success = await createProject({
      name,
      companyId: companyIdForMutations,
      createdByContractId:
        activeWorkspaceContext === 'employee' ? employee?.id : undefined,
    })

    if (success) setName('')
  }

  if (!projectsEnabled && !isUnlinked) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Projects</h2>
        <p className="mt-2 text-zinc-300">
          Switch workspace in the header to load projects for the employee or manager
          context.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      {isUnlinked ? (
        <article className="rounded-2xl border border-amber-800/70 bg-amber-950/20 p-4 text-sm text-amber-100">
          You are not linked as an employee or manager yet. You can browse once linked;
          changes require an active role.
        </article>
      ) : null}

      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Team projects</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Create projects your team can use when logging time.
        </p>

        <form
          className="mt-4 flex flex-wrap gap-3"
          onSubmit={(event) => void onCreateProject(event)}
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Mobile app migration"
            className="min-w-[260px] flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none ring-violet-400 focus:ring-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Create project'}
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
          Active projects ({activeProjects.length})
        </h3>
        <ul className="mt-3 space-y-2">
          {activeProjects.length === 0 ? (
            <li className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-400">
              No active projects.
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
                    void archiveProject({ id: project.id, companyId: project.company_id })
                  }
                  className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:border-zinc-500"
                >
                  Archive
                </button>
              </li>
            ))
          )}
        </ul>
      </article>

      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="text-base font-semibold">
          Archived projects ({inactiveProjects.length})
        </h3>
        <ul className="mt-3 space-y-2">
          {inactiveProjects.length === 0 ? (
            <li className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-400">
              No archived projects.
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
                      companyId: project.company_id,
                    })
                  }
                  className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:border-zinc-500"
                >
                  Restore
                </button>
              </li>
            ))
          )}
        </ul>
      </article>
    </section>
  )
}
