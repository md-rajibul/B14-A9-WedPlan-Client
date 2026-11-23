"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, HeartHandshake } from "lucide-react";
import { authClient } from "@/lib/auth";

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const close = () => setExpanded(false);
  async function logout() {
    await authClient.signOut();
    close();
    router.push("/");
    router.refresh();
  }
  return <header className="site-header">
    <div className="container navbar">
      <Link href="/" className="brand" onClick={close}>
        <HeartHandshake size={26}/> WedPlan<span>.</span>
      </Link>
      <button type="button" className="menu-toggle" aria-label="Toggle menu"
        onClick={() => setExpanded(!expanded)}>{expanded ? <X/> : <Menu/>}</button>
      <nav className={`nav-links ${expanded ? "expanded" : ""}`}>
        <Link href="/" onClick={close}>Home</Link>
        <Link href="/services" onClick={close}>Browse Services</Link>
        {session?.user ? <>
          <Link href="/dashboard" onClick={close}>Dashboard</Link>
          <span className="nav-user">{session.user.name}</span>
          <button className="btn btn-outline btn-small" onClick={logout}>Logout</button>
        </> : !isPending ? <>
          <Link href="/sign-in" onClick={close}>Sign In</Link>
          <Link href="/sign-up" onClick={close} className="btn btn-primary btn-small">Sign Up</Link>
        </> : null}
      </nav>
    </div>
  </header>;
}
export function Footer() {
  return <footer className="site-footer" id="contact">
    <div className="container footer-grid">
      <div><h2>WedPlan.</h2><p>Thoughtful wedding planning, all in one place.</p></div>
      <div><h4>Explore</h4><Link href="/">Home</Link><Link href="/services">Services</Link></div>
      <div><h4>Contact</h4><span>Dhaka, Bangladesh</span><span>hello@wedplan.example</span></div>
      <div><h4>Social</h4><a href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook</a>
        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a></div>
    </div>
    <div className="container copyright">© 2026 WedPlan. All rights reserved.</div>
  </footer>;
}
export function PageShell({ children }) {
  return <><Navbar/>{children}<Footer/></>;
}
