"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AddInventoryItemModal } from "@/components/sections/add-inventory-item-modal";
import { OrganiseRoomsModal } from "@/components/sections/organise-rooms-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { useInventoryRooms, useInventoryItems } from "@/lib/data-hooks";
import { InventoryItem } from "@/lib/types";

export function InventoryBoard() {
  const { data: rooms, loading: roomsLoading, refresh: refreshRooms } = useInventoryRooms();
  const { data: initialItems, loading: itemsLoading, refresh: refreshItems } = useInventoryItems();
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setItems(initialItems);
    return () => {
      mounted.current = false;
    };
  }, [initialItems]);

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
        <p className="text-sm text-slate-500">Loading inventory...</p>
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
                  <label key={item.id} className="flex gap-3 rounded-3xl border border-white/70 bg-white/75 p-4">
                    <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600" defaultChecked={item.status === "present"} />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{item.item_name}</p>
                        <Badge tone={item.status === "present" ? "success" : item.status === "required" ? "warning" : "accent"}>{item.status}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">Qty {item.quantity}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.notes}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
