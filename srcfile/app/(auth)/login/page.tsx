import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  // useSearchParams() needs a Suspense boundary so the rest of the page can render statically.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
