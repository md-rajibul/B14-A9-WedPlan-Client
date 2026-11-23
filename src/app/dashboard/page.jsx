"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/Chrome";
import { authClient } from "@/lib/auth";
import { api, categories, money } from "@/lib/api";

const menus = {
  customer: ["Overview", "My Bookings", "Profile Settings"],
  vendor: ["Overview", "My Services", "Add Service", "Booking Requests", "Subscription", "Profile Settings"],
  admin: ["Overview", "Manage Users", "Manage Services", "Transactions"]
};
const emptyService = {
  serviceName: "", category: categories[0], description: "",
  price: "", location: "", images: []
};
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
const status = (s) => <span className={`tag ${s}`}>{s || "-"}</span>;

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("Overview");
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [role, setRole] = useState("customer");
  const [businessName, setBusinessName] = useState("");
  const [form, setForm] = useState(emptyService);
  const [editingId, setEditingId] = useState(null);
  const [profile, setProfile] = useState({ name:"", businessName:"", image:"" });
  const [adminSearch, setAdminSearch] = useState("");
  const [adminRoleFilter, setAdminRoleFilter] = useState("");

  const loadUser = useCallback(async () => {
    const result = await api("/api/me", {}, true);
    setUser(result);
    setProfile({
      name: result.name || "",
      businessName: result.businessName || "",
      image: result.image || ""
    });
    return result;
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) { router.replace("/sign-in"); return; }
    let cancelled = false;
    loadUser().catch(e => { if (!cancelled) setNotice(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [session?.user?.id, isPending, router, loadUser]);

  const refreshData = useCallback(async (u, selected) => {
    if (!u?.roleSelected && u?.role !== "admin") return;
    let path = "";
    if (selected === "Overview") path = `/api/${u.role}/overview`;
    else if (u.role === "customer" && selected === "My Bookings") path = "/api/customer/bookings";
    else if (u.role === "vendor" && selected === "My Services") path = "/api/vendor/services";
    else if (u.role === "vendor" && selected === "Booking Requests") path = "/api/vendor/bookings";
    else if (u.role === "admin" && selected === "Manage Users") path = "/api/admin/users";
    else if (u.role === "admin" && selected === "Manage Services") path = "/api/admin/services";
    else if (u.role === "admin" && selected === "Transactions") path = "/api/admin/transactions";
    if (!path) { setData(null); return; }
    try { setData(await api(path, {}, true)); }
    catch(e) { setData(null); setNotice(e.message); }
  }, []);

  useEffect(() => {
    if (user && user.roleSelected) {
      setData(null);
      refreshData(user, page);
    } else if (user?.role === "admin") {
      refreshData(user, page);
    }
  }, [user?.id, user?.role, user?.roleSelected, page, refreshData]);

  async function perform(fn, success="Updated successfully.") {
    setBusy(true); setNotice("");
    try {
      await fn();
      const latest = await loadUser();
      await refreshData(latest, page);
      setNotice(success);
    } catch(e) { setNotice(e.message); }
    finally { setBusy(false); }
  }

  async function uploadImage(file) {
    if (!file) throw Error("Please choose an image");
    const body = new FormData();
    body.append("image", file);
    return await api("/api/upload", { method: "POST", body }, true);
  }

  async function chooseRole(e) {
    e.preventDefault();
    await perform(async () => {
      await api("/api/profile/role", {
        method:"POST", body: JSON.stringify({ role, businessName })
      }, true);
      setPage("Overview");
    }, "Your account role has been saved.");
  }

  async function saveService(e) {
    e.preventDefault();
    await perform(async () => {
      const payload = {
        ...form, price:Number(form.price), images:form.images
      };
      await api(editingId ? `/api/services/${editingId}` : "/api/services", {
        method:editingId ? "PATCH" : "POST", body:JSON.stringify(payload)
      }, true);
      setForm(emptyService);
      setEditingId(null);
      setPage("My Services");
    }, "Service submitted for admin review.");
  }

  function editService(s) {
    setForm({
      serviceName:s.serviceName, category:s.category, description:s.description,
      price:s.price, location:s.location, images:s.images || []
    });
    setEditingId(s.id);
    setPage("Add Service");
    setNotice("Editing a service will return it to pending approval.");
  }

  async function changeBooking(id, act, kind) {
    await perform(() => api(
      kind === "customer" ? `/api/customer/bookings/${id}/cancel`
        : `/api/vendor/bookings/${id}/decision`,
      { method:"PATCH", ...(kind === "vendor"
        ? {body:JSON.stringify({status:act})} : {}) },
      true
    ), "Booking status updated.");
  }

  function renderOverview() {
    if (!data || Array.isArray(data)) return <p className="muted">Loading statistics...</p>;
    const labels = user.role === "customer" ? [
      ["Total Requests", data.totalBookings], ["Pending", data.pendingBookings],
      ["Accepted", data.acceptedBookings], ["Rejected", data.rejectedBookings]
    ] : user.role === "vendor" ? [
      ["Total Services", data.totalServices], ["Active Services", data.activeServices],
      ["Pending Requests", data.pendingBookings], ["Accepted Bookings", data.acceptedBookings]
    ] : [
      ["Total Users", data.totalUsers], ["Vendors", data.totalVendors],
      ["Customers", data.totalCustomers], ["Services", data.totalServices],
      ["Pending Services", data.pendingServices], ["Transactions", data.totalTransactions]
    ];
    return <>
      <div className="stat-grid">{labels.map(([title,value]) =>
        <div className="stat" key={title}><strong>{value ?? 0}</strong><span>{title}</span></div>)}</div>
      {user.role === "vendor" && <div className="panel">
        <strong>Current Plan:</strong> {cap(data.subscriptionPlan)}
        <p className="muted">Free vendors can have up to 3 approved, active services.</p>
      </div>}
      {user.role === "customer" && <div className="panel">
        <h3>Discover wedding services</h3>
        <p>Find beautiful venues, photography, decoration, catering and more.</p>
        <Link href="/services" className="btn btn-primary">Browse Services</Link>
      </div>}
    </>;
  }

  function renderCustomerBookings() {
    return <div className="table-wrap"><table><thead><tr>
      <th>Service</th><th>Vendor</th><th>Event</th><th>Status</th><th>Action</th>
    </tr></thead><tbody>
      {Array.isArray(data) && data.length ? data.map(b => <tr key={b.id}>
        <td>{b.serviceName}</td><td>{b.vendorName}</td>
        <td>{b.eventDate}<div className="small muted">{b.eventLocation}</div></td>
        <td>{status(b.status)}</td><td>
          {b.status === "pending" ?
            <button className="btn btn-danger btn-small" disabled={busy}
              onClick={() => changeBooking(b.id,"cancel","customer")}>Cancel</button> : "—"}
        </td>
      </tr>) : <tr><td colSpan={5}>No booking requests yet.</td></tr>}
    </tbody></table></div>;
  }

  function renderVendorBookings() {
    return <div className="table-wrap"><table><thead><tr>
      <th>Service</th><th>Customer</th><th>Event</th><th>Message</th><th>Status</th><th>Actions</th>
    </tr></thead><tbody>
      {Array.isArray(data) && data.length ? data.map(b => <tr key={b.id}>
        <td>{b.serviceName}</td><td>{b.customerName}<div className="small muted">{b.customerEmail}</div></td>
        <td>{b.eventDate}<div className="small muted">{b.eventLocation}</div></td>
        <td>{b.message || "—"}</td><td>{status(b.status)}</td>
        <td><div className="table-actions">{b.status === "pending" ? <>
          <button className="btn btn-primary btn-small" disabled={busy}
            onClick={() => changeBooking(b.id,"accepted","vendor")}>Accept</button>
          <button className="btn btn-danger btn-small" disabled={busy}
            onClick={() => changeBooking(b.id,"rejected","vendor")}>Reject</button>
        </> : "—"}</div></td>
      </tr>) : <tr><td colSpan={6}>No booking requests yet.</td></tr>}
    </tbody></table></div>;
  }

  function renderVendorServices() {
    return <><button className="btn btn-primary" onClick={() => {
      setForm(emptyService);setEditingId(null);setPage("Add Service");
    }}>Add New Service</button><div className="table-wrap space-top"><table>
      <thead><tr><th>Service</th><th>Price</th><th>Approval</th><th>Availability</th><th>Actions</th></tr></thead>
      <tbody>{Array.isArray(data) && data.length ? data.map(s => <tr key={s.id}>
        <td>{s.serviceName}<div className="small muted">{s.category}</div></td>
        <td>{money(s.price)}</td><td>{status(s.status)}</td>
        <td>{s.isActive ? "Active" : "Paused"}</td>
        <td><div className="table-actions">
          <button className="btn btn-outline btn-small" onClick={() => editService(s)}>Edit</button>
          <button className="btn btn-secondary btn-small" disabled={busy}
            onClick={() => perform(() => api(`/api/services/${s.id}/availability`, {
              method:"PATCH",body:JSON.stringify({isActive:!s.isActive})
            },true))}>{s.isActive ? "Pause" : "Activate"}</button>
          <button className="btn btn-danger btn-small" disabled={busy}
            onClick={() => {
              if (window.confirm("Delete this service?")) perform(() =>
                api(`/api/services/${s.id}`, { method:"DELETE" },true));
            }}>Delete</button>
        </div></td>
      </tr>) : <tr><td colSpan={5}>No services. Add your first service.</td></tr>}</tbody>
    </table></div></>;
  }

  function renderAddService() {
    return <div className="panel">
      <h2>{editingId ? "Update Service" : "Add Wedding Service"}</h2>
      <p className="muted">All new and updated services need admin approval.</p>
      <form onSubmit={saveService}>
        <div className="form-grid">
          <label className="field"><span className="field-label">Service Name</span>
            <input required className="form-input" value={form.serviceName}
              onChange={e => setForm({...form,serviceName:e.target.value})}/></label>
          <label className="field"><span className="field-label">Category</span>
            <select className="form-select" value={form.category}
              onChange={e => setForm({...form,category:e.target.value})}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select></label>
          <label className="field"><span className="field-label">Price (BDT)</span>
            <input required type="number" min="1" className="form-input"
              value={form.price} onChange={e => setForm({...form,price:e.target.value})}/></label>
          <label className="field"><span className="field-label">Location</span>
            <input required className="form-input" value={form.location}
              onChange={e => setForm({...form,location:e.target.value})}/></label>
          <label className="field wide"><span className="field-label">Description (at least 10 characters)</span>
            <textarea required minLength={10} className="form-textarea" value={form.description}
              onChange={e => setForm({...form,description:e.target.value})}/></label>
          <label className="field wide"><span className="field-label">Service Image (upload a file)</span>
            <input className="form-input" type="file" accept="image/png,image/jpeg,image/webp"
              disabled={busy} onChange={async e => {
                if (!e.target.files?.[0]) return;
                setBusy(true);setNotice("");
                try {
                  const result = await uploadImage(e.target.files[0]);
                  setForm(f => ({...f,images:[...f.images,result.url].slice(0,6)}));
                  setNotice("Image uploaded successfully.");
                } catch(error) { setNotice(error.message); }
                finally { setBusy(false); }
              }}/>
            <div className="small muted">{form.images.length} image(s) uploaded. Maximum 6.</div>
            {form.images.length ? <div className="details-thumbs">
              {form.images.map((image,i) => <button type="button" key={image}
                title="Remove image" onClick={() => setForm(f => ({
                  ...f,images:f.images.filter((_,index) => index !== i)
                }))}><img src={image} alt={`Uploaded ${i+1}`}/></button>)}</div> : null}
          </label>
        </div>
        <div className="form-actions"><button disabled={busy || !form.images.length}
          className="btn btn-primary">{busy ? "Saving..." : editingId ? "Update Service" : "Submit Service"}</button>
          <button className="btn btn-outline" type="button"
            onClick={() => {setEditingId(null);setForm(emptyService);setPage("My Services");}}>Cancel</button>
        </div>
      </form>
    </div>;
  }

  function renderSubscription() {
    return <div className="three-grid">
      <div className="panel"><h2>Free Plan</h2><h3>৳0</h3>
        <p>Up to 3 approved active services, booking management and vendor dashboard.</p>
        <span className="tag">{user.subscriptionPlan === "free" ? "Current Plan" : "Available"}</span></div>
      <div className="panel"><h2>Premium Plan</h2><h3>Stripe Test Subscription</h3>
        <p>Unlimited active services, premium recognition and everything in Free.</p>
        {user.subscriptionPlan === "premium" ?
          <span className="tag accepted">Premium Active</span> :
          <button className="btn btn-primary" disabled={busy}
            onClick={() => perform(async () => {
              const result = await api("/api/stripe/checkout",{method:"POST"},true);
              window.location.assign(result.url);
            }, "Redirecting to Stripe")}>Upgrade to Premium</button>}
      </div></div>;
  }

  function renderProfile() {
    return <div className="panel" style={{maxWidth:640}}>
      <div className="profile-summary"><img className="avatar"
        src={profile.image || "https://placehold.co/90x90/eedfe3/92415b?text=WP"}
        alt="Profile"/><div><h3 style={{margin:0}}>{user.name}</h3>
          <p className="muted" style={{margin:0}}>{user.email}</p></div></div>
      <form style={{marginTop:20}} onSubmit={e => {
        e.preventDefault();
        perform(() => api("/api/profile",{
          method:"PATCH",body:JSON.stringify(profile)
        },true), "Profile saved");
      }}>
        <label className="field"><span className="field-label">Name</span>
          <input className="form-input" required value={profile.name}
            onChange={e => setProfile({...profile,name:e.target.value})}/></label>
        {user.role === "vendor" && <label className="field">
          <span className="field-label">Business Name</span>
          <input className="form-input" value={profile.businessName}
            onChange={e => setProfile({...profile,businessName:e.target.value})}/></label>}
        <label className="field"><span className="field-label">Profile Image</span>
          <input type="file" accept="image/png,image/jpeg,image/webp" className="form-input"
            onChange={async e => {
              if (!e.target.files?.[0]) return;
              setBusy(true);
              try {
                const uploaded = await uploadImage(e.target.files[0]);
                setProfile(p => ({...p,image:uploaded.url}));
                setNotice("Image uploaded. Click Save Profile.");
              } catch(error) {setNotice(error.message);}
              finally {setBusy(false);}
            }}/>
        </label>
        <button className="btn btn-primary" disabled={busy}>Save Profile</button>
      </form>
    </div>;
  }

  function renderAdminUsers() {
    return <>
      <div className="filters" style={{gridTemplateColumns:"2fr 1fr auto"}}>
        <input className="form-input" value={adminSearch} placeholder="Search name or email"
          onChange={e => setAdminSearch(e.target.value)}/>
        <select className="form-select" value={adminRoleFilter} onChange={e => setAdminRoleFilter(e.target.value)}>
          <option value="">All roles</option><option value="customer">Customer</option>
          <option value="vendor">Vendor</option><option value="admin">Admin</option>
        </select>
        <button className="btn btn-outline" onClick={async () => {
          const qs = new URLSearchParams();
          if (adminSearch) qs.set("search",adminSearch);
          if (adminRoleFilter) qs.set("role",adminRoleFilter);
          setData(await api(`/api/admin/users?${qs}`, {},true));
        }}>Search</button>
      </div>
      <div className="table-wrap"><table><thead><tr>
        <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th>
      </tr></thead><tbody>{Array.isArray(data) && data.length ? data.map(u =>
        <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{status(u.role)}</td>
          <td>{u.isBlocked ? status("blocked") : status("active")}</td>
          <td>{u.role === "admin" ? "—" : <button className="btn btn-small btn-outline"
            disabled={busy} onClick={() => perform(() =>
              api(`/api/admin/users/${u.id}/block`,{
                method:"PATCH",body:JSON.stringify({isBlocked:!u.isBlocked})
              },true))}>{u.isBlocked ? "Unblock" : "Block"}</button>}</td></tr>
      ) : <tr><td colSpan={5}>No users found.</td></tr>}</tbody></table></div>
    </>;
  }

  function renderAdminServices() {
    return <div className="table-wrap"><table><thead><tr>
      <th>Service</th><th>Vendor</th><th>Price</th><th>Approval</th><th>Availability</th><th>Actions</th>
    </tr></thead><tbody>{Array.isArray(data) && data.length ? data.map(s =>
      <tr key={s.id}><td>{s.serviceName}</td><td>{s.vendorName}</td>
        <td>{money(s.price)}</td><td>{status(s.status)}</td>
        <td>{s.isActive ? "Active" : "Paused"}</td>
        <td><div className="table-actions">
          {s.status !== "approved" && <button className="btn btn-primary btn-small" disabled={busy}
            onClick={() => perform(() => api(`/api/admin/services/${s.id}/review`, {
              method:"PATCH",body:JSON.stringify({status:"approved"})
            },true))}>Approve</button>}
          {s.status !== "rejected" && <button className="btn btn-danger btn-small" disabled={busy}
            onClick={() => perform(() => api(`/api/admin/services/${s.id}/review`, {
              method:"PATCH",body:JSON.stringify({status:"rejected"})
            },true))}>Reject</button>}
          <button className="btn btn-secondary btn-small" disabled={busy}
            onClick={() => perform(() => api(`/api/admin/services/${s.id}/status`,{
              method:"PATCH",body:JSON.stringify({isActive:!s.isActive})
            },true))}>{s.isActive ? "Pause" : "Activate"}</button>
          <button className="btn btn-outline btn-small" disabled={busy}
            onClick={() => {
              if (window.confirm("Delete this service?"))
                perform(() => api(`/api/services/${s.id}`,{method:"DELETE"},true));
            }}>Delete</button>
        </div></td>
      </tr>) : <tr><td colSpan={6}>No services found.</td></tr>}</tbody></table></div>;
  }

  function renderTransactions() {
    return <div className="table-wrap"><table><thead><tr>
      <th>Vendor</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th>
    </tr></thead><tbody>{Array.isArray(data) && data.length ? data.map(t =>
      <tr key={t.id}><td>{t.vendorId}</td><td>{t.plan}</td>
        <td>{(Number(t.amount || 0)/100).toFixed(2)} {String(t.currency || "").toUpperCase()}</td>
        <td>{status(t.status)}</td><td>{new Date(t.createdAt).toLocaleDateString()}</td></tr>
    ) : <tr><td colSpan={5}>No transactions yet.</td></tr>}</tbody></table></div>;
  }

  if (isPending || loading) return <PageShell><main className="section container">
    <p>Loading your dashboard...</p></main></PageShell>;

  if (!user) return <PageShell><main className="section container">
    <div className="alert">{notice || "Please sign in."}</div>
    <Link href="/sign-in" className="btn btn-primary">Sign In</Link></main></PageShell>;

  if (!user.roleSelected && user.role !== "admin") return <PageShell>
    <main className="section container" style={{maxWidth:660}}>
      <div className="panel"><h1 style={{fontSize:"2rem"}}>Choose Your Account Role</h1>
        <p>Select once to start using WedPlan. Admin access is granted separately.</p>
        {notice && <div role="alert" className="alert">{notice}</div>}
        <form onSubmit={chooseRole}>
          <label className="field"><span className="field-label">Role</span>
            <select className="form-select" value={role}
              onChange={e => setRole(e.target.value)}>
              <option value="customer">Customer</option><option value="vendor">Vendor</option>
            </select></label>
          {role === "vendor" && <label className="field">
            <span className="field-label">Business Name</span>
            <input className="form-input" required value={businessName}
              onChange={e => setBusinessName(e.target.value)}/></label>}
          <button className="btn btn-primary" disabled={busy}>Save Role</button>
        </form>
      </div>
    </main></PageShell>;

  let contents;
  if (page === "Overview") contents = renderOverview();
  else if (page === "My Bookings") contents = renderCustomerBookings();
  else if (page === "My Services") contents = renderVendorServices();
  else if (page === "Add Service") contents = renderAddService();
  else if (page === "Booking Requests") contents = renderVendorBookings();
  else if (page === "Subscription") contents = renderSubscription();
  else if (page === "Profile Settings") contents = renderProfile();
  else if (page === "Manage Users") contents = renderAdminUsers();
  else if (page === "Manage Services") contents = renderAdminServices();
  else if (page === "Transactions") contents = renderTransactions();

  return <PageShell><div className="container sidebar-layout">
    <aside className="sidebar" aria-label="Dashboard navigation">
      {menus[user.role]?.map(item => <button key={item}
        className={page === item ? "active" : ""} onClick={() => {
          setNotice(""); setPage(item);
          if (item === "Add Service") {setForm(emptyService);setEditingId(null);}
        }}>{item}</button>)}
    </aside>
    <main className="dashboard-main">
      <div className="dash-header">
        <div><span className="eyebrow">{cap(user.role)} Dashboard</span>
          <h1>{page}</h1></div>
        <div className="profile-summary">
          <img className="avatar" src={user.image ||
            "https://placehold.co/90x90/f8e5e9/9b2b4e?text=W"} alt="Profile"/>
          <div><strong>{user.name}</strong><div className="small muted">{cap(user.role)}</div></div>
        </div>
      </div>
      {notice && <div className={`alert ${/success|saved|sent|submitted|updated/i.test(notice) ? "ok" : ""}`}
        role="status">{notice}</div>}
      {contents}
    </main>
  </div></PageShell>;
}
