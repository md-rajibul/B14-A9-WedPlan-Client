"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, MapPin, X } from "lucide-react";
import { PageShell } from "@/components/Chrome";
import { authClient } from "@/lib/auth";
import { api, money } from "@/lib/api";

export default function ServiceDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [service, setService] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }
    let active = true;
    Promise.all([
      api(`/api/services/${id}`, {}, true),
      api("/api/me", {}, true)
    ]).then(([s,u]) => {
      if (active) { setService(s); setAccount(u); }
    }).catch(e => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, session?.user?.id, isPending, router]);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setNotice("");
    try {
      await api("/api/bookings", {
        method: "POST", body: JSON.stringify({
          serviceId: id, eventDate: date, eventLocation: location, message
        })
      }, true);
      setNotice("Booking request sent! View status in My Bookings.");
      setModalOpen(false);
    } catch(e) { setNotice(e.message); }
    finally { setBusy(false); }
  }

  return <PageShell><main className="container">
    {loading || isPending ? <div className="section center">Loading service...</div> :
      error ? <div className="section"><div className="alert">{error}</div>
        <Link href="/services" className="btn btn-outline">Browse Services</Link></div>
      : service && <div className="details-grid">
        <div>
          <div className="details-photo" style={{
            backgroundImage: `url("${service.images?.[0] || ""}")`
          }}/>
          <div className="details-thumbs">{service.images?.map((image, i) =>
            <img key={i} src={image} alt={`${service.serviceName} image ${i+1}`}/>)}</div>
          <div className="panel section-small">
            <h2>About This Service</h2><p>{service.description}</p>
          </div>
        </div>
        <aside className="panel">
          <span className="eyebrow">{service.category}</span>
          <h1 style={{fontSize:"2.1rem",margin:"12px 0"}}>{service.serviceName}</h1>
          <p><MapPin size={17} style={{display:"inline"}}/> {service.location}</p>
          <p><strong>Vendor:</strong> {service.vendorName || "WedPlan Vendor"}</p>
          <h2 className="price">{money(service.price)}</h2>
          {notice && <div className={`alert ${notice.includes("sent") ? "ok" : ""}`}>{notice}</div>}
          {account?.role !== "customer" ?
            <p className="muted">Only customer accounts can request a booking.</p> :
            <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
              <Dialog.Trigger asChild>
                <button className="btn btn-primary btn-full"><CalendarDays size={18}/> Request Booking</button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="overlay"/>
                <Dialog.Content className="modal" style={{
                  position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:100
                }}>
                  <div className="modal-title-row">
                    <Dialog.Title>Request a Booking</Dialog.Title>
                    <Dialog.Close asChild><button className="icon-btn" aria-label="Close"><X/></button></Dialog.Close>
                  </div>
                  <Dialog.Description className="muted">
                    Send the vendor details about your event.
                  </Dialog.Description>
                  <form onSubmit={submit}>
                    <label className="field"><span className="field-label">Event Date</span>
                      <input type="date" className="form-input" required
                        min={new Date().toISOString().slice(0,10)}
                        value={date} onChange={e => setDate(e.target.value)}/></label>
                    <label className="field"><span className="field-label">Event Location</span>
                      <input className="form-input" required value={location}
                        onChange={e => setLocation(e.target.value)}/></label>
                    <label className="field"><span className="field-label">Additional Message</span>
                      <textarea className="form-textarea" value={message}
                        onChange={e => setMessage(e.target.value)}/></label>
                    <button className="btn btn-primary btn-full" disabled={busy}>
                      {busy ? "Submitting..." : "Send Booking Request"}</button>
                  </form>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>}
          <Link href="/services" className="btn btn-outline btn-full" style={{marginTop:14}}>
            Back to Services</Link>
        </aside>
      </div>}
  </main></PageShell>;
}
