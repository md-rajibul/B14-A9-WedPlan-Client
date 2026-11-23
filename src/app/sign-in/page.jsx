import { PageShell } from "@/components/Chrome";
import { AuthForm } from "@/components/AuthForm";
export default function SignIn() {
  return <PageShell><AuthForm mode="signin" /></PageShell>;
}
