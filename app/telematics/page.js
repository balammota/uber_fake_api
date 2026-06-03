import Link from "next/link";

export default function TelematicsLandingPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="border-b border-zinc-800 bg-black">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-bold text-white hover:opacity-90">
            Uber Developers
          </Link>
          <Link href="/" className="text-sm text-zinc-400 hover:text-white">
            ← API Docs
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Uber Telematics API</h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-400">
          Simulation environment for driver telematics data sharing between Uber and insurance
          partners. Choose a portal to explore partner management or insurer consumption flows.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <article className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white">Uber Partner Dashboard</h2>
            <p className="mt-3 flex-1 text-zinc-400">
              Manage insurance partners, monitor API usage, and track consent across your driver
              network.
            </p>
            <Link
              href="/telematics/uber"
              className="mt-6 inline-flex w-fit items-center rounded bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-zinc-200"
            >
              Enter Uber Portal →
            </Link>
          </article>

          <article className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white">Insurance Partner Portal</h2>
            <p className="mt-3 flex-1 text-zinc-400">
              Access driver telematics data, run risk assessments, and build UBI products.
            </p>
            <Link
              href="/telematics/insurer"
              className="mt-6 inline-flex w-fit items-center rounded bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-zinc-200"
            >
              Enter Insurer Portal →
            </Link>
          </article>
        </div>
      </main>
    </div>
  );
}
