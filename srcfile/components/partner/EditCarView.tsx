"use client";

import Link from "next/link";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/customer/States";
import { Button } from "@/components/ui/Button";
import { ChevronLeftIcon } from "@/components/ui/Icons";
import { usePartnerCar } from "@/hooks/usePartnerData";
import { CarForm } from "./CarForm";

export function EditCarView({ id }: { id: string }) {
  const { data, loading, error, reload } = usePartnerCar(id);
  const back = (
    <Link href="/partner/cars" className="mb-5 inline-flex h-10 items-center gap-1 text-sm font-semibold text-navy-900 hover:text-gold-700">
      <ChevronLeftIcon width={16} height={16} /> My Cars
    </Link>
  );

  if (error) return <div>{back}<ErrorBlock message={error} onRetry={reload} /></div>;
  if (loading) return <div>{back}<LoadingBlock label="Loading car" rows={3} /></div>;
  if (!data) {
    return (
      <div>
        {back}
        <EmptyBlock title="Car not found" text="It may have been deleted, or it belongs to another partner." action={<Button href="/partner/cars">Back to My Cars</Button>} />
      </div>
    );
  }
  return (
    <div>
      {back}
      {/* key: a fresh form state if the car changes underneath */}
      <CarForm key={data.id} mode="edit" car={data} />
    </div>
  );
}
