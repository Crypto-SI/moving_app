export default function AppLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-[28px] bg-white/70 dark:bg-white/10" />
      <div className="grid gap-4 xl:grid-cols-4">
        <div className="h-36 rounded-[28px] bg-white/70 dark:bg-white/10" />
        <div className="h-36 rounded-[28px] bg-white/70 dark:bg-white/10" />
        <div className="h-36 rounded-[28px] bg-white/70 dark:bg-white/10" />
        <div className="h-36 rounded-[28px] bg-white/70 dark:bg-white/10" />
      </div>
      <div className="h-[420px] rounded-[28px] bg-white/70 dark:bg-white/10" />
    </div>
  );
}
