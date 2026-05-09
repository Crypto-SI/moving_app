export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-white/70 dark:bg-white/10">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-teal-600 via-teal-500 to-amber-400 transition-all"
        style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
      />
    </div>
  );
}
