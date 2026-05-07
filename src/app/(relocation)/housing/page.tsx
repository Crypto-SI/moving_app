"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { AddPropertyModal, EditPropertyModal } from "@/components/sections/add-property-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { useHousingOptions } from "@/lib/data-hooks";
import { formatCurrency } from "@/lib/utils";
import type { HousingOption } from "@/lib/types";

function EditButton({
  property,
  onEdit,
}: {
  property: HousingOption;
  onEdit: (p: HousingOption) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onEdit(property)}
      className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
      title="Edit property"
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );
}

export default function HousingPage() {
  const { data: housingOptions, refresh } = useHousingOptions();
  const [editProperty, setEditProperty] = useState<HousingOption | null>(null);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleEditClose = useCallback(() => {
    setEditProperty(null);
  }, []);

  return (
    <div className="space-y-6">
      {editProperty ? (
        <EditPropertyModal
          property={editProperty}
          onSuccess={handleRefresh}
          onClose={handleEditClose}
        />
      ) : null}

      <PageHeader
        title="Housing"
        description="Comparison views balance practical family criteria with a cleaner premium dashboard layout."
        actions={<AddPropertyModal onSuccess={handleRefresh} />}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {housingOptions.map((home) => (
          <Card key={home.id}>
            {home.image_url ? (
              <img
                src={home.image_url}
                alt={home.property_title}
                className="w-full h-48 object-cover rounded-t-2xl -mt-4 -mx-4 mb-4 sm:-mx-5 sm:-mt-5 rounded-t-[1.75rem]"
              />
            ) : null}
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{home.property_title}</h3>
              <p className="mt-1 text-sm text-slate-500">{home.location}{home.postcode ? ` • ${home.postcode}` : ""}</p>
            </div>
            <p className="mt-4 break-words font-serif text-3xl font-semibold sm:text-4xl">{formatCurrency(home.rent, home.currency)}</p>
            <p className="mt-2 text-sm text-slate-500">
              {home.number_of_rooms} rooms • Boys quarters: {home.has_boys_quarters ? "Yes" : "No"}
              {home.furnished_status ? ` • ${home.furnished_status}` : ""}
            </p>
            {(home.distance_to_school || home.distance_to_hospital) && (
              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                {home.distance_to_school ? <div className="rounded-2xl bg-white/70 p-3">School: {home.distance_to_school}</div> : null}
                {home.distance_to_hospital ? <div className="rounded-2xl bg-white/70 p-3">Hospital: {home.distance_to_hospital}</div> : null}
              </div>
            )}
            {home.landlord_or_agent_name && <p className="mt-4 text-sm text-slate-600">{home.landlord_or_agent_name}</p>}
            {home.notes && <p className="mt-3 text-sm leading-6 text-slate-600">{home.notes}</p>}
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle title="Property comparison" subtitle="Advert links, contact details, shortlist state, and decision status remain easy to scan." />
        <div className="grid gap-3 md:hidden">
          {housingOptions.map((home) => (
            <div key={home.id} className="rounded-[28px] border border-white/70 bg-white/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{home.property_title}</p>
                <div className="flex items-center gap-2">
                  <EditButton property={home} onEdit={setEditProperty} />
                  <Badge tone={home.decision_status === "accepted" ? "success" : home.shortlisted ? "accent" : "neutral"}>{home.decision_status}</Badge>
                </div>
              </div>
              {home.image_url ? (
                <img src={home.image_url} alt={home.property_title} className="mt-3 w-full h-40 object-cover rounded-2xl" />
              ) : null}
              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                <p>{home.location} • {home.postcode}</p>
                <p>Rent {formatCurrency(home.rent, home.currency)} • Deposit {formatCurrency(home.deposit_amount, home.currency)}</p>
                <p>{home.number_of_rooms} rooms • Boys quarters: {home.has_boys_quarters ? "Yes" : "No"}</p>
                <p>{home.landlord_or_agent_name}</p>
                <p>{home.contact_details}</p>
                <p>Viewed: {home.viewed ? "Yes" : "No"} • Shortlisted: {home.shortlisted ? "Yes" : "No"}</p>
                <Link href={home.advert_link} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-700 underline underline-offset-4">View advert</Link>
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="hidden min-w-full text-left text-sm md:table">
            <thead className="text-slate-500">
              <tr>
                <th className="px-3 py-3 font-medium">Property</th>
                <th className="px-3 py-3 font-medium">Rent</th>
                <th className="px-3 py-3 font-medium">Deposit</th>
                <th className="px-3 py-3 font-medium">Rooms</th>
                <th className="px-3 py-3 font-medium">Boys quarters</th>
                <th className="px-3 py-3 font-medium">Agent</th>
                <th className="px-3 py-3 font-medium">Viewed</th>
                <th className="px-3 py-3 font-medium">Shortlisted</th>
                <th className="px-3 py-3 font-medium">Advert</th>
                <th className="px-3 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {housingOptions.map((home) => (
                <tr key={home.id} className="border-t border-white/70">
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      {home.image_url ? (
                        <img src={home.image_url} alt={home.property_title} className="h-10 w-10 rounded-xl object-cover" />
                      ) : null}
                      <div>
                        <p className="font-semibold text-slate-900">{home.property_title}</p>
                        <p className="text-slate-500">{home.location} • {home.postcode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">{formatCurrency(home.rent, home.currency)}</td>
                  <td className="px-3 py-4">{formatCurrency(home.deposit_amount, home.currency)}</td>
                  <td className="px-3 py-4">{home.number_of_rooms}</td>
                  <td className="px-3 py-4">{home.has_boys_quarters ? "Yes" : "No"}</td>
                  <td className="px-3 py-4 text-slate-600">{home.landlord_or_agent_name}<br />{home.contact_details}</td>
                  <td className="px-3 py-4">{home.viewed ? "Yes" : "No"}</td>
                  <td className="px-3 py-4">{home.shortlisted ? "Yes" : "No"}</td>
                  <td className="px-3 py-4">
                    <Link href={home.advert_link} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-700 underline underline-offset-4">
                      View advert
                    </Link>
                  </td>
                  <td className="px-3 py-4">
                    <EditButton property={home} onEdit={setEditProperty} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
