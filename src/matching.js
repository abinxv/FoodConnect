export function getDonationRecommendations(donation, receivers, organizations, policy, orgStatuses = {}) {
  const candidates = receivers.map((receiver) => {
    const org = organizations.find((item) => item.id === receiver.receiverId);
    const exclusionReasons = getExclusionReasons(donation, receiver, org, policy, orgStatuses);

    if (exclusionReasons.length) {
      return {
        receiver,
        org,
        eligible: false,
        exclusionReasons,
        reasons: exclusionReasons.slice(0, 3),
        distanceKm: getDistance(donation, receiver),
        distanceType: 'seeded_demo_distance',
      };
    }

    const factors = getFactorScores(donation, receiver, policy);
    const ruleScore = roundScore(100 * Object.entries(policy.weights).reduce((total, [key, weight]) => total + factors[key] * weight, 0));
    const acceptableQuantity = getAcceptableQuantity(donation, receiver);

    return {
      receiver,
      org,
      eligible: true,
      exclusionReasons: [],
      ruleScore,
      finalScore: ruleScore,
      rankingMode: 'rules_fallback',
      factors,
      acceptableQuantity,
      distanceKm: getDistance(donation, receiver),
      distanceType: 'seeded_demo_distance',
      reasons: buildReasons(donation, receiver, factors, acceptableQuantity),
      caveats: buildCaveats(donation, receiver, acceptableQuantity, factors),
    };
  });

  const eligible = candidates.filter((candidate) => candidate.eligible).sort((left, right) => right.finalScore - left.finalScore);
  const excluded = candidates.filter((candidate) => !candidate.eligible);

  return {
    donationId: donation.id,
    rankingMode: 'rules_fallback',
    modelVersion: null,
    eligible,
    excluded,
  };
}

function getExclusionReasons(donation, receiver, org, policy, orgStatuses) {
  const reasons = [];
  const status = orgStatuses[receiver.receiverId] || 'Verified';

  if (!org || org.kind !== 'Receiver' || !org.active || status !== 'Verified') reasons.push('Receiver is not currently eligible.');
  if (!donation.available || donation.status === 'Cancelled') reasons.push('Donation is not available.');
  if (!receiver.supportedCategories.includes(donation.category)) reasons.push('Food category is not supported.');
  if (donation.storage && !receiver.storageCapabilities.includes(donation.storage)) reasons.push('Required storage is not available.');
  if (donation.dietary && !receiver.dietaryCompatibility.includes(donation.dietary)) reasons.push('Dietary requirements are incompatible.');
  if (donation.allergens && donation.allergens !== 'None known' && receiver.allergenRestrictions.includes(donation.allergens)) reasons.push('Allergen restriction is incompatible.');
  if (getUnmetDemand(donation, receiver) <= 0) reasons.push('No current unmet demand for this food category.');
  if (getRemainingCapacity(donation, receiver) <= 0) reasons.push('No remaining capacity for this unit.');
  if (donation.deadlineMinutes <= 0 || receiver.canCollectWithinMinutes > donation.deadlineMinutes) reasons.push('Cannot collect before the deadline.');
  if (getDistance(donation, receiver) > policy.maxDistanceKm) reasons.push('Seeded distance is outside the matching radius.');

  return reasons;
}

function getFactorScores(donation, receiver, policy) {
  const unmetDemand = getUnmetDemand(donation, receiver);
  const offered = Math.max(1, donation.available);
  const distanceKm = getDistance(donation, receiver);
  const receiverUrgency = urgencyScore(receiver.needByMinutes, policy.urgencyWindowMinutes);
  const donationUrgency = urgencyScore(donation.deadlineMinutes, policy.urgencyWindowMinutes);
  const reliability = receiver.reliability.eligibleCompleted >= 3
    ? receiver.reliability.successfulOnTime / receiver.reliability.eligibleCompleted
    : policy.newReceiverReliabilityDefault;

  return {
    unmetDemand: clamp(unmetDemand / offered),
    urgency: Math.max(receiverUrgency, donationUrgency),
    distance: clamp(1 - distanceKm / policy.maxDistanceKm),
    quantityFit: clamp(getAcceptableQuantity(donation, receiver) / offered),
    reliability: clamp(reliability),
  };
}

function buildReasons(donation, receiver, factors, acceptableQuantity) {
  const reasons = [];

  if (factors.unmetDemand >= 0.85) reasons.push('High unmet demand');
  else if (factors.unmetDemand >= 0.45) reasons.push('Useful remaining demand');
  if (factors.distance >= 0.6) reasons.push('Shorter seeded distance');
  if (factors.urgency >= 0.55) reasons.push('Timely collection fit');
  if (factors.quantityFit >= 0.9) reasons.push(`Can accept most of the donation`);
  if (reasons.length < 3 && donation.storage && receiver.storageCapabilities.includes(donation.storage)) reasons.push('Storage requirements are compatible');
  if (reasons.length < 3 && acceptableQuantity < donation.available) reasons.push('Partial pickup still reduces waste');

  return reasons.slice(0, 3);
}

function buildCaveats(donation, receiver, acceptableQuantity, factors) {
  const caveats = [];

  if (acceptableQuantity < donation.available) caveats.push(`Partial match: can accept ${acceptableQuantity} of ${donation.available} ${donation.unit}.`);
  if (receiver.reliability.eligibleCompleted < 3) caveats.push('Reliability history is limited, so a neutral demo value is used.');
  if (factors.distance < 0.35) caveats.push('Longer seeded distance lowers the score.');

  return caveats;
}

function getAcceptableQuantity(donation, receiver) {
  return Math.min(donation.available, getUnmetDemand(donation, receiver), getRemainingCapacity(donation, receiver));
}

function getUnmetDemand(donation, receiver) {
  return Number(receiver.unmetDemand[donation.category] || 0);
}

function getRemainingCapacity(donation, receiver) {
  return Number(receiver.remainingCapacity[donation.unit] || 0);
}

function getDistance(donation, receiver) {
  return Number(receiver.distanceBySupplier[donation.supplierId] ?? 99);
}

function urgencyScore(minutes, windowMinutes) {
  return clamp(1 - minutes / windowMinutes);
}

function clamp(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function roundScore(value) {
  return Math.round(value * 10) / 10;
}
