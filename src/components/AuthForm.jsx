"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { authClient } from "@/lib/auth";
import { api } from "@/lib/api";

export function AuthForm({ mode }) {
  const signup = mode === "signup";
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [businessName, setBusinessName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      if (signup && (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || password.length < 6))
        throw Error("Password needs 6+ characters, an uppercase and a lowercase letter.");
      if (signup && role === "vendor" && !businessName.trim())
        throw Error("Enter a business name.");
      const result = signup
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });
      if (result.error) throw Error(result.error.message || "Authentication failed");
      if (signup) {
        try {
          await api("/api/profile/role", {
            method: "POST", body: JSON.stringify({ role, businessName })
          }, true);
        } catch (e) {
          // The dashboard allows completion if role selection needs another request.
          setMessage(`Account created. Finish role selection in dashboard: ${e.message}`);
        }
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e) { setMessage(e.message); }
    finally { setBusy(false); }
  }

  async function loginWithGoogle() {
    setBusy(true); setMessage("");
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard`
      });
      if (result.error) throw Error(result.error.message || "Google Login unavailable");
    } catch(e) {
      setMessage(`${e.message}. Check the Google provider keys in the server configuration.`);
      setBusy(false);
    }
  }

  return <main className="auth-wrap">
    <div className="auth-card">
      <Link className="brand" href="/"><HeartHandshake/>WedPlan.</Link>
      <span className="eyebrow">{signup ? "JOIN WEDPLAN" : "WELCOME BACK"}</span>
      <h1>{signup ? "Create Account" : "Sign In"}</h1>
      <p>{signup ? "A beautiful celebration begins with one step." :
        "Sign in to manage your wedding plans."}</p>
      {message && <div className="alert" role="alert">{message}</div>}
      <form onSubmit={onSubmit}>
        {signup && <label className="field"><span className="field-label">Full Name</span>
          <input className="form-input" required value={name}
            onChange={e => setName(e.target.value)} placeholder="Your name"/></label>}
        <label className="field"><span className="field-label">Email Address</span>
          <input className="form-input" type="email" required value={email}
            onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/></label>
        <label className="field"><span className="field-label">Password</span>
          <input className="form-input" type="password" required minLength={6}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters"/></label>
        {signup && <>
          <label className="field"><span className="field-label">Account Role</span>
            <select className="form-select" value={role}
              onChange={e => setRole(e.target.value)}>
              <option value="customer">Customer</option><option value="vendor">Vendor</option>
            </select></label>
          {role === "vendor" && <label className="field">
            <span className="field-label">Business Name</span>
            <input className="form-input" required value={businessName}
              onChange={e => setBusinessName(e.target.value)}/>
          </label>}
        </>}
        <button className="btn btn-primary btn-full" disabled={busy}>
          {busy ? "Please wait..." : signup ? "Create Account" : "Sign In"}
        </button>
      </form>
      <div className="auth-or">or</div>
      <button className="btn btn-outline btn-full" disabled={busy} onClick={loginWithGoogle}>
        Continue with Google
      </button>
      <div className="auth-switch">{signup ? "Already registered? " : "New to WedPlan? "}
        <Link href={signup ? "/sign-in" : "/sign-up"}>{signup ? "Sign In" : "Create Account"}</Link>
      </div>
    </div>
  </main>;
}
