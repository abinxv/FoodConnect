import assert from 'node:assert/strict';
import { getImpactDashboard, getKpis, getSupplierLeaderboard, reconciledKg } from './impactAnalytics.js';
import { beneficiaryReports, seededHandovers } from './impactData.js';
import { organizations } from './data.js';

const completed = seededHandovers.filter((item) => reconciledKg(item) > 0);

assert.equal(reconciledKg({
  status: 'completed',
  eligibleForImpact: true,
  reservedQuantityKg: 20,
  collectedQuantityKg: 19,
  receivedQuantityKg: 18,
}), 18, 'reconciled kg should use the conservative confirmed quantity');

assert.equal(reconciledKg({
  status: 'disputed',
  eligibleForImpact: false,
  reservedQuantityKg: 20,
  collectedQuantityKg: 20,
  receivedQuantityKg: 20,
}), 0, 'disputed handovers must not count as verified/demo impact');

const kpis = getKpis(completed, organizations);
assert.equal(kpis.mealEquivalents, Math.round(kpis.redistributedKg / 0.5), 'meal equivalents should use the configured 0.5 kg assumption');
assert.equal(kpis.completedListings, new Set(completed.map((item) => item.donationId)).size, 'completed listings should be unique donation IDs');

const dashboard = getImpactDashboard({
  handovers: seededHandovers,
  beneficiaryReports,
  organizations,
  filters: { period: '30d', rankingMetric: 'kg', search: '', category: 'all', supplierId: 'all' },
  role: 'admin',
});

assert.ok(dashboard.kpis.redistributedKg > 0, 'period filters should include completed records');
assert.ok(dashboard.dataQuality.disputed >= 1, 'data-quality warnings should track disputed records separately');
assert.ok(dashboard.beneficiaryReports.every((report) => report.count > 0), 'beneficiary reports should stay separate from meal estimates');

const leaderboard = getSupplierLeaderboard(seededHandovers, [], organizations, { rankingMetric: 'kg' });
for (let index = 1; index < leaderboard.length; index += 1) {
  assert.ok(leaderboard[index - 1].kg >= leaderboard[index].kg, 'leaderboard should sort kilograms descending');
}

const categoryDashboard = getImpactDashboard({
  handovers: seededHandovers,
  beneficiaryReports,
  organizations,
  filters: { period: 'all', rankingMetric: 'kg', search: '', category: 'Fresh produce', supplierId: 'all' },
  role: 'admin',
});
assert.ok(categoryDashboard.categories.every((item) => item.category === 'Fresh produce'), 'category filter should constrain category analytics');

console.log('impact analytics tests passed');
