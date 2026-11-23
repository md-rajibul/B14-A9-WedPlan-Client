import Link from "next/link";
import { PageShell } from "@/components/Chrome";
export default function PaymentSuccess() {
  return <PageShell><main className="section container center">
    <h1>Payment Received</h1>
    <p>Your subscription is being verified by Stripe. Premium access is enabled only after a confirmed webhook.</p>
    <Link href="/dashboard" className="btn btn-primary">Return to Dashboard</Link>
  </main></PageShell>;
}
