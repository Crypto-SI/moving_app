import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { housingOptions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function HousingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Housing" description="Comparison views balance practical family criteria with a cleaner premium dashboard layout." actionLabel="Add property" />

      <div className="grid gap-4 xl:grid-cols-3">
        {housingOptions.map((home) => (
          <Card key={home.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{home.property_title}</h3>
                <p className="mt-1 text-sm text-slate-500">{home.location}</p>
              </div>
              <Badge tone={home.decision_status === "accepted" ? "success" : home.shortlisted ? "accent" : "neutral"}>{home.decision_status}</Badge>
            </div>
            <p className="mt-4 font-serif text-4xl font-semibold">{formatCurrency(home.rent, home.currency)}</p>
            <p className="mt-2 text-sm text-slate-500">{home.number_of_rooms} rooms • {home.furnished_status}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-white/70 p-3">School: {home.distance_to_school}</div>
              <div className="rounded-2xl bg-white/70 p-3">Hospital: {home.distance_to_hospital}</div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{home.notes}</p>
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
                <Badge tone={home.decision_status === "accepted" ? "success" : home.shortlisted ? "accent" : "neutral"}>{home.decision_status}</Badge>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                <p>{home.location} • {home.postcode}</p>
                <p>Rent {formatCurrency(home.rent, home.currency)} • Deposit {formatCurrency(home.deposit_amount, home.currency)}</p>
                <p>{home.landlord_or_agent_name}</p>
                <p>{home.contact_details}</p>
                <p>Viewed: {home.viewed ? "Yes" : "No"} • Shortlisted: {home.shortlisted ? "Yes" : "No"}</p>
                <Link href={home.advert_link} className="font-semibold text-teal-700 underline underline-offset-4">View advert</Link>
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
                <th className="px-3 py-3 font-medium">Agent</th>
                <th className="px-3 py-3 font-medium">Viewed</th>
                <th className="px-3 py-3 font-medium">Shortlisted</th>
                <th className="px-3 py-3 font-medium">Advert</th>
              </tr>
            </thead>
            <tbody>
              {housingOptions.map((home) => (
                <tr key={home.id} className="border-t border-white/70">
                  <td className="px-3 py-4">
                    <p className="font-semibold text-slate-900">{home.property_title}</p>
                    <p className="text-slate-500">{home.location} • {home.postcode}</p>
                  </td>
                  <td className="px-3 py-4">{formatCurrency(home.rent, home.currency)}</td>
                  <td className="px-3 py-4">{formatCurrency(home.deposit_amount, home.currency)}</td>
                  <td className="px-3 py-4 text-slate-600">{home.landlord_or_agent_name}<br />{home.contact_details}</td>
                  <td className="px-3 py-4">{home.viewed ? "Yes" : "No"}</td>
                  <td className="px-3 py-4">{home.shortlisted ? "Yes" : "No"}</td>
                  <td className="px-3 py-4">
                    <Link href={home.advert_link} className="font-semibold text-teal-700 underline underline-offset-4">
                      View advert
                    </Link>
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
