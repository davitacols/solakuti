import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin",
  description: "Solakuti newsroom administration dashboard."
};

export default function AdminPage() {
  return <AdminDashboard />;
}
