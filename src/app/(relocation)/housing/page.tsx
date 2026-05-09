"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AddPropertyModal } from "@/components/sections/property/add-property-modal";
import { EditPropertyModal } from "@/components/sections/property/edit-property-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { EditButton } from "@/components/ui/edit-button";
import { DeleteButton } from "@/components/ui/delete-button";
import { useHousingOptions } from "@/lib/data-hooks";
import { formatCurrency } from "@/lib/utils";
import type { HousingOption } from "@/lib/types";

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
        <EditPropertyModal property={editProperty} onSuccess={handleRefresh} onClose={handleEditClose} />
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
              <Image src={home.image_url} alt={home.property_title} width={640} height={360} unoptimized className="w-full h-48 object-cover rounded-t-2xl -mt-4 -mx-4 mb-4 sm:-mx-5 sm:-mt-5 rounded-t-[1.75rem]" />
            ) : null}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-[var(--foreground)]">{home.property_title}</h3>
                <DeleteButton tableName="moving_housing_options" itemId={home.id} label="property" onSuccess={handleRefresh} />
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{home.location}{home.postcode ? ` • ${home.postcode}` : ""}</p>
            </div>
            <p className="mt-4 break-words font-serif text-3xl font-semibold sm:text-4xl">{formatCurrency(home.rent, home.currency)}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {home.number_of_rooms} rooms • Boys quarters: {home.has_boys_quarters ? "Yes" : "No"}
              {home.furnished_status ? ` • ${home.furnished_status}` : ""}
            </p>
            {(home.distance_to_school || home.distance_to_hospital) && (
              <div className="mt-4 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
                {home.distance_to_school ? <div className="rounded-2xl bg-white/70 dark:bg-white/10 p-3">School: {home.distance_to_school}</div> : null}
                {home.distance_to_hospital ? <div className="rounded-2xl bg-white/70 dark:bg-white/10 p-3">Hospital: {home.distance_to_hospital}</div> : null}
              </div>
            )}
            {home.landlord_or_agent_name && <p className="mt-4 text-sm text-[var(--muted)]">{home.landlord_or_agent_name}</p>}
            {home.notes && <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{home.notes}</p>}
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle title="Property comparison" subtitle="Advert links, contact details, shortlist state, and decision status remain easy to scan." />
        <div className="grid gap-3 md:hidden">
          {housingOptions.map((home) => (
            <div key={home.id} className="rounded-[28px] border border-[var(--border)] bg-white/80 dark:bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-[var(--foreground)]">{home.property_title}</p>
                <div className="flex items-center gap-2">
                  <EditButton item={home} onEdit={setEditProperty} title="Edit property" />
                  <DeleteButton tableName="moving_housing_options" itemId={home.id} label="property" onSuccess={handleRefresh} />
                  <Badge tone={home.decision_status === "accepted" ? "success" : home.shortlisted ? "accent" : "neutral"}>{home.decision_status}</Badge>
                </div>
              </div>
              {home.image_url ? (
                <Image src={home.image_url} alt={home.property_title} width={640} height={320} unoptimized className="mt-3 w-full h-40 object-cover rounded-2xl" />
              ) : null}
              <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
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
            <thead className="text-[var(--muted)]">
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
                <th className="px-3 py-3 font-medium">Edit</th>
                <th className="px-3 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {housingOptions.map((home) => (
                <tr key={home.id} className="border-t border-[var(--border)]">
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      {home.image_url ? (
                        <Image src={home.image_url} alt={home.property_title} width={40} height={40} unoptimized className="h-10 w-10 rounded-xl object-cover" />
                      ) : null}
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{home.property_title}</p>
                        <p className="text-[var(--muted)]">{home.location} • {home.postcode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">{formatCurrency(home.rent, home.currency)}</td>
                  <td className="px-3 py-4">{formatCurrency(home.deposit_amount, home.currency)}</td>
                  <td className="px-3 py-4">{home.number_of_rooms}</td>
                  <td className="px-3 py-4">{home.has_boys_quarters ? "Yes" : "No"}</td>
                  <td className="px-3 py-4 text-[var(--muted)]">{home.landlord_or_agent_name}<br />{home.contact_details}</td>
                  <td className="px-3 py-4">{home.viewed ? "Yes" : "No"}</td>
                  <td className="px-3 py-4">{home.shortlisted ? "Yes" : "No"}</td>
                  <td className="px-3 py-4">
                    <Link href={home.advert_link} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-700 underline underline-offset-4">View advert</Link>
                  </td>
                  <td className="px-3 py-4">
                    <EditButton item={home} onEdit={setEditProperty} title="Edit property" />
                  </td>
                  <td className="px-3 py-4">
                    <DeleteButton tableName="moving_housing_options" itemId={home.id} label="property" onSuccess={handleRefresh} />
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
