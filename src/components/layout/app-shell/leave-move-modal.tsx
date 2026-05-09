"use client";

export function LeaveMoveModal({
  onClose,
  onLeave,
}: {
  onClose: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[28px] bg-[var(--surface)] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <h3 className="text-2xl font-semibold text-[var(--foreground)]">Leave move?</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          You will lose access to all data in this move. You can create or join a different move afterwards.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-strong)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="flex-1 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Leave move
          </button>
        </div>
      </div>
    </div>
  );
}
