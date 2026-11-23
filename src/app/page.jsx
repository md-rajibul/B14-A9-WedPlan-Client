"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Heart, CalendarCheck, ShieldCheck, Sparkles } from "lucide-react";
import { PageShell } from "@/components/Chrome";
import { ServiceCard } from "@/components/ServiceCard";
import { api, categories } from "@/lib/api";

const perks = [
  { Icon: ShieldCheck, title: "Trusted Professionals", text: "Choose talented professionals for every meaningful moment." },
  { Icon: CalendarCheck, title: "Simple Booking", text: "Explore and request services without endless phone calls." },
  { Icon: Heart, title: "Personal to You", text: "Create a wedding experience that reflects your story." }
];
export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/api/services").then(s => setServices(s.slice(0, 6)))
      .catch(() => setServices([])).finally(() => setLoading(false));
  }, []);
  return <PageShell>
    <section className="hero">
      <div className="hero-shade"></div>
      <motion.div className="hero-copy container" initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
        <span className="hero-eyebrow">YOUR LOVE STORY BEGINS HERE</span>
        <h1>Plan Your Dream Wedding with WedPlan</h1>
        <p>Discover wonderful wedding services, trusted vendors, and everything you need for your special day.</p>
        <Link className="btn btn-primary btn-large" href="/services">
          Explore Wedding Services <ArrowRight size={18} />
        </Link>
      </motion.div>
    </section>
    <section className="section container">
      <div className="section-title"><span className="eyebrow">WEDDING MARKETPLACE</span>
        <h2>Featured Wedding Services</h2><p>Carefully selected services for your celebration.</p></div>
      {loading ? <p className="center muted">Loading featured services…</p> :
        services.length ? <div className="cards-grid">{services.map(s =>
          <ServiceCard key={s.id} service={s}/>)}</div>
        : <div className="empty">No approved services yet. Use the vendor and admin dashboards to publish services.</div>}
      <div className="center space-top">
        <Link className="btn btn-outline" href="/services">Browse All Services <ArrowRight size={17}/></Link>
      </div>
    </section>
    <section className="section blush">
      <div className="container"><div className="section-title"><span className="eyebrow">EXPLORE BY CATEGORY</span>
        <h2>Everything for Your Wedding</h2></div>
        <div className="category-grid">{categories.map((c, i) =>
          <Link href={`/services?category=${encodeURIComponent(c)}`} key={c} className="category-tile">
            <span className="category-number">0{i+1}</span><h3>{c}</h3><ArrowRight size={18}/></Link>
        )}</div>
      </div>
    </section>
    <section className="section container">
      <div className="section-title"><span className="eyebrow">WHY WEDPLAN</span><h2>More Joy. Less Stress.</h2></div>
      <div className="three-grid">{perks.map(({ Icon, title, text }, i) =>
        <motion.div className="benefit" key={title} initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: i * .1 }}>
          <div className="benefit-icon"><Icon size={27}/></div><h3>{title}</h3><p>{text}</p>
        </motion.div>)}</div>
    </section>
    <section className="section soft">
      <div className="container"><div className="section-title"><span className="eyebrow">HOW IT WORKS</span>
        <h2>Three Steps to Your Dream Day</h2></div>
        <div className="three-grid">{[
          ["01", "Explore Services", "Find photographers, venues, florists, caterers and more."],
          ["02", "Request a Booking", "Send details about your event to the vendor you love."],
          ["03", "Celebrate", "Manage your requests in your personal dashboard."]
        ].map(([n, title, text]) => <div className="step-card" key={n}>
          <span>{n}</span><h3>{title}</h3><p>{text}</p></div>)}</div>
      </div>
    </section>
    <section className="cta-section"><div className="container cta-inner">
      <Sparkles size={28}/><h2>Your wedding story starts here.</h2>
      <Link href="/sign-up" className="btn btn-light">Join WedPlan <ArrowRight size={18}/></Link>
    </div></section>
  </PageShell>;
}
