"use client";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/Chrome";
import { ServiceCard } from "@/components/ServiceCard";
import { api, categories } from "@/lib/api";

export default function BrowseServices() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get("category") || "";
    if (categories.includes(cat)) setCategory(cat);
  }, []);
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true); setError("");
      const q = new URLSearchParams();
      if (search.trim()) q.set("search", search.trim());
      if (category) q.set("category", category);
      if (location.trim()) q.set("location", location.trim());
      if (sort) q.set("sort", sort);
      try { setItems(await api(`/api/services?${q}`)); }
      catch(e) { setItems([]); setError(e.message); }
      finally { setLoading(false); }
    }, 220);
    return () => clearTimeout(timer);
  }, [search, category, location, sort]);

  return <PageShell>
    <section className="page-banner"><div className="container">
      <span className="eyebrow">WEDDING MARKETPLACE</span><h1>Browse Wedding Services</h1>
      <p>Search, compare and discover the right professionals for your celebration.</p>
    </div></section>
    <section className="section container">
      <div className="filters">
        <input className="form-input" aria-label="Search by name"
          placeholder="Search service name..." value={search}
          onChange={e => setSearch(e.target.value)}/>
        <select aria-label="Category" className="form-select" value={category}
          onChange={e => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <input className="form-input" aria-label="Location" placeholder="Location"
          value={location} onChange={e => setLocation(e.target.value)}/>
        <select className="form-select" aria-label="Sort by price" value={sort}
          onChange={e => setSort(e.target.value)}>
          <option value="">Newest first</option><option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
        <button className="btn btn-outline" onClick={() => {
          setSearch(""); setLocation(""); setCategory(""); setSort("");
        }}>Reset</button>
      </div>
      {error && <div className="alert">{error}</div>}
      {loading ? <p className="center muted">Loading services...</p> :
        items.length ? <div className="cards-grid">
          {items.map(service => <ServiceCard key={service.id} service={service}/>)}
        </div> : <div className="empty">No services found. Try different search or filters.</div>}
    </section>
  </PageShell>;
}
