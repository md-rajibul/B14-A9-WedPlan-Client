import Link from "next/link";
import { PageShell } from "@/components/Chrome";
export default function PaymentCancel() {
  return <PageShell><main className="section container center">
    <h1>Checkout Cancelled</h1><p>No premium subscription was activated.</p>
    <Link className="btn btn-primary" href="/dashboard">Return to Dashboard</Link>
  </main></PageShell>;
}
