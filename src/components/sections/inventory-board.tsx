"use client";

import { Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AddInventoryItemModal } from "@/components/sections/add-inventory-item-modal";
import { OrganiseRoomsModal } from "@/components/sections/organise-rooms-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useInventoryRooms, useInventoryItems } from "@/lib/data-hooks";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import type { InventoryItem } from "@/lib/types";

function InventoryItemRow({ item, onRefresh }: { item: InventoryItem; onRefresh: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleToggle(checked: boolean) {
    const supabase = createBrowserClient();
    await supabase
      .from("moving_inventory_items")
      .update({ status: checked ? "present" : "required" })
      .eq("id", item.id);
    onRefresh();
  }

  async function handleDelete() {
    const supabase = createBrowserClient();
    await supabase.from("moving_inventory_items").delete().eq("id", item.id);
    onRefresh();
  }

  return (
    <div className="flex gap-3 rounded-3xl border border-[var(--border)] dark:bg-white/5 p-4">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600"
        checked={item.status === "present"}
        onChange={(e) => handleToggle(e.target.checked)}
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-[var(--foreground)]">{item.item_name}</p>
          <Badge tone={item.status === "present" ? "success" : item.status === "required" ? "warning" : "accent"}>{item.status}</Badge>
          {confirmDelete ? (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-[var(--muted)]">Delete?</span>
              <Button variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => setConfirmDelete(false)}>No</Button>
              <Button className="!bg-rose-600 !text-white !px-2 !py-1 text-xs" onClick={handleDelete}>Yes</Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="ml-auto rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition"
              title="Delete item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">Qty {item.quantity}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{item.notes}</p>
      </div>
    </div>
  );
}

export function InventoryBoard() {
  const { data: rooms, loading: roomsLoading, refresh: refreshRooms } = useInventoryRooms();
  const { data: items, loading: itemsLoading, refresh: refreshItems } = useInventoryItems();

  const refresh = useCallback(() => {
    refreshRooms();
    refreshItems();
  }, [refreshRooms, refreshItems]);

  if (roomsLoading || itemsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Household Inventory"
          description="Checklist-driven room grouping makes this section practical for packing, buying locally, and spotting missing essentials early."
        />
        <p className="text-sm text-[var(--muted)]">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Household Inventory"
        description="Checklist-driven room grouping makes this section practical for packing, buying locally, and spotting missing essentials early."
        actions={
          <div className="flex flex-wrap gap-2">
            <OrganiseRoomsModal onSuccess={refresh} />
            <AddInventoryItemModal onSuccess={refresh} />
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {rooms.map((room) => {
          const roomItems = items.filter((item) => item.room_id === room.id);
          return (
            <Card key={room.id}>
              <CardTitle title={room.room_name} subtitle={`${roomItems.length} tracked items`} />
              <div className="space-y-3">
                {roomItems.map((item) => (
                  <InventoryItemRow key={item.id} item={item} onRefresh={refresh} />
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
