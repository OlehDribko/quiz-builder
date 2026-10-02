import Link from "next/link";

import NavLink from "./NavLink";

export default function AppHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href="/quizzes" className="text-lg font-semibold tracking-tight text-zinc-900">
          Quiz Builder
        </Link>
        <nav aria-label="Main" className="flex gap-1">
          <NavLink href="/quizzes">Quizzes</NavLink>
          <NavLink href="/create">Create Quiz</NavLink>
        </nav>
      </div>
    </header>
  );
}
