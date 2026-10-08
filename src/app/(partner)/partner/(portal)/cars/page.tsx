import type { Metadata } from "next";
import { Suspense } from "react";
import { MyCarsView } from "@/components/partner/MyCarsView";

export const metadata: Metadata = { title: "My cars" };

export default function MyCarsPage() {
  return (
    <Suspense>
      <MyCarsView />
    </Suspense>
  );
}
