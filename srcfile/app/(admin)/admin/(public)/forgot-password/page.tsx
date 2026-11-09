import type { Metadata } from "next";
import { AdminForgotPasswordForm } from "@/components/admin/AdminForgotPasswordForm";

export const metadata: Metadata = { title: "Reset admin password" };

export default function AdminForgotPasswordPage() {
  return <AdminForgotPasswordForm />;
}
