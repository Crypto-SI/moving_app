"use client";

import { useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AddShippingQuoteModal } from "@/components/sections/shipping/add-shipping-quote-modal";
import { useShippingQuotes } from "@/lib/data-hooks";
import { ShippingQuoteCards, ShippingComparisonTable, PreferredQuotesCard } from "@/components/sections/shipping/shipping-cards";

export default function ShippingPage() {
  const { data: shippingQuotes, refresh } = useShippingQuotes();

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping"
        description="Quotes are split by first leg, boat leg, and final leg so every shipper offer maps to the exact section of the journey it covers."
        actions={<AddShippingQuoteModal onSuccess={handleRefresh} />}
      />

      <PreferredQuotesCard shippingQuotes={shippingQuotes} />
      <ShippingQuoteCards shippingQuotes={shippingQuotes} />
      <ShippingComparisonTable shippingQuotes={shippingQuotes} />
    </div>
  );
}
