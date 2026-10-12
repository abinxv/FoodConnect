import { impactConfig } from './impactData';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const periodOptions = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '3m', label: 'Last 3 months' },
  { id: 'year', label: 'Current year' },
  { id: 'all', label: 'All time' },
];

export const rankingOptions = [
  { id: 'kg', label: 'Kilograms redistributed' },
  { id: 'handovers', label: 'Completed handovers' },
  { id: 'completionRate', label: 'Completion rate' },
];

export function getImpactDashboard({ handovers, beneficiaryReports, organizations, filters, role, supplierId, receiverId }) {
  const period = getPeriodRange(filters.period, impactConfig.demoToday);
  const previousPeriod = getPreviousPeriodRange(period);
  const visibleHandovers = filterByRole(handovers, role, supplierId, receiverId);
  const periodHandovers = filterHandovers(visibleHandovers, period, filters.category, filters.supplierId);
  const previousHandovers = filterHandovers(visibleHandovers, previousPeriod, filters.category, filters.supplierId);
  const completed = completedImpactHandovers(periodHandovers);
  const previousCompleted = completedImpactHandovers(previousHandovers);

  return {
    period,
    previousPeriod,
    kpis: getKpis(completed, organizations),
    previousKpis: getKpis(previousCompleted, organizations),
    leaderboard: getSupplierLeaderboard(periodHandovers, previousHandovers, organizations, filters),
    trends: getTrends(completed, period),
    categories: getCategoryBreakdown(completed),
    supplierProfiles: getSupplierProfiles(periodHandovers, previousHandovers, organizations),
    receiverSummary: getReceiverSummary(completed, organizations),
    dataQuality: getDataQuality(periodHandovers),
    beneficiaryReports: filterBeneficiaryReports(beneficiaryReports, period, role, receiverId),
    categoriesAvailable: Array.from(new Set(handovers.map((item) => item.foodCategory))).sort(),
  };
}

export function getPeriodRange(periodId, todayValue = impactConfig.demoToday) {
  const today = endOfDay(parseDate(todayValue));
  if (periodId === 'all') return { id: periodId, start: null, end: today, label: 'All time' };
  if (periodId === 'year') return { id: periodId, start: new Date(today.getFullYear(), 0, 1), end: today, label: 'Current year' };
  if (periodId === '3m') return { id: periodId, start: addDays(today, -89), end: today, label: 'Last 3 months' };
  if (periodId === '7d') return { id: periodId, start: addDays(today, -6), end: today, label: 'Last 7 days' };
  return { id: '30d', start: addDays(today, -29), end: today, label: 'Last 30 days' };
}

export function reconciledKg(handover) {
  if (handover.status !== 'completed' || handover.eligibleForImpact !== true) return 0;
  const received = Number(handover.receivedQuantityKg);
  const collected = Number(handover.collectedQuantityKg);
  const reserved = Number(handover.reservedQuantityKg);
  const quantities = [received, collected, reserved].filter((value) => Number.isFinite(value) && value >= 0);
  return quantities.length ? Math.min(...quantities) : 0;
}

export function getKpis(completedHandovers, organizations) {
  const kg = sum(completedHandovers.map(reconciledKg));
  return {
    redistributedKg: round(kg),
    mealEquivalents: Math.round(kg / impactConfig.kgPerMeal),
    completedHandovers: completedHandovers.length,
    activeSuppliers: new Set(completedHandovers.map((item) => item.supplierId)).size,
    activeReceivers: new Set(completedHandovers.map((item) => item.receiverId)).size,
    completedListings: new Set(completedHandovers.map((item) => item.donationId)).size,
    visibleOrganizations: organizations.length,
  };
}

