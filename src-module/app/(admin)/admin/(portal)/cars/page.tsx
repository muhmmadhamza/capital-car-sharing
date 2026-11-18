import type { Metadata } from "next";
import { Suspense } from "react";
import { CarsView } from "@/components/admin/cars/CarsView";

export const metadata: Metadata = { title: "Cars" };

export default function AdminCarsPage() {
  return (
    <Suspense>
      <CarsView />
    </Suspense>
  );
}
