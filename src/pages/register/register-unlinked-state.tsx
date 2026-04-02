import { Link } from 'react-router-dom'

export const RegisterUnlinkedState = () => {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-lg font-semibold">Time entries</h2>
      <p className="mt-2 text-zinc-300">Your account is not linked to a manager yet.</p>
      <p className="mt-1 text-sm text-zinc-400">
        Ask a manager to invite your email from the Employees section so you can log time.
      </p>
      <div className="mt-5 rounded-xl border border-zinc-700/80 bg-zinc-950/50 p-4">
        <p className="text-sm font-medium text-zinc-200">You manage a team instead?</p>
        <p className="mt-1 text-sm text-zinc-400">
          Create your company here, then invite employees by email.
        </p>
        <Link
          to="/setup/manager"
          className="mt-3 inline-flex rounded-lg border border-violet-500/50 bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-500/25"
        >
          Set up company
        </Link>
      </div>
    </section>
  )
}
