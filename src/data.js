export const organizations = [
  { id: 'org-1', name: 'Nizam Kitchen', kind: 'Supplier', area: 'Banjara Hills', initials: 'NK', color: '#d95836', active: true },
  { id: 'org-2', name: 'Charminar Banquets', kind: 'Supplier', area: 'Himayatnagar', initials: 'CB', color: '#7c56b4', active: true },
  { id: 'org-3', name: 'Saffron Corporate Cafe', kind: 'Supplier', area: 'Gachibowli', initials: 'SC', color: '#df9e25', active: true },
  { id: 'org-4', name: 'Asha Community Kitchen', kind: 'Receiver', area: 'Jubilee Hills', initials: 'AC', color: '#15826b', active: true },
  { id: 'org-5', name: 'Sahara Shelter', kind: 'Receiver', area: 'Tolichowki', initials: 'SS', color: '#2c78b8', active: true },
  { id: 'org-6', name: 'Udaan Food Collective', kind: 'Receiver', area: 'Begumpet', initials: 'UF', color: '#c24a76', active: true },
];

export const seededDonations = [
  { id: 'don-1', supplierId: 'org-1', title: 'Vegetable biryani', category: 'Cooked meals', quantity: 36, unit: 'meals', available: 36, pickup: 'Today, 7:00 PM', area: 'Banjara Hills', distance: 3.2, status: 'Available', notes: 'Prepared at 3:30 PM. Packed in 6 trays.' },
  { id: 'don-2', supplierId: 'org-2', title: 'Mixed meal packs', category: 'Packed meals', quantity: 24, unit: 'packs', available: 24, pickup: 'Today, 8:15 PM', area: 'Himayatnagar', distance: 5.6, status: 'Available', notes: 'Veg rice, dal and salad packs.' },
  { id: 'don-3', supplierId: 'org-3', title: 'Fresh fruit boxes', category: 'Fresh produce', quantity: 12, unit: 'trays', available: 12, pickup: 'Tomorrow, 9:00 AM', area: 'Gachibowli', distance: 8.7, status: 'Available', notes: 'Assorted bananas, apples and oranges.' },
  { id: 'don-4', supplierId: 'org-1', title: 'Chapati and dal', category: 'Cooked meals', quantity: 18, unit: 'meals', available: 18, pickup: 'Tomorrow, 8:30 AM', area: 'Banjara Hills', distance: 3.2, status: 'Available', notes: 'Pickup before 9:15 AM.' },
];

export const initialReservations = [
  { id: 'res-1', donationId: 'don-1', receiverId: 'org-4', quantity: 12, unit: 'meals', status: 'Ready for pickup', createdAt: 'Today, 4:10 PM' },
  { id: 'res-2', donationId: 'don-2', receiverId: 'org-6', quantity: 8, unit: 'packs', status: 'Ready for pickup', createdAt: 'Today, 3:45 PM' },
];
