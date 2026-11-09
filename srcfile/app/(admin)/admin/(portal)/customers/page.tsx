import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomersView } from "@/components/admin/customers/CustomersView";

export const metadata: Metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  // useSearchParams() needs a Suspense boundary so the rest of the page can render statically.
  return (
    <Suspense>
      <CustomersView />
    </Suspense>
  );
}
