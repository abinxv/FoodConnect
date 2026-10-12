import { useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, Leaf, RotateCcw, Search, ShieldCheck, Trophy, UsersRound } from 'lucide-react';
import { beneficiaryReports, impactConfig, seededHandovers } from './impactData.js';
import { getImpactDashboard, periodOptions, rankingOptions } from './impactAnalytics.js';

const formatKg = (value) => `${value.toLocaleString('en-IN')} kg`;
const formatNumber = (value) => value.toLocaleString('en-IN');
const formatRate = (value) => value == null ? 'N/A' : `${Math.round(value * 100)}%`;

function ImpactDashboard({ role, organizations, supplierId, receiverId }) {
  const [filters, setFilters] = useState({ period: '30d', rankingMetric: 'kg', search: '', category: 'all', supplierId: 'all' });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const dashboard = useMemo(() => getImpactDashboard({ handovers: seededHandovers, beneficiaryReports, organizations, filters, role, supplierId, receiverId }), [filters, organizations, role, supplierId, receiverId]);
  const suppliers = organizations.filter((org) => org.kind === 'Supplier');
  const selectedProfile = selectedSupplier ? dashboard.supplierProfiles[selectedSupplier] : dashboard.leaderboard[0];
  const maxTrendKg = Math.max(1, ...dashboard.trends.map((item) => item.kg));
  const maxCategoryKg = Math.max(1, ...dashboard.categories.map((item) => item.kg));

  function update(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters({ period: '30d', rankingMetric: 'kg', search: '', category: 'all', supplierId: 'all' });
    setSelectedSupplier(null);
  }

  return <section className="impact-dashboard">
    <div className="impact-banner">
      <div><p className="eyebrow">SEEDED SOCIAL IMPACT DASHBOARD</p><h2>Redistribution impact, calculated from demo handovers</h2><p>Only completed, eligible, reconciled handovers count toward verified/demo kilograms. Meal equivalents are estimates, not meals served.</p></div>
      <button className="small-action" onClick={resetFilters}><RotateCcw size={15} />Reset demo filters</button>
    </div>

    <div className="impact-controls">
      <label>Period<select value={filters.period} onChange={(event) => update('period', event.target.value)}>{periodOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
      <label>Category<select value={filters.category} onChange={(event) => update('category', event.target.value)}><option value="all">All categories</option>{dashboard.categoriesAvailable.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
      {role === 'admin' && <label>Supplier<select value={filters.supplierId} onChange={(event) => update('supplierId', event.target.value)}><option value="all">All suppliers</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>}
      <label>Rank by<select value={filters.rankingMetric} onChange={(event) => update('rankingMetric', event.target.value)}>{rankingOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
      <label className="impact-search">Search supplier<div><Search size={15} /><input value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder="Name" /></div></label>
    </div>

    <div className="impact-kpis">
      <ImpactKpi label="Verified/demo food redistributed" value={formatKg(dashboard.kpis.redistributedKg)} detail={`${changeText(dashboard.kpis.redistributedKg, dashboard.previousKpis.redistributedKg)} vs previous period`} icon={Leaf} />
      <ImpactKpi label="Estimated meal equivalents" value={formatNumber(dashboard.kpis.mealEquivalents)} detail={`Based on ${impactConfig.kgPerMeal} kg per meal equivalent`} icon={UsersRound} accent="blue" />
      <ImpactKpi label="Completed handovers" value={formatNumber(dashboard.kpis.completedHandovers)} detail={`${dashboard.kpis.completedListings} unique completed listings`} icon={CheckCircle2} accent="green" />
      <ImpactKpi label="Active suppliers" value={formatNumber(dashboard.kpis.activeSuppliers)} detail="With completed handovers" icon={Trophy} accent="orange" />
      <ImpactKpi label="Active receivers" value={formatNumber(dashboard.kpis.activeReceivers)} detail="With completed handovers" icon={ShieldCheck} accent="blue" />
    </div>

    <section className="impact-grid">
      <article className="panel impact-chart-panel"><div className="panel-heading"><div><h2>Redistributed food over time</h2><p>Bucketed from actual completed handover dates.</p></div></div><BarChart rows={dashboard.trends} max={maxTrendKg} valueKey="kg" emptyLabel="No completed handovers in this period." /></article>
      <article className="panel impact-chart-panel"><div className="panel-heading"><div><h2>Food category distribution</h2><p>Eligible reconciled kilograms by category.</p></div></div><BarChart rows={dashboard.categories.map((item) => ({ label: item.category, kg: item.kg, handovers: item.handovers }))} max={maxCategoryKg} valueKey="kg" emptyLabel="No category data for these filters." /></article>
    </section>

    <section className="impact-grid leaderboard-layout">
      <article className="panel leaderboard-panel"><div className="panel-heading"><div><h2>Supplier leaderboard</h2><p>Ranking mode: {rankingOptions.find((option) => option.id === filters.rankingMetric)?.label}</p></div></div>{dashboard.leaderboard.length ? <div className="leaderboard-list">{dashboard.leaderboard.map((row) => <button className={`leaderboard-row ${selectedProfile?.supplier.id === row.supplier.id ? 'active' : ''}`} key={row.supplier.id} onClick={() => setSelectedSupplier(row.supplier.id)}><span className="rank">#{row.rank}</span><span><b>{row.supplier.name}</b><small><CheckCircle2 size={12} />Verified demo supplier</small></span><span>{formatKg(row.kg)}<small>{row.handovers} handovers</small></span><span>{formatRate(row.completionRate)}<small>Completion</small></span><span className={row.changeKg >= 0 ? 'positive-change' : 'negative-change'}>{row.changeKg >= 0 ? '+' : ''}{formatKg(row.changeKg)}</span></button>)}</div> : <EmptyImpact label="No suppliers match these filters." />}</article>
      <SupplierImpactProfile profile={selectedProfile} trends={dashboard.trends} />
    </section>

    <section className="impact-grid">
      {role !== 'supplier' && <article className="panel receiver-impact"><div className="panel-heading"><div><h2>{role === 'receiver' ? 'Your received food' : 'Receiver activity'}</h2><p>Completed received quantities only.</p></div></div>{dashboard.receiverSummary.length ? dashboard.receiverSummary.slice(0, 6).map((row) => <div className="receiver-impact-row" key={row.receiver.id}><span>{row.receiver.name}</span><b>{formatKg(row.kg)}</b><small>{row.handovers} handovers</small></div>) : <EmptyImpact label="No receiver activity for this period." />}</article>}
      <article className="panel receiver-impact"><div className="panel-heading"><div><h2>Receiver-reported service stats</h2><p>Shown separately from estimated meal equivalents.</p></div></div>{dashboard.beneficiaryReports.length ? dashboard.beneficiaryReports.map((report) => <div className="receiver-impact-row" key={report.id}><span>{report.metricType.replaceAll('_', ' ')}</span><b>{formatNumber(report.count)}</b><small>{report.periodStart} to {report.periodEnd} - {report.verificationStatus}</small></div>) : <EmptyImpact label="Not reported for this period." />}</article>
      {role === 'admin' && <article className="panel receiver-impact"><div className="panel-heading"><div><h2>Data-quality watch</h2><p>Excluded from verified/demo redistributed kilograms.</p></div></div>{Object.entries(dashboard.dataQuality).map(([key, value]) => <div className="receiver-impact-row" key={key}><span>{key}</span><b>{value}</b><small>{key === 'expired' ? 'Food outcome unknown' : 'Not counted as verified impact'}</small></div>)}</article>}
    </section>

    <section className="panel methodology"><BarChart3 size={20} /><div><h2>Methodology</h2><p>Redistributed kilograms use the conservative reconciled quantity: the lowest available value across reserved, collected, and received kilograms. Cancelled, expired, pending, and disputed handovers are excluded from verified/demo totals. Estimated meal equivalents divide redistributed kilograms by {impactConfig.kgPerMeal} kg and should not be read as nutrition, unique people served, or meals actually eaten.</p></div></section>
  </section>;
}

function ImpactKpi({ label, value, detail, icon: Icon, accent = 'green' }) {
  return <article className={`impact-kpi ${accent}`}><div><span>{label}</span><b>{value}</b><small>{detail}</small></div><Icon size={20} /></article>;
}

function BarChart({ rows, max, valueKey, emptyLabel }) {
  if (!rows.length) return <EmptyImpact label={emptyLabel} />;
  return <div className="impact-bars">{rows.map((row) => <div className="impact-bar-row" key={row.label}><div><span>{row.label}</span><small>{formatKg(row[valueKey])} - {row.handovers} handovers</small></div><div className="impact-bar-track"><span style={{ width: `${Math.max(4, (row[valueKey] / max) * 100)}%` }} /></div></div>)}</div>;
}

function SupplierImpactProfile({ profile }) {
  if (!profile) return <article className="panel supplier-profile"><EmptyImpact label="Select a supplier to inspect impact details." /></article>;
  return <article className="panel supplier-profile"><div className="panel-heading"><div><h2>{profile.supplier.name}</h2><p>Leaderboard position #{profile.rank} for the selected period.</p></div><span className="status available"><CheckCircle2 size={13} />Verified</span></div><div className="profile-metrics"><div><span>Redistributed</span><b>{formatKg(profile.kg)}</b></div><div><span>Handovers</span><b>{profile.handovers}</b></div><div><span>Meal equivalent estimate</span><b>{formatNumber(profile.mealEquivalents)}</b></div><div><span>Completion rate</span><b>{formatRate(profile.completionRate)}</b></div></div><div className="badge-row">{profile.badges.length ? profile.badges.map((badge) => <span key={badge}>{badge}</span>) : <span>Seeded data badge pending</span>}</div></article>;
}

function EmptyImpact({ label }) {
  return <div className="empty-impact"><Leaf size={18} /><p>{label}</p></div>;
}

function changeText(current, previous) {
  const change = Math.round((current - previous) * 10) / 10;
  return `${change >= 0 ? '+' : ''}${formatKg(change)}`;
}

export default ImpactDashboard;
