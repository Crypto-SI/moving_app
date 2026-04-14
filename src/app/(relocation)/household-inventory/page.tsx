import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderModal } from "@/components/sections/placeholder-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { inventoryItems, inventoryRooms } from "@/lib/mock-data";

export default function HouseholdInventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Household Inventory"
        description="Checklist-driven room grouping makes this section practical for packing, buying locally, and spotting missing essentials early."
        actions={
          <PlaceholderModal
            title="Add inventory item"
            description="Future form submission will create a new room-linked row in `relocategh_inventory_items`."
            actionLabel="Add inventory item"
          />
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {inventoryRooms.map((room) => (
          <Card key={room.id}>
            <CardTitle title={room.room_name} subtitle={`${inventoryItems.filter((item) => item.room_id === room.id).length} tracked items`} />
            <div className="space-y-3">
              {inventoryItems.filter((item) => item.room_id === room.id).map((item) => (
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
        ))}
      </div>
    </div>
  );
}
