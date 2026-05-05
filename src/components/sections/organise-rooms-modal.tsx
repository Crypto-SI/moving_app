"use client";

import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

interface Room {
  id: string;
  room_name: string;
  sort_order: number;
}

export function OrganiseRoomsModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("moving_inventory_rooms")
      .select("id, room_name, sort_order")
      .eq("user_id", user.id)
      .order("sort_order");

    if (data) setRooms(data);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setNewRoomName("");
    setEditingId(null);
    fetchRooms().finally(() => setLoading(false));
  }, [open, fetchRooms]);

  async function handleAdd() {
    const name = newRoomName.trim();
    if (!name) return;
    setError(null);
    setActionLoading("add");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setActionLoading(null);
      return;
    }

    const maxSort = rooms.length > 0 ? Math.max(...rooms.map((r) => r.sort_order)) : 0;

    const { error: insertError } = await supabase.from("moving_inventory_rooms").insert({
      user_id: user.id,
      room_name: name,
      sort_order: maxSort + 1,
    });

    if (insertError) {
      setError(insertError.message);
      setActionLoading(null);
      return;
    }

    setNewRoomName("");
    await fetchRooms();
    setActionLoading(null);
    onSuccess();
  }

  async function handleRename(id: string) {
    const name = editingName.trim();
    if (!name) return;
    setError(null);
    setActionLoading(id);

    const { error: updateError } = await supabase
      .from("moving_inventory_rooms")
      .update({ room_name: name })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setActionLoading(null);
      return;
    }

    setEditingId(null);
    setEditingName("");
    await fetchRooms();
    setActionLoading(null);
    onSuccess();
  }

  async function handleDelete(id: string) {
    setError(null);
    setActionLoading(`del-${id}`);

    const { error: deleteError } = await supabase.from("moving_inventory_rooms").delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setActionLoading(`del-${id}`);
      return;
    }

    await fetchRooms();
    setActionLoading(null);
    onSuccess();
  }

  function startEdit(room: Room) {
    setEditingId(room.id);
    setEditingName(room.room_name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect x="7" y="7" width="10" height="10" rx="1" />
        </svg>
        Organise rooms
      </Button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-3 py-4 sm:items-center sm:px-4"
          onClick={() => setOpen(false)}
        >
          <Card className="w-full max-w-lg max-h-[80vh] flex flex-col p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Manage rooms</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Organise rooms</h3>
              </div>
              <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div className="flex gap-2">
                <Input
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="New room name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                  }}
                />
                <Button onClick={handleAdd} disabled={actionLoading === "add" || !newRoomName.trim()} className="shrink-0">
                  {actionLoading === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>

              {loading ? (
                <p className="py-4 text-center text-sm text-slate-500">Loading rooms...</p>
              ) : rooms.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">No rooms yet. Add your first room above.</p>
              ) : (
                <ul className="space-y-2">
                  {rooms.map((room) => (
                    <li
                      key={room.id}
                      className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/75 p-3"
                    >
                      {editingId === room.id ? (
                        <>
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(room.id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            onClick={() => handleRename(room.id)}
                            disabled={actionLoading === room.id || !editingName.trim()}
                            className="shrink-0"
                          >
                            {actionLoading === room.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                          </Button>
                          <Button variant="ghost" onClick={cancelEdit} className="shrink-0">
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm font-medium text-slate-900">{room.room_name}</span>
                          <button
                            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            onClick={() => startEdit(room)}
                            disabled={actionLoading !== null}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => setConfirmDeleteId(room.id)}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === `del-${room.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {confirmDeleteId ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-medium text-slate-900">
                    Delete &ldquo;{rooms.find((r) => r.id === confirmDeleteId)?.room_name}&rdquo; and all its items?
                  </p>
                  <p className="mt-1 text-xs text-slate-500">This action cannot be undone.</p>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-rose-600 text-white hover:bg-rose-700"
                      onClick={() => {
                        handleDelete(confirmDeleteId);
                        setConfirmDeleteId(null);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ) : null}

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
