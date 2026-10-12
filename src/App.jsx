import { useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowUpRight, Ban, Building2, CheckCircle2, ChevronRight,
  ClipboardCheck, ClipboardList, Clock3, Leaf, PackageOpen, Pencil,
  Plus, Search, Settings, ShieldCheck, Store, Truck, UsersRound, X,
} from 'lucide-react';
import { initialReservations, matchingPolicy, organizations, receiverRequirements, seededDonations } from './data';
import { getDonationRecommendations } from './matching';

const roles = [
  { id: 'supplier', label: 'Supplier', icon: Store },
  { id: 'receiver', label: 'Receiver', icon: Building2 },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
];

const navItems = (role) => [
  { id: 'overview', label: 'Overview', icon: ClipboardList },
  { id: 'listings', label: role === 'supplier' ? 'Donations' : role === 'receiver' ? 'Available food' : 'Listings', icon: PackageOpen },
  { id: 'pickups', label: 'Pickups', icon: Truck },
  { id: 'organizations', label: 'Organizations', icon: UsersRound },
  { id: role === 'admin' ? 'controls' : 'profile', label: role === 'admin' ? 'Controls' : 'Profile', icon: role === 'admin' ? Settings : Building2 },
];

const receiver = organizations.find((org) => org.id === 'org-4');
const supplier = organizations.find((org) => org.id === 'org-1');
const getOrg = (id) => organizations.find((org) => org.id === id);
const apiUrl = 'http://127.0.0.1:5000/api';

