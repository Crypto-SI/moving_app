"use client";

import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { getMoveIdForUser } from "@/lib/move-context";
import { InventoryStatus } from "@/lib/types";

const STATUS_OPTIONS: InventoryStatus[] = ["present", "required", "will purchase in country"];

interface Room {
  id: string;
  room_name: string;
}

interface FormData {
  room_id: string;
  item_name: string;
  quantity: number;
  status: InventoryStatus;
  notes: string;
}

export function AddInventoryItemModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    room_id: "",
    item_name: "",
    quantity: 1,
    status: "present",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    createBrowserClient()
      .from("moving_inventory_rooms")
      .select("id, room_name")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setRooms(data);
      });
  }, [open]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.room_id || !form.item_name.trim()) {
      setError("Room and item name are required.");
      return;
    }
    setLoading(true);
    const moveId = await getMoveIdForUser();
    if (!moveId) {
      setError("You must be in a move to add an item.");
      setLoading(false);
      return;
    }
    const { error: insertError } = await createBrowserClient().from("moving_inventory_items").insert({
      move_id: moveId,
      room_id: form.room_id,
      item_name: form.item_name.trim(),
      quantity: form.quantity,
      status: form.status,
      notes: form.notes,
    });
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setForm({ room_id: "", item_name: "", quantity: 1, status: "present", notes: "" });
    setOpen(false);
    onSuccess();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add inventory item
      </Button>
      {open ? (
        <ModalOverlay label="Add inventory item" title="New item" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Room</label>
              <select
                value={form.room_id}
                onChange={(e) => update("room_id", e.target.value)}
                className="w-full rounded-2xl border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--foreground)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
              >
                <option value="">Select a room</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Item name</label>
              <Input value={form.item_name} onChange={(e) => update("item_name", e.target.value)} placeholder="e.g. Standing desk" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Quantity</label>
                <Input type="number" min={1} value={form.quantity} onChange={(e) => update("quantity", Math.max(1, Number(e.target.value)))} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value as InventoryStatus)}
                  className="w-full rounded-2xl border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--foreground)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={3}
                className="w-full rounded-2xl border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--foreground)] px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]"
                placeholder="Optional notes about this item"
              />
            </div>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add item
              </Button>
            </div>
          </form>
        </ModalOverlay>
      ) : null}
    </>
  );
}