export function getSupplierLeaderboard(periodHandovers, previousHandovers, organizations, filters = {}) {
  const suppliers = organizations.filter((org) => org.kind === 'Supplier');
  const currentBySupplier = groupBy(periodHandovers, 'supplierId');
  const previousBySupplier = groupBy(previousHandovers, 'supplierId');
  const search = String(filters.search || '').trim().toLowerCase();
  const metric = filters.rankingMetric || 'kg';

  return suppliers
    .filter((supplier) => !search || supplier.name.toLowerCase().includes(search))
    .map((supplier) => {
      const current = currentBySupplier[supplier.id] || [];
      const previous = previousBySupplier[supplier.id] || [];
      const completed = completedImpactHandovers(current);
      const previousCompleted = completedImpactHandovers(previous);
      const eligibleDue = current.filter((item) => ['completed', 'cancelled', 'expired', 'disputed'].includes(item.status)).length;
      const completionRate = eligibleDue >= impactConfig.completionRateMinimum ? completed.length / eligibleDue : null;
      const kg = sum(completed.map(reconciledKg));
      const previousKg = sum(previousCompleted.map(reconciledKg));
      return {
        supplier,
        kg: round(kg),
        handovers: completed.length,
        mealEquivalents: Math.round(kg / impactConfig.kgPerMeal),
        completionRate,
        changeKg: round(kg - previousKg),
        badges: getBadges(completed, current),
      };
    })
    .filter((row) => row.kg > 0 || row.handovers > 0 || metric === 'completionRate')
    .sort((left, right) => compareLeaderboard(left, right, metric))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function getTrends(completedHandovers, period) {
  const buckets = buildBuckets(period);
  return buckets.map((bucket) => {
    const bucketHandovers = completedHandovers.filter((item) => isWithin(parseDate(item.receivedAt || item.collectedAt || item.reservedAt), bucket));
    const kg = sum(bucketHandovers.map(reconciledKg));
    return { ...bucket, kg: round(kg), handovers: bucketHandovers.length };
  });
}

export function getCategoryBreakdown(completedHandovers) {
  return Object.entries(groupBy(completedHandovers, 'foodCategory'))
    .map(([category, records]) => ({ category, kg: round(sum(records.map(reconciledKg))), handovers: records.length }))
    .sort((left, right) => right.kg - left.kg || left.category.localeCompare(right.category));
}

export function getSupplierProfiles(periodHandovers, previousHandovers, organizations) {
  const leaderboard = getSupplierLeaderboard(periodHandovers, previousHandovers, organizations, { rankingMetric: 'kg' });
  return Object.fromEntries(leaderboard.map((row) => [row.supplier.id, row]));
}

export function getReceiverSummary(completedHandovers, organizations) {
  return organizations
    .filter((org) => org.kind === 'Receiver')
    .map((receiver) => {
      const records = completedHandovers.filter((item) => item.receiverId === receiver.id);
      return { receiver, kg: round(sum(records.map(reconciledKg))), handovers: records.length };
    })
    .filter((row) => row.kg > 0)
    .sort((left, right) => right.kg - left.kg || left.receiver.name.localeCompare(right.receiver.name));
}

export function getDataQuality(handovers) {
  return {
    disputed: handovers.filter((item) => item.status === 'disputed').length,
    cancelled: handovers.filter((item) => item.status === 'cancelled').length,
    expired: handovers.filter((item) => item.status === 'expired').length,
    pending: handovers.filter((item) => item.status === 'pending').length,
  };
}

function getBadges(completed, dueRecords) {
  const badges = [];
  const kg = sum(completed.map(reconciledKg));
  const months = new Set(completed.map((item) => parseDate(item.receivedAt || item.collectedAt).toISOString().slice(0, 7)));
  const eligibleDue = dueRecords.filter((item) => ['completed', 'cancelled', 'expired', 'disputed'].includes(item.status)).length;
  if (kg >= 100) badges.push('First verified/demo 100 kg');
  if (completed.length >= 10) badges.push('10 completed handovers');
  if (months.size >= 3) badges.push('Consistent contributor');
  if (eligibleDue >= impactConfig.completionRateMinimum && completed.length / eligibleDue >= 0.9) badges.push('High completion rate');
  return badges;
}

function compareLeaderboard(left, right, metric) {
  if (metric === 'handovers') return right.handovers - left.handovers || right.kg - left.kg || left.supplier.name.localeCompare(right.supplier.name);
  if (metric === 'completionRate') {
    const leftRate = left.completionRate ?? -1;
    const rightRate = right.completionRate ?? -1;
    return rightRate - leftRate || right.kg - left.kg || left.supplier.name.localeCompare(right.supplier.name);
  }
  return right.kg - left.kg || right.handovers - left.handovers || left.supplier.name.localeCompare(right.supplier.name);
}

function filterHandovers(handovers, period, category, supplierId) {
  return handovers.filter((item) => {
    const date = parseDate(item.receivedAt || item.collectedAt || item.reservedAt);
    return isWithin(date, period) && (!category || category === 'all' || item.foodCategory === category) && (!supplierId || supplierId === 'all' || item.supplierId === supplierId);
  });
}

function filterByRole(handovers, role, supplierId, receiverId) {
  if (role === 'supplier') return handovers.filter((item) => item.supplierId === supplierId);
  if (role === 'receiver') return handovers.filter((item) => item.receiverId === receiverId);
  return handovers;
}

function filterBeneficiaryReports(reports, period, role, receiverId) {
  return reports.filter((report) => {
    const reportEnd = parseDate(report.periodEnd);
    return isWithin(reportEnd, period) && (role !== 'receiver' || report.receiverId === receiverId);
  });
}

function completedImpactHandovers(handovers) {
  return handovers.filter((item) => reconciledKg(item) > 0);
}

function getPreviousPeriodRange(period) {
  if (!period.start) return { ...period };
  const days = Math.max(1, Math.round((period.end - period.start) / MS_PER_DAY) + 1);
  const end = addDays(period.start, -1);
  return { id: `previous-${period.id}`, start: addDays(end, -(days - 1)), end, label: 'Previous period' };
}

function buildBuckets(period) {
  if (!period.start) return [];
  const days = Math.round((period.end - period.start) / MS_PER_DAY) + 1;
  const bucketSize = days <= 31 ? 7 : 30;
  const buckets = [];
  let start = new Date(period.start);
  while (start <= period.end) {
    const end = endOfDay(new Date(Math.min(addDays(start, bucketSize - 1).getTime(), period.end.getTime())));
    buckets.push({ label: formatBucketLabel(start, end, bucketSize), start: new Date(start), end });
    start = addDays(end, 1);
  }
  return buckets;
}

function formatBucketLabel(start, end, bucketSize) {
  if (bucketSize === 7) return `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
  return end.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const value = item[key] || 'Unknown';
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
}

function isWithin(date, period) {
  if (!date || Number.isNaN(date.getTime())) return false;
  if (period.start && date < period.start) return false;
  return date <= period.end;
}

function parseDate(value) {
  return value ? new Date(value) : null;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

function round(value) {
  return Math.round(value * 10) / 10;
}
