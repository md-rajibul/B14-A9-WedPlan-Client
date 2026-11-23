"use client";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { money } from "@/lib/api";

export function ServiceCard({ service }) {
  return <article className="service-card">
    <div className="card-image" style={{ backgroundImage: `url("${service.images?.[0] || ""}")` }}
      role="img" aria-label={service.serviceName} />
    <div className="card-content">
      <span className="eyebrow">{service.category}</span>
      <h3>{service.serviceName}</h3>
      <p className="muted"><MapPin size={16} /> {service.location}</p>
      <p className="muted small">{service.vendorName || "WedPlan Vendor"}</p>
      <div className="card-bottom"><strong className="price">{money(service.price)}</strong>
        <Link className="btn btn-primary btn-small" href={`/services/${service.id}`}>View Details</Link>
      </div>
    </div>
  </article>;
}
