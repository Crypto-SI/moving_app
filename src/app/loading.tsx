export default function GlobalLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-[var(--background)] p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="h-24 rounded-[28px] bg-white/70 dark:bg-white/10" />
        <div className="h-32 rounded-[28px] bg-white/70 dark:bg-white/10" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-56 rounded-[28px] bg-white/70 dark:bg-white/10" />
          <div className="h-56 rounded-[28px] bg-white/70 dark:bg-white/10" />
          <div className="h-56 rounded-[28px] bg-white/70 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}