function Stat({ label, value, detail, icon: Icon, accent = 'green' }) {
  return <section className={`stat-card ${accent}`}><div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div><div className="stat-icon"><Icon size={20} /></div></section>;
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: 'receiver@foodconnect.demo', password: 'demo123', organizationName: '', organizationType: 'Community kitchen', address: '', role: 'receiver', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (key, value) => setForm({ ...form, [key]: value });
  async function submit(event) {
    event.preventDefault(); setError(''); setMessage(''); setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : mode === 'register' ? '/auth/register' : '/auth/reset-password';
      const body = mode === 'login' ? { email: form.email, password: form.password } : mode === 'register' ? form : { email: form.email, newPassword: form.newPassword };
      const response = await fetch(`${apiUrl}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to complete your request.');
      if (mode === 'reset') { setMessage(data.message); setMode('login'); return; }
      onAuthenticated(data);
    } catch (requestError) { setError(requestError.message || 'The local API is unavailable. Start it with npm run server.'); } finally { setLoading(false); }
  }
  return <main className="auth-page"><section className="auth-intro"><div className="brand"><div className="brand-mark"><Leaf size={22} /></div><span>FoodConnect</span></div><div><p className="eyebrow">HYDERABAD FOOD REDISTRIBUTION</p><h1>Good food deserves a second destination.</h1><p>Coordinate local surplus-food pickups with verified community organizations.</p></div><div className="demo-accounts"><b>Demo accounts</b><span>Supplier: supplier@foodconnect.demo</span><span>Receiver: receiver@foodconnect.demo</span><span>Admin: admin@foodconnect.demo</span><small>Password: demo123</small></div></section><section className="auth-card"><div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log in</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button></div><h2>{mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create an organization account' : 'Reset password'}</h2><p>{mode === 'login' ? 'Use a seeded demo account or create a new pending organization.' : mode === 'register' ? 'New organizations begin pending verification.' : 'Demo password reset is available locally.'}</p><form onSubmit={submit} className="auth-form">{mode === 'register' && <><label>Contact name<input required value={form.name} onChange={(event) => set('name', event.target.value)} /></label><label>Organization name<input required value={form.organizationName} onChange={(event) => set('organizationName', event.target.value)} /></label><label>Organization type<input required value={form.organizationType} onChange={(event) => set('organizationType', event.target.value)} /></label><label>Address and location<input required value={form.address} onChange={(event) => set('address', event.target.value)} /></label><label>Account type<select value={form.role} onChange={(event) => set('role', event.target.value)}><option value="receiver">Receiver</option><option value="supplier">Supplier</option></select></label></>}<label>Email<input required type="email" value={form.email} onChange={(event) => set('email', event.target.value)} /></label>{mode !== 'reset' && <label>Password<input required type="password" minLength="6" value={form.password} onChange={(event) => set('password', event.target.value)} /></label>}{mode === 'reset' && <label>New password<input required type="password" minLength="6" value={form.newPassword} onChange={(event) => set('newPassword', event.target.value)} /></label>}{error && <div className="auth-error">{error}</div>}{message && <div className="auth-success">{message}</div>}<button className="primary-action auth-submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Log in' : mode === 'register' ? 'Register organization' : 'Reset password'}</button></form>{mode !== 'register' && <button className="auth-link" onClick={() => setMode(mode === 'reset' ? 'login' : 'reset')}>{mode === 'reset' ? 'Back to log in' : 'Forgot password?'}</button>}</section></main>;
}

function App() {
  const [auth, setAuth] = useState(null);
  const [role, setRole] = useState('receiver');
  const [view, setView] = useState('overview');
  const [donations, setDonations] = useState(seededDonations);
  const [reservations, setReservations] = useState(initialReservations);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const [editor, setEditor] = useState(null);
  const [orgStatuses, setOrgStatuses] = useState(() => Object.fromEntries(organizations.map((org) => [org.id, 'Verified'])));
  const [profiles, setProfiles] = useState({
    supplier: { name: supplier.name, type: 'Restaurant', address: 'Road No. 12, Banjara Hills, Hyderabad', contact: 'Farah Khan', phone: '+91 98765 30112', hours: '10:00 AM - 10:00 PM', verification: 'Verified' },
    receiver: { name: receiver.name, type: 'Community kitchen', address: 'Jubilee Hills, Hyderabad', contact: 'Asha Reddy', phone: '+91 98765 30144', hours: '8:00 AM - 8:00 PM', categories: 'Cooked meals, Packed meals, Fresh produce', demand: '45 meals daily', capacity: '60 meals; 20 packs; 10 trays', people: '70 people served daily', dietary: 'Vegetarian preferred; no pork', storage: 'Refrigerator and dry storage', window: '10:00 AM - 7:00 PM' },
  });
  const [audit, setAudit] = useState(['Admin verified all six seeded organizations.', 'Asha Community Kitchen reserved 12 meals from Nizam Kitchen.']);

  const displayed = useMemo(() => donations.filter((donation) => `${donation.title} ${donation.category} ${donation.area}`.toLowerCase().includes(query.toLowerCase())), [donations, query]);
  const supplierDonations = donations.filter((donation) => donation.supplierId === supplier.id);
  const receiverReservations = reservations.filter((reservation) => reservation.receiverId === receiver.id);
  const supplierReservations = reservations.filter((reservation) => donations.find((donation) => donation.id === reservation.donationId)?.supplierId === supplier.id);

  if (!auth) return <AuthScreen onAuthenticated={(session) => { setAuth(session); setRole(session.user.role); }} />;

  function maxReservable(donation) {
    const capacityByUnit = { meals: 60, packs: 20, trays: 10, kg: 15 };
    const alreadyReserved = receiverReservations.filter((item) => item.unit === donation.unit && item.status !== 'Collected').reduce((total, item) => total + item.quantity, 0);
    return Math.max(0, Math.min(donation.available, (capacityByUnit[donation.unit] || 10) - alreadyReserved));
  }

  function changeRole(nextRole) {
    setRole(nextRole);
    setView('overview');
    setQuery('');
  }

  function reserve(donation, requestedQuantity, receiverId = receiver.id) {
    if (!donation.available) return;
    const maximum = receiverId === receiver.id ? maxReservable(donation) : donation.available;
    const amount = Number(requestedQuantity);
    if (!Number.isInteger(amount) || amount < 1 || amount > maximum) { setNotice(`Enter a quantity from 1 to ${maximum} ${donation.unit}.`); return; }
    setDonations((items) => items.map((item) => item.id === donation.id ? { ...item, available: item.available - amount, status: item.available - amount === 0 ? 'Fully reserved' : 'Partly reserved' } : item));
    setReservations((items) => [...items, { id: `res-${Date.now()}`, donationId: donation.id, receiverId, quantity: amount, unit: donation.unit, status: 'Ready for pickup', createdAt: 'Just now' }]);
    setNotice(`${amount} ${donation.unit} reserved from ${donation.title} for ${getOrg(receiverId).name}.`);
    setAudit((items) => [`${getOrg(receiverId).name} reserved ${amount} ${donation.unit} from ${donation.title}.`, ...items]);
    setSelected(null);
  }

  function markCollected(id) {
    setReservations((items) => items.map((item) => item.id === id ? { ...item, status: 'Collected' } : item));
    setNotice('Pickup marked as collected.');
    setAudit((items) => ['Receiver confirmed a pickup as collected.', ...items]);
  }

  function confirmHandover(id) {
    setReservations((items) => items.map((item) => item.id === id ? { ...item, status: 'Handover confirmed' } : item));
    setNotice('Handover confirmed and recorded in the pickup history.');
    setAudit((items) => ['Supplier confirmed food handover for a pickup.', ...items]);
  }

  function reportIssue(id) {
    const reservation = reservations.find((item) => item.id === id);
    if (!reservation) return;
    setReservations((items) => items.map((item) => item.id === id ? { ...item, status: 'Disputed' } : item));
    setNotice('Discrepancy reported for admin review.');
    setAudit((items) => ['Receiver reported a pickup discrepancy for admin review.', ...items]);
  }

  function saveDonation(values) {
    if (editor?.id) {
      setDonations((items) => items.map((item) => item.id === editor.id ? { ...item, ...values } : item));
      setNotice('Donation listing updated.');
      setAudit((items) => [`Supplier updated ${values.title}.`, ...items]);
    } else {
      const entry = { ...values, id: `don-${Date.now()}`, supplierId: supplier.id, available: Number(values.quantity), status: 'Available', distance: 0, area: supplier.area };
      setDonations((items) => [entry, ...items]);
      setNotice('New donation listing published.');
      setAudit((items) => [`Supplier published ${values.title}.`, ...items]);
    }
    setEditor(null);
  }

  function cancelDonation(id) {
    const donation = donations.find((item) => item.id === id);
    if (!donation || donation.available === 0) { setNotice('A fully reserved listing cannot be cancelled in this demo.'); return; }
    setDonations((items) => items.map((item) => item.id === id ? { ...item, available: 0, status: 'Cancelled' } : item));
    setNotice('Unreserved donation listing cancelled.');
    setAudit((items) => [`Supplier cancelled ${donation.title}.`, ...items]);
  }

  function updateOrgStatus(id, status) {
    setOrgStatuses((items) => ({ ...items, [id]: status }));
    setAudit((items) => [`Admin set ${getOrg(id).name} to ${status}.`, ...items]);
    setNotice(`${getOrg(id).name} is now ${status.toLowerCase()}.`);
  }

  const title = getTitle(role, view);
  const nav = navItems(role);
  const showPickupPanel = role === 'receiver' && view !== 'pickups' && receiverReservations.some((reservation) => reservation.status !== 'Collected');

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Leaf size={22} /></div><span>FoodConnect</span></div>
      <nav className="side-nav">{nav.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => setView(id)}><Icon size={19} />{label}</button>)}</nav>
      <div className="sidebar-footer"><div className="demo-label">DEMO MODE</div><p>Hyderabad, India</p><span>Seeded local data</span></div>
    </aside>
    <main>
      <header className="topbar"><div className="mobile-brand"><Leaf size={18} /> FoodConnect</div><div className="role-switcher" aria-label="Demo role switcher">{roles.map(({ id, label, icon: Icon }) => <button key={id} className={role === id ? 'selected' : ''} onClick={() => changeRole(id)}><Icon size={15} />{label}</button>)}</div><button className="profile-chip" onClick={() => { setAuth(null); setView('overview'); }}><span>{role === 'supplier' ? 'NK' : role === 'admin' ? 'FC' : 'AC'}</span><div><b>{auth.user.name}</b><small>Sign out</small></div></button></header>
      <div className="content">
        {notice && <div className="notice"><CheckCircle2 size={18} />{notice}<button onClick={() => setNotice('')}><X size={16} /></button></div>}
        <section className="intro"><div><p className="eyebrow">{role === 'admin' ? 'SUNDAY, 11 OCTOBER' : `${role === 'supplier' ? supplier.area : receiver.area}, HYDERABAD`}</p><h1>{title.heading}</h1><p>{title.copy}</p></div>{view === 'overview' && <button className="quiet-action" onClick={() => setView('pickups')}>View pickups <ArrowUpRight size={16} /></button>}</section>
        {view === 'overview' && <Overview role={role} donations={donations} displayed={displayed} query={query} setQuery={setQuery} receiverReservations={receiverReservations} supplierDonations={supplierDonations} reservations={reservations} onSelect={setSelected} />}
        {view === 'listings' && <Listings role={role} donations={role === 'supplier' ? supplierDonations : displayed} query={query} setQuery={setQuery} onSelect={setSelected} onCreate={() => setEditor({})} onEdit={setEditor} onCancel={cancelDonation} />}
        {view === 'pickups' && <Pickups role={role} reservations={role === 'supplier' ? supplierReservations : role === 'receiver' ? receiverReservations : reservations} donations={donations} onCollected={markCollected} onHandover={confirmHandover} onReport={reportIssue} />}
        {view === 'organizations' && <Organizations role={role} orgStatuses={orgStatuses} />}
        {view === 'profile' && <Profile role={role} profile={profiles[role]} onSave={(profile) => { setProfiles((items) => ({ ...items, [role]: profile })); setNotice('Organization profile saved.'); setAudit((items) => [`${profile.name} updated its organization profile.`, ...items]); }} />}
        {view === 'controls' && <AdminControls orgStatuses={orgStatuses} onStatus={updateOrgStatus} audit={audit} />}
      </div>
    </main>
    {selected && <DonationModal donation={selected} canReserve={role === 'receiver'} canRecommend={role === 'supplier'} maxReservable={maxReservable(selected)} orgStatuses={orgStatuses} onClose={() => setSelected(null)} onReserve={reserve} />}
    {editor && <DonationEditor donation={editor.id ? editor : null} onClose={() => setEditor(null)} onSave={saveDonation} />}
    {showPickupPanel && <NextPickup reservations={receiverReservations} donations={donations} onCollected={markCollected} />}
  </div>;
}

function getTitle(role, view) {
  const labels = { supplier: { overview: ['Your surplus, put to use', 'Manage current food availability and receiver pickups.'], listings: ['Your donations', 'Track availability, quantities and pickup deadlines.'], pickups: ['Receiver pickups', 'See who is collecting your donated food and when.'], organizations: ['Partner organizations', 'Verified receivers active in this demo.'], profile: ['Organization profile', 'Manage the details receivers use when arranging pickup.'] }, receiver: { overview: ['Good evening, Asha', 'Here are nearby donations ready for your community kitchen.'], listings: ['Available food', 'Browse nearby surplus food matched by distance and availability.'], pickups: ['Your pickups', 'Collect confirmed food directly from the listed supplier.'], organizations: ['Supplier organizations', 'The verified suppliers sharing food nearby.'], profile: ['Organization profile', 'Set your capacity, receiving details and food preferences.'] }, admin: { overview: ['Platform operations', "A focused view of today's activity across FoodConnect."], listings: ['Donation listings', 'Review all current and reserved listings across the platform.'], pickups: ['All pickups', 'A clear operational view of planned and completed collections.'], organizations: ['Organization directory', 'All accounts are pre-verified for this demo.'], controls: ['Platform controls', 'Review organizations, reports, policy settings and audit activity.'] } };
  const [heading, copy] = labels[role][view];
  return { heading, copy };
}

function Overview({ role, donations, displayed, query, setQuery, receiverReservations, supplierDonations, reservations, onSelect }) {
  if (role === 'receiver') return <><div className="stats-grid"><Stat label="Available nearby" value={displayed.length} detail="donations within 10 km" icon={PackageOpen} /><Stat label="Ready to collect" value={receiverReservations.filter((item) => item.status !== 'Collected').length} detail="confirmed pickups" icon={Truck} accent="blue" /><Stat label="This week" value="46" detail="meals received" icon={UsersRound} accent="orange" /></div><FoodPanel donations={displayed} query={query} setQuery={setQuery} onSelect={onSelect} /><section className="two-column"><PickupPreview reservations={receiverReservations} donations={donations} /><ImpactNote /></section></>;
  if (role === 'supplier') return <><div className="stats-grid"><Stat label="Active donations" value={supplierDonations.length} detail="currently listed" icon={PackageOpen} /><Stat label="Reserved today" value={reservations.length} detail="receiver pickups" icon={CheckCircle2} accent="blue" /><Stat label="Meals redirected" value="54" detail="this month" icon={Leaf} accent="orange" /></div><section className="panel availability"><div className="panel-heading"><div><h2>Your current listings</h2><p>Open a listing to find the best receiver match.</p></div></div><div className="donation-list">{supplierDonations.map((donation) => <DonationRow key={donation.id} donation={donation} onSelect={onSelect} actionLabel="Find receiver" />)}</div></section></>;
  return <><div className="stats-grid"><Stat label="Verified organizations" value={organizations.length} detail="all active" icon={ShieldCheck} /><Stat label="Live donations" value={donations.filter((donation) => donation.available > 0).length} detail="ready for collection" icon={PackageOpen} accent="blue" /><Stat label="Confirmed pickups" value={reservations.length} detail="today" icon={Truck} accent="orange" /></div><section className="panel admin-list"><div className="panel-heading"><div><h2>Recent platform activity</h2><p>Current reservations and availability at a glance.</p></div></div>{reservations.slice(-3).reverse().map((reservation) => <PickupRow key={reservation.id} reservation={reservation} donations={donations} />)}</section></>;
}

function FoodPanel({ donations, query, setQuery, onSelect }) { return <section className="panel availability"><div className="panel-heading"><div><h2>Available food nearby</h2><p>Matched by food type, availability and distance.</p></div><SearchBox query={query} setQuery={setQuery} /></div><div className="donation-list">{donations.map((donation) => <DonationRow key={donation.id} donation={donation} onSelect={onSelect} />)}{!donations.length && <EmptyState label="No matching donations found." />}</div></section>; }
function Listings({ role, donations, query, setQuery, onSelect, onCreate, onEdit, onCancel }) { const supplierOnly = role === 'supplier'; return <section className="panel availability"><div className="panel-heading"><div><h2>{supplierOnly ? 'Donation management' : role === 'admin' ? 'All platform listings' : 'Food available for pickup'}</h2><p>{supplierOnly ? 'Create, update, cancel, or match donations to receivers.' : 'Quantity updates live as reservations are made.'}</p></div>{supplierOnly ? <button className="primary-action" onClick={onCreate}><Plus size={16} />Add donation</button> : <SearchBox query={query} setQuery={setQuery} />}</div><div className="listing-header"><span>Donation</span><span>Availability</span><span>Pickup</span><span></span></div><div className="donation-list">{donations.map((donation) => <DonationRow key={donation.id} donation={donation} onSelect={onSelect} actionLabel={role === 'receiver' ? 'Reserve' : 'View'} supplierActions={supplierOnly ? { onEdit, onCancel, onMatch: onSelect } : null} />)}{!donations.length && <EmptyState label="No listings match your search." />}</div></section>; }
function SearchBox({ query, setQuery }) { return <div className="search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search food or area" /></div>; }
function Pickups({ role, reservations, donations, onCollected, onHandover, onReport }) { return <><div className="pickup-summary"><div><Truck size={20} /><span><b>{reservations.filter((item) => !['Collected', 'Disputed'].includes(item.status)).length}</b> active pickups</span></div><p>{role === 'receiver' ? 'Confirm received quantity or report a discrepancy for review.' : role === 'supplier' ? 'Receivers self-collect; confirm handover when food leaves your site.' : 'Monitor all collection activity across the platform.'}</p></div><section className="panel pickup-table"><div className="table-header"><span>Food donation</span><span>Receiver</span><span>Pickup window</span><span>Status</span><span></span></div>{reservations.map((reservation) => <PickupDetailRow key={reservation.id} reservation={reservation} donations={donations} role={role} onCollected={onCollected} onHandover={onHandover} onReport={onReport} />)}{!reservations.length && <EmptyState label="No pickups have been scheduled yet." />}</section></>; }
function Organizations({ role, orgStatuses }) { const shown = role === 'supplier' ? organizations.filter((org) => org.kind === 'Receiver') : role === 'receiver' ? organizations.filter((org) => org.kind === 'Supplier') : organizations; return <section className="org-grid">{shown.map((org) => <article className="org-card" key={org.id}><div className="org-card-head"><div className="avatar" style={{ background: org.color }}>{org.initials}</div><span className={`status ${orgStatuses[org.id] === 'Verified' ? 'available' : 'muted'}`}><CheckCircle2 size={13} />{orgStatuses[org.id]}</span></div><h2>{org.name}</h2><p>{org.kind === 'Supplier' ? 'Food supplier' : 'Food receiver'}</p><div className="org-detail"><span>Area</span><b>{org.area}, Hyderabad</b></div><div className="org-detail"><span>Activity</span><b>{org.kind === 'Supplier' ? 'Active donations' : 'Accepting pickups'}</b></div></article>)}</section>; }
function DonationRow({ donation, onSelect, actionLabel = 'View', supplierActions }) { const org = getOrg(donation.supplierId); return <article className="donation-row"><div className="food-icon"><PackageOpen size={20} /></div><div className="donation-main"><div className="row-title"><h3>{donation.title}</h3><span className={`status ${donation.available ? 'available' : 'muted'}`}>{donation.available ? 'Available' : donation.status}</span></div><p>{org.name} - {donation.area}</p><div className="meta"><span><Clock3 size={14} />{donation.pickup}</span><span>{donation.distance} km away</span></div></div><div className="quantity"><b>{donation.available}</b><span>{donation.unit} left</span></div>{supplierActions ? <div className="row-actions"><button className="small-action" disabled={!donation.available} onClick={() => supplierActions.onMatch(donation)}>Find receiver</button><button className="text-action" onClick={() => supplierActions.onEdit(donation)}><Pencil size={14} />Edit</button><button className="danger-action" onClick={() => supplierActions.onCancel(donation)}><Ban size={14} />Cancel</button></div> : <button className="text-action" disabled={!donation.available && actionLabel === 'Reserve'} onClick={() => onSelect(donation)}>{actionLabel}<ChevronRight size={16} /></button>}</article>; }
function PickupPreview({ reservations, donations }) { return <div className="panel compact"><div className="panel-heading"><div><h2>Pickup schedule</h2><p>Your confirmed collections.</p></div></div>{reservations.filter((item) => item.status !== 'Collected').slice(0, 2).map((reservation) => <PickupRow key={reservation.id} reservation={reservation} donations={donations} />)}</div>; }
function PickupRow({ reservation, donations }) { const donation = donations.find((item) => item.id === reservation.donationId); if (!donation) return null; return <div className="pickup-row"><div className="mini-icon"><Truck size={17} /></div><div><b>{donation.title}</b><p>{reservation.quantity} {reservation.unit} - {donation.pickup}</p></div><span className={`status ${reservation.status === 'Collected' ? 'muted' : 'available'}`}>{reservation.status}</span></div>; }
function PickupDetailRow({ reservation, donations, role, onCollected, onHandover, onReport }) { const donation = donations.find((item) => item.id === reservation.donationId); if (!donation) return null; const receivingOrg = getOrg(reservation.receiverId); const final = ['Collected', 'Disputed'].includes(reservation.status); return <div className="table-row"><div><b>{donation.title}</b><small>{reservation.quantity} {reservation.unit} from {getOrg(donation.supplierId).name}</small></div><div>{receivingOrg.name}</div><div>{donation.pickup}</div><div><span className={`status ${final ? 'muted' : 'available'}`}>{reservation.status}</span></div><div className="pickup-actions">{role === 'receiver' && !final && <><button className="small-action" onClick={() => onCollected(reservation.id)}>Confirm received</button><button className="danger-action" onClick={() => onReport(reservation.id)}>Report issue</button></>}{role === 'supplier' && !final && reservation.status !== 'Handover confirmed' && <button className="small-action" onClick={() => onHandover(reservation.id)}>Confirm handover</button>}</div></div>; }
function NextPickup({ reservations, donations, onCollected }) { const next = reservations.find((reservation) => reservation.status !== 'Collected'); const donation = donations.find((item) => item.id === next.donationId); return <div className="pickup-panel"><div><span>Next pickup</span><b>{donation.title}</b><small>{donation.pickup} - {donation.area}</small></div><button onClick={() => onCollected(next.id)}>Mark collected <ChevronRight size={16} /></button></div>; }
function ImpactNote() { return <div className="impact-note"><Leaf size={22} /><div><p>Community impact</p><strong>46 meals shared this week</strong><span>Confirmed quantities only.</span></div></div>; }
function EmptyState({ label }) { return <div className="empty-state"><PackageOpen size={21} /><p>{label}</p></div>; }
function Profile({ role, profile, onSave }) {
  const [draft, setDraft] = useState(profile);
  const receiverFields = [
    ['categories', 'Accepted food categories'], ['demand', 'Typical demand'], ['capacity', 'Maximum receiving capacity'], ['people', 'People served'],
    ['dietary', 'Dietary restrictions'], ['storage', 'Storage and handling'], ['window', 'Receiving hours and delivery window'],
  ];
  const commonFields = [['name', 'Organization name'], ['type', 'Organization type'], ['address', 'Address and coordinates'], ['contact', 'Contact person'], ['phone', 'Contact details'], ['hours', 'Operating hours']];
  return <section className="profile-layout"><div className="panel profile-form"><div className="panel-heading"><div><h2>{role === 'supplier' ? 'Supplier details' : 'Receiver details'}</h2><p>Only your own organization profile can be changed.</p></div><span className="status available"><CheckCircle2 size={14} />{profile.verification || 'Verified'}</span></div><div className="form-grid">{commonFields.map(([key, label]) => <label key={key}>{label}<input value={draft[key] || ''} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} /></label>)}{role === 'receiver' && receiverFields.map(([key, label]) => <label key={key} className="wide-field">{label}<textarea value={draft[key] || ''} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} /></label>)}</div><div className="form-footer"><span>Verification: {profile.verification || 'Verified'}</span><button className="primary-action" onClick={() => onSave(draft)}>Save profile</button></div></div><aside className="profile-note"><ClipboardCheck size={21} /><h3>{role === 'supplier' ? 'Receiver-ready profile' : 'Capacity-aware matching'}</h3><p>{role === 'supplier' ? 'Receivers see your location, collection hours, and organization details when reserving food.' : 'The demo caps reservations by unit to the capacity recorded above.'}</p></aside></section>;
}
function AdminControls({ orgStatuses, onStatus, audit }) {
  const [tab, setTab] = useState('review');
  const [policy, setPolicy] = useState({ categories: 'Cooked meals, Packed meals, Fresh produce', manual: true, route: 'Receiver self-pickup', review: 'Admin review for reported issues' });
  const [saved, setSaved] = useState(false);
  return <><div className="subtabs">{[['review', 'Organization review'], ['reports', 'Reports and disputes'], ['settings', 'Policy settings'], ['audit', 'Audit records']].map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</div>{tab === 'review' && <section className="panel review-list">{organizations.map((org) => <div className="review-row" key={org.id}><div className="avatar" style={{ background: org.color }}>{org.initials}</div><div><b>{org.name}</b><p>{org.kind} - {org.area}</p></div><span className={`status ${orgStatuses[org.id] === 'Verified' ? 'available' : 'muted'}`}>{orgStatuses[org.id]}</span><div className="review-actions"><button onClick={() => onStatus(org.id, 'Verified')}>Approve</button><button onClick={() => onStatus(org.id, 'Rejected')}>Reject</button><button className="danger-action" onClick={() => onStatus(org.id, 'Suspended')}>Suspend</button></div></div>)}</section>}{tab === 'reports' && <section className="report-grid"><article className="panel report-card"><AlertTriangle size={20} /><h2>Reported discrepancy</h2><p>Receiver noted a quantity discrepancy on a packed-meal collection.</p><span className="status muted">Needs review</span><button className="text-action">Open report <ChevronRight size={15} /></button></article><article className="panel report-card"><Truck size={20} /><h2>Manual route fallback</h2><p>Receiver self-pickup is active. No routing provider is required for this demo.</p><span className="status available">Available</span><button className="text-action">View assignment <ChevronRight size={15} /></button></article></section>}{tab === 'settings' && <section className="panel policy-form"><div className="panel-heading"><div><h2>Demo platform settings</h2><p>Configuration is local to this demo session.</p></div></div><div className="form-grid"><label className="wide-field">Food categories<textarea value={policy.categories} onChange={(event) => setPolicy({ ...policy, categories: event.target.value })} /></label><label>Pickup model<select value={policy.route} onChange={(event) => setPolicy({ ...policy, route: event.target.value })}><option>Receiver self-pickup</option><option>Manual admin assignment</option></select></label><label>Issue workflow<select value={policy.review} onChange={(event) => setPolicy({ ...policy, review: event.target.value })}><option>Admin review for reported issues</option><option>Mark as disputed</option></select></label><label className="toggle-line"><input type="checkbox" checked={policy.manual} onChange={(event) => setPolicy({ ...policy, manual: event.target.checked })} /> Enable manual fallback when automation is unavailable</label></div><div className="form-footer"><span>{saved ? 'Settings saved locally.' : 'No external automation is connected.'}</span><button className="primary-action" onClick={() => setSaved(true)}>Save settings</button></div></section>}{tab === 'audit' && <section className="panel audit-list">{audit.map((entry, index) => <div className="audit-row" key={`${entry}-${index}`}><ClipboardList size={17} /><div><b>{entry}</b><span>{index === 0 ? 'Just now' : 'Demo activity record'}</span></div></div>)}</section>}</>;
}
function DonationEditor({ donation, onClose, onSave }) {
  const [draft, setDraft] = useState(donation || { title: '', category: 'Cooked meals', quantity: 10, unit: 'meals', pickup: 'Today, 7:00 PM', preparation: 'Today, 4:00 PM', storage: 'Room temperature', allergens: 'None known', deadline: 'Today, 7:00 PM', notes: '' });
  const set = (key, value) => setDraft({ ...draft, [key]: value });
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal editor-modal" onMouseDown={(event) => event.stopPropagation()}><button className="close" onClick={onClose}><X size={18} /></button><p className="eyebrow">{donation ? 'EDIT DONATION' : 'NEW DONATION'}</p><h2>{donation ? 'Update food listing' : 'Create food listing'}</h2><div className="form-grid editor-grid"><label className="wide-field">Food type and description<input value={draft.title} onChange={(event) => set('title', event.target.value)} placeholder="e.g. Vegetable biryani" /></label><label>Category<select value={draft.category} onChange={(event) => set('category', event.target.value)}><option>Cooked meals</option><option>Packed meals</option><option>Fresh produce</option></select></label><label>Quantity<input type="number" min="1" value={draft.quantity} onChange={(event) => set('quantity', Number(event.target.value))} /></label><label>Unit<select value={draft.unit} onChange={(event) => set('unit', event.target.value)}><option>meals</option><option>packs</option><option>trays</option><option>kg</option></select></label><label>Preparation time<input value={draft.preparation || ''} onChange={(event) => set('preparation', event.target.value)} /></label><label>Collection deadline<input value={draft.deadline || draft.pickup} onChange={(event) => { set('deadline', event.target.value); set('pickup', event.target.value); }} /></label><label>Storage conditions<input value={draft.storage || ''} onChange={(event) => set('storage', event.target.value)} /></label><label>Known allergens<input value={draft.allergens || ''} onChange={(event) => set('allergens', event.target.value)} /></label><label className="wide-field">Handling notes<textarea value={draft.notes || ''} onChange={(event) => set('notes', event.target.value)} /></label></div><div className="modal-footer"><span>Only unreserved availability can be cancelled later.</span><button className="primary-action" disabled={!draft.title || !draft.quantity} onClick={() => onSave({ ...draft, available: donation ? donation.available : Number(draft.quantity) })}>Save listing</button></div></section></div>;
}
function DonationModal({ donation, canReserve, canRecommend, maxReservable, orgStatuses, onClose, onReserve }) {
  const org = getOrg(donation.supplierId);
  const [quantity, setQuantity] = useState(Math.min(donation.available, maxReservable));
  const recommendations = useMemo(() => getDonationRecommendations(donation, receiverRequirements, organizations, matchingPolicy, orgStatuses), [donation, orgStatuses]);
  return <div className="modal-backdrop" onMouseDown={onClose}><section className={`modal ${canRecommend ? 'matching-modal' : ''}`} onMouseDown={(event) => event.stopPropagation()}><button className="close" onClick={onClose}><X size={18} /></button><p className="eyebrow">{canRecommend ? 'RECEIVER MATCHING' : 'AVAILABLE DONATION'}</p><h2>{donation.title}</h2><p className="modal-supplier">From {org.name} in {donation.area}</p><div className="detail-grid"><div><span>Available</span><b>{donation.available} {donation.unit}</b></div><div><span>Pickup deadline</span><b>{donation.pickup}</b></div><div><span>Storage</span><b>{donation.storage || 'Not specified'}</b></div><div><span>Category</span><b>{donation.category}</b></div></div><p className="notes">{donation.notes}</p>{canRecommend && <MatchingRecommendations donation={donation} recommendations={recommendations} onReserve={onReserve} />}{!canRecommend && <div className="modal-footer">{canReserve ? <><label className="reserve-quantity">Quantity to reserve<input type="number" min="1" max={maxReservable} value={quantity} onChange={(event) => setQuantity(event.target.value)} /><small>Maximum: {maxReservable} {donation.unit}</small></label><button className="primary-action" disabled={maxReservable < 1} onClick={() => onReserve(donation, quantity)}>Reserve pickup <ChevronRight size={16} /></button></> : <span>Listing details are visible to authorized platform users.</span>}</div>}</section></div>;
}

function MatchingRecommendations({ donation, recommendations, onReserve }) {
  return <section className="matching-section"><div className="matching-summary"><div><h3>Eligible receivers ranked for this donation</h3><p>Rule-based score only. Distances are seeded demo data, not live routing.</p></div><span>{recommendations.rankingMode}</span></div>{recommendations.eligible.length ? <div className="match-list">{recommendations.eligible.map((candidate, index) => <article className="match-card" key={candidate.receiver.receiverId}><div className="match-card-top"><div><h4>{candidate.org.name}</h4><p>{candidate.distanceKm} km away - Needs {candidate.receiver.unmetDemand[donation.category]} {donation.unit} - Can collect in {candidate.receiver.canCollectWithinMinutes} min</p></div><strong>{Math.round(candidate.finalScore)}/100</strong></div><div className="score-bar" aria-label={`Match score ${candidate.finalScore} out of 100`}><span style={{ width: `${candidate.finalScore}%` }} /></div><p className="match-copy">{candidate.reasons.join(', ')}.</p><div className="factor-grid"><span>Demand <b>{Math.round(candidate.factors.unmetDemand * 100)}%</b></span><span>Urgency <b>{Math.round(candidate.factors.urgency * 100)}%</b></span><span>Distance <b>{Math.round(candidate.factors.distance * 100)}%</b></span><span>Fit <b>{Math.round(candidate.factors.quantityFit * 100)}%</b></span><span>Reliability <b>{Math.round(candidate.factors.reliability * 100)}%</b></span></div>{candidate.caveats.map((caveat) => <small className="match-caveat" key={caveat}>{caveat}</small>)}<div className="match-actions"><span>{index === 0 ? 'Best current match' : `Rank ${index + 1}`}</span><button className="primary-action" onClick={() => onReserve(donation, candidate.acceptableQuantity, candidate.receiver.receiverId)}>Send {candidate.acceptableQuantity} {donation.unit}</button></div></article>)}</div> : <EmptyState label="No eligible receiver matches this donation." />}{recommendations.excluded.length > 0 && <details className="excluded-list"><summary>{recommendations.excluded.length} receiver {recommendations.excluded.length === 1 ? 'excluded' : 'excluded'} by safety or feasibility rules</summary>{recommendations.excluded.map((candidate) => <div key={candidate.receiver.receiverId}><b>{candidate.org?.name || 'Receiver'}</b><span>{candidate.exclusionReasons.join(' ')}</span></div>)}</details>}</section>;
}

export default App;
