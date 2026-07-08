/**
 * mockApi.js
 * localStorage-backed, Promise-returning mock API.
 * Every function returns a Promise with an artificial delay to simulate
 * real network latency. Seed data lives in src/mockData/.
 */

import { DEMO_USERS }         from '../mockData/users';
import { CREATOR_PROFILES }   from '../mockData/creators';
import { CAMPAIGNS }          from '../mockData/campaigns';
import { POSTS }              from '../mockData/posts';
import { TRANSACTIONS }       from '../mockData/transactions';
import { NOTIFICATIONS }      from '../mockData/notifications';

// ─── Storage keys ──────────────────────────────────────────────────────────
const K = {
  users:         'ap_users',
  creators:      'ap_creators',
  campaigns:     'ap_campaigns',
  posts:         'ap_posts',
  transactions:  'ap_transactions',
  notifications: 'ap_notifications',
  payouts:       'ap_payouts',
  following:     'ap_following',
};

// ─── Internal helpers ──────────────────────────────────────────────────────
const delay = (ms = 350) => new Promise(r => setTimeout(r, ms));

/** Generate a short unique id */
const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Load from localStorage, fall back to seed array */
function load(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [...seed];
  } catch {
    return [...seed];
  }
}

/** Persist array to localStorage */
function persist(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Reset (nuke everything back to seed state) ────────────────────────────
export function resetDemoData() {
  Object.values(K).forEach(k => localStorage.removeItem(k));
  localStorage.removeItem('ap_auth_user');
}

// ─── Users ─────────────────────────────────────────────────────────────────
export async function getUser(userId) {
  await delay(180);
  const users = load(K.users, DEMO_USERS);
  return users.find(u => u.id === userId) ?? null;
}

// ─── Creators ──────────────────────────────────────────────────────────────
export async function getCreators() {
  await delay(380);
  return load(K.creators, CREATOR_PROFILES);
}

export async function getCreatorByUserId(userId) {
  await delay(280);
  const creators = load(K.creators, CREATOR_PROFILES);
  return creators.find(c => c.userId === userId) ?? null;
}

export async function getCreatorBySlug(slug) {
  await delay(280);
  const creators = load(K.creators, CREATOR_PROFILES);
  return creators.find(c => c.uniqueSlug === slug) ?? null;
}

export async function updateCreatorProfile(userId, updates) {
  await delay(500);
  const creators = load(K.creators, CREATOR_PROFILES);
  const idx = creators.findIndex(c => c.userId === userId);
  if (idx === -1) throw new Error('Creator not found');
  creators[idx] = { ...creators[idx], ...updates };
  persist(K.creators, creators);
  return creators[idx];
}

// ─── Campaigns ─────────────────────────────────────────────────────────────
/**
 * @param {string|null} creatorId — pass null to get all campaigns
 * @param {string|null} status    — 'active' | 'completed' | 'draft' | null (all)
 */
export async function getCampaigns(creatorId = null, status = null) {
  await delay(380);
  let campaigns = load(K.campaigns, CAMPAIGNS);
  if (creatorId) campaigns = campaigns.filter(c => c.creatorId === creatorId);
  if (status)    campaigns = campaigns.filter(c => c.status === status);
  return campaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getCampaignById(id) {
  await delay(260);
  const campaigns = load(K.campaigns, CAMPAIGNS);
  return campaigns.find(c => c.id === id) ?? null;
}

export async function createCampaign(data) {
  await delay(560);
  const campaigns = load(K.campaigns, CAMPAIGNS);
  const newCampaign = {
    id:            `campaign-${uid()}`,
    currentAmount: 0,
    backerCount:   0,
    createdAt:     new Date().toISOString(),
    status:        'draft',
    coverImageUrl: null,
    ...data,
  };
  campaigns.push(newCampaign);
  persist(K.campaigns, campaigns);
  return newCampaign;
}

export async function updateCampaign(id, updates) {
  await delay(480);
  const campaigns = load(K.campaigns, CAMPAIGNS);
  const idx = campaigns.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Campaign not found');
  campaigns[idx] = { ...campaigns[idx], ...updates };
  persist(K.campaigns, campaigns);
  return campaigns[idx];
}

export async function deleteCampaign(id) {
  await delay(400);
  const campaigns = load(K.campaigns, CAMPAIGNS);
  persist(K.campaigns, campaigns.filter(c => c.id !== id));
  return true;
}

// ─── Posts ─────────────────────────────────────────────────────────────────
/** @param {string[]|null} creatorIds — null = all posts */
export async function getPosts(creatorIds = null) {
  await delay(380);
  let posts = load(K.posts, POSTS);
  if (creatorIds && creatorIds.length > 0) {
    posts = posts.filter(p => creatorIds.includes(p.creatorId));
  }
  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function createPost(data) {
  await delay(520);
  const posts = load(K.posts, POSTS);
  const newPost = {
    id:        `post-${uid()}`,
    images:    [],
    createdAt: new Date().toISOString(),
    ...data,
  };
  posts.push(newPost);
  persist(K.posts, posts);
  return newPost;
}

export async function updatePost(id, updates) {
  await delay(460);
  const posts = load(K.posts, POSTS);
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Post not found');
  posts[idx] = { ...posts[idx], ...updates };
  persist(K.posts, posts);
  return posts[idx];
}

export async function deletePost(id) {
  await delay(380);
  const posts = load(K.posts, POSTS);
  persist(K.posts, posts.filter(p => p.id !== id));
  return true;
}

// ─── Transactions ──────────────────────────────────────────────────────────
/**
 * @param {{ creatorId, supporterId, campaignId }} filter
 */
export async function getTransactions(filter = {}) {
  await delay(400);
  let txns = load(K.transactions, TRANSACTIONS);
  if (filter.creatorId)   txns = txns.filter(t => t.creatorId  === filter.creatorId);
  if (filter.supporterId) txns = txns.filter(t => t.supporterId === filter.supporterId);
  if (filter.campaignId)  txns = txns.filter(t => t.campaignId  === filter.campaignId);
  return txns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * createPledge — simulates payment processing and updates campaign totals.
 * @param {{ supporterId, creatorId, campaignId, amount, currency, paymentMethod, supporterName }} data
 */
export async function createPledge(data) {
  await delay(900); // Simulate payment gateway latency

  const txns = load(K.transactions, TRANSACTIONS);
  const newTxn = {
    id:        `txn-${uid()}`,
    status:    'completed',
    createdAt: new Date().toISOString(),
    ...data,
  };
  txns.push(newTxn);
  persist(K.transactions, txns);

  // Update campaign running totals
  if (data.campaignId) {
    const campaigns = load(K.campaigns, CAMPAIGNS);
    const idx = campaigns.findIndex(c => c.id === data.campaignId);
    if (idx !== -1) {
      campaigns[idx].currentAmount =
        (campaigns[idx].currentAmount ?? 0) + Number(data.amount);
      campaigns[idx].backerCount =
        (campaigns[idx].backerCount ?? 0) + 1;
      persist(K.campaigns, campaigns);
    }
  }

  return newTxn;
}

// ─── Analytics ────────────────────────────────────────────────────────────
/**
 * Returns aggregated analytics data for a creator.
 * @param {string} creatorId
 * @param {'7d'|'30d'|'90d'|'1y'} range
 */
export async function getAnalytics(creatorId, range = '30d') {
  await delay(480);

  const allTxns   = load(K.transactions, TRANSACTIONS).filter(t => t.creatorId === creatorId);
  const campaigns = load(K.campaigns,    CAMPAIGNS).filter(c => c.creatorId === creatorId);

  const now  = new Date();
  const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[range] ?? 30;
  const cutoff    = new Date(now.getTime() - days * 86_400_000);
  const periodTxns = allTxns.filter(t => new Date(t.createdAt) >= cutoff);

  // Build daily earnings map
  const dailyMap = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86_400_000);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  periodTxns.forEach(t => {
    const key = t.createdAt.slice(0, 10);
    if (dailyMap[key] !== undefined) dailyMap[key] += t.amount;
  });
  const dailyEarnings = Object.entries(dailyMap).map(([date, amount]) => ({ date, amount }));

  // Payment method breakdown
  const methodMap = {};
  periodTxns.forEach(t => {
    methodMap[t.paymentMethod] = (methodMap[t.paymentMethod] ?? 0) + t.amount;
  });
  const byPaymentMethod = Object.entries(methodMap).map(([method, amount]) => ({
    method,
    amount,
    label: { ecocash: 'EcoCash', card: 'Card', bank_transfer: 'Bank Transfer' }[method] ?? method,
  }));

  // Campaign performance table
  const campaignPerformance = campaigns.map(c => ({
    id:      c.id,
    title:   c.title,
    goal:    c.goalAmount,
    raised:  c.currentAmount,
    backers: c.backerCount,
    pct:     Math.min(100, Math.round((c.currentAmount / c.goalAmount) * 100)),
    status:  c.status,
  }));

  return {
    totalEarned:         allTxns.reduce((s, t) => s + t.amount, 0),
    periodEarned:        periodTxns.reduce((s, t) => s + t.amount, 0),
    totalSupporters:     new Set(allTxns.filter(t => t.supporterId).map(t => t.supporterId)).size,
    periodSupporters:    new Set(periodTxns.filter(t => t.supporterId).map(t => t.supporterId)).size,
    totalTransactions:   allTxns.length,
    periodTransactions:  periodTxns.length,
    dailyEarnings,
    byPaymentMethod,
    campaignPerformance,
  };
}

// ─── Payouts ──────────────────────────────────────────────────────────────
const PAYOUT_SEED = [
  {
    id: 'payout-1',
    creatorId: 'user-creator-1',
    amount: 500,
    destinationMethod: 'ecocash',
    status: 'completed',
    requestedAt: '2024-10-01T09:00:00.000Z',
    completedAt:  '2024-10-03T14:00:00.000Z',
  },
  {
    id: 'payout-2',
    creatorId: 'user-creator-1',
    amount: 1000,
    destinationMethod: 'bank',
    status: 'completed',
    requestedAt: '2024-12-01T10:00:00.000Z',
    completedAt:  '2024-12-03T11:00:00.000Z',
  },
];

export async function getPayoutRequests(creatorId) {
  await delay(380);
  const payouts = load(K.payouts, PAYOUT_SEED);
  return payouts
    .filter(p => p.creatorId === creatorId)
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
}

export async function requestPayout(data) {
  await delay(680);
  const payouts = load(K.payouts, PAYOUT_SEED);
  const newPayout = {
    id:          `payout-${uid()}`,
    status:      'pending',
    requestedAt: new Date().toISOString(),
    completedAt: null,
    ...data,
  };
  payouts.push(newPayout);
  persist(K.payouts, payouts);
  return newPayout;
}

// ─── Notifications ─────────────────────────────────────────────────────────
export async function getNotifications(userId) {
  await delay(280);
  const notifs = load(K.notifications, NOTIFICATIONS);
  return notifs
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function markNotificationRead(notifId) {
  await delay(180);
  const notifs = load(K.notifications, NOTIFICATIONS);
  const idx = notifs.findIndex(n => n.id === notifId);
  if (idx !== -1) { notifs[idx].isRead = true; persist(K.notifications, notifs); }
  return true;
}

export async function markAllNotificationsRead(userId) {
  await delay(280);
  const notifs = load(K.notifications, NOTIFICATIONS);
  notifs.forEach(n => { if (n.userId === userId) n.isRead = true; });
  persist(K.notifications, notifs);
  return true;
}

// ─── Following ─────────────────────────────────────────────────────────────
const FOLLOWING_SEED = [
  { supporterId: 'user-supporter-1', creatorId: 'user-creator-1', followedAt: '2024-11-14T09:00:00.000Z' },
  { supporterId: 'user-supporter-1', creatorId: 'user-creator-2', followedAt: '2024-12-04T09:00:00.000Z' },
  { supporterId: 'user-supporter-2', creatorId: 'user-creator-1', followedAt: '2024-11-19T09:00:00.000Z' },
];

export async function getFollowing(supporterId) {
  await delay(280);
  const following = load(K.following, FOLLOWING_SEED);
  return following.filter(f => f.supporterId === supporterId);
}

export async function followCreator(supporterId, creatorId) {
  await delay(380);
  const following = load(K.following, FOLLOWING_SEED);
  const exists = following.some(f => f.supporterId === supporterId && f.creatorId === creatorId);
  if (!exists) {
    following.push({ supporterId, creatorId, followedAt: new Date().toISOString() });
    persist(K.following, following);
  }
  return true;
}

export async function unfollowCreator(supporterId, creatorId) {
  await delay(380);
  const following = load(K.following, FOLLOWING_SEED);
  persist(K.following,
    following.filter(f => !(f.supporterId === supporterId && f.creatorId === creatorId)));
  return true;
}

export async function isFollowing(supporterId, creatorId) {
  await delay(150);
  const following = load(K.following, FOLLOWING_SEED);
  return following.some(f => f.supporterId === supporterId && f.creatorId === creatorId);
}

// ─── Add a single notification ─────────────────────────────────────────────
/**
 * addNotification — used by PledgeModal to notify a creator of a new pledge.
 * @param {{ userId, type, message, isRead?, linkTo? }} data
 */
export async function addNotification(data) {
  await delay(80);
  const notifs = load(K.notifications, NOTIFICATIONS);
  const newNotif = {
    id:        `notif-${uid()}`,
    isRead:    false,
    createdAt: new Date().toISOString(),
    linkTo:    '/app/campaigns',
    ...data,
  };
  notifs.push(newNotif);
  persist(K.notifications, notifs);
  return newNotif;
}


// ─── KYC & payout-method helpers ──────────────────────────────────────────

/**
 * Update a user's KYC status
 * @param {string} userId - The user's ID
 * @param {Object} kycStatus - KYC status object
 * @param {string} kycStatus.status - 'pending' | 'verified' | 'rejected'
 * @param {string} [kycStatus.documentType] - 'passport' | 'id' | 'drivers_license'
 * @param {string} [kycStatus.documentNumber] - Document number
 * @param {string} [kycStatus.submittedAt] - ISO date string
 * @param {string} [kycStatus.verifiedAt] - ISO date string
 * @param {string} [kycStatus.rejectionReason] - Reason if rejected
 */
export async function updateKycStatus(userId, kycStatus) {
  await delay(500);
  
  const users = load(K.users, DEMO_USERS);
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  
  // Ensure KYC field exists
  if (!users[idx].kyc) {
    users[idx].kyc = {};
  }
  
  // Update KYC status
  users[idx].kyc = {
    ...users[idx].kyc,
    ...kycStatus,
    updatedAt: new Date().toISOString()
  };
  
  // If status is 'verified', set verifiedAt if not provided
  if (kycStatus.status === 'verified' && !users[idx].kyc.verifiedAt) {
    users[idx].kyc.verifiedAt = new Date().toISOString();
  }
  
  persist(K.users, users);
  return users[idx].kyc;
}

/**
 * Add a payout method for a user
 * @param {string} userId - The user's ID
 * @param {Object} method - Payout method details
 * @param {string} method.type - 'ecocash' | 'bank' | 'card' | 'paypal'
 * @param {string} method.label - Display label (e.g., "Main Bank Account")
 * @param {Object} method.details - Method-specific details
 * @param {string} method.details.accountNumber - Account/phone number
 * @param {string} [method.details.accountName] - Account holder name
 * @param {string} [method.details.bankName] - Bank name (for bank transfers)
 * @param {string} [method.details.branchCode] - Bank branch code
 * @param {boolean} [method.isDefault] - Set as default payout method
 */
export async function addPayoutMethod(userId, method) {
  await delay(450);
  
  const users = load(K.users, DEMO_USERS);
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  
  // Initialize payoutMethods array if it doesn't exist
  if (!users[idx].payoutMethods) {
    users[idx].payoutMethods = [];
  }
  
  // Create new method with metadata
  const newMethod = {
    id: `pm-${uid()}`,
    ...method,
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // If this is set as default, remove default from other methods
  if (method.isDefault) {
    users[idx].payoutMethods.forEach(m => m.isDefault = false);
  }
  
  // If this is the first method and no default was specified, make it default
  if (users[idx].payoutMethods.length === 0 && !method.isDefault) {
    newMethod.isDefault = true;
  }
  
  users[idx].payoutMethods.push(newMethod);
  persist(K.users, users);
  return newMethod;
}

/**
 * Verify a payout method (typically after successful test transaction)
 * @param {string} userId - The user's ID
 * @param {number} methodIndex - Index of the method in the payoutMethods array
 * @param {Object} [verificationData] - Optional verification data
 * @param {string} [verificationData.verifiedAt] - ISO date string
 * @param {string} [verificationData.notes] - Verification notes
 */
export async function verifyPayoutMethod(userId, methodIndex, verificationData = {}) {
  await delay(400);
  
  const users = load(K.users, DEMO_USERS);
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  
  if (!users[idx].payoutMethods || !users[idx].payoutMethods[methodIndex]) {
    throw new Error('Payout method not found');
  }
  
  const method = users[idx].payoutMethods[methodIndex];
  method.isVerified = true;
  method.verifiedAt = verificationData.verifiedAt || new Date().toISOString();
  method.verificationNotes = verificationData.notes || null;
  method.updatedAt = new Date().toISOString();
  
  persist(K.users, users);
  return method;
}

/**
 * Remove a payout method
 * @param {string} userId - The user's ID
 * @param {number} methodIndex - Index of the method in the payoutMethods array
 * @param {boolean} [forceDelete] - If true, delete even if it's the only method
 */
export async function removePayoutMethod(userId, methodIndex, forceDelete = false) {
  await delay(400);
  
  const users = load(K.users, DEMO_USERS);
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  
  if (!users[idx].payoutMethods || !users[idx].payoutMethods[methodIndex]) {
    throw new Error('Payout method not found');
  }
  
  // Don't allow removing the last method unless forceDelete is true
  if (users[idx].payoutMethods.length === 1 && !forceDelete) {
    throw new Error('Cannot remove the only payout method. Add another method first or use forceDelete.');
  }
  
  // Check if we're removing the default method
  const isDefault = users[idx].payoutMethods[methodIndex].isDefault;
  
  // Remove the method
  users[idx].payoutMethods.splice(methodIndex, 1);
  
  // If we removed the default method, set the first available method as default
  if (isDefault && users[idx].payoutMethods.length > 0) {
    users[idx].payoutMethods[0].isDefault = true;
  }
  
  persist(K.users, users);
  return true;
}

/**
 * Get a user's payout methods
 * @param {string} userId - The user's ID
 * @param {boolean} [onlyVerified] - Only return verified methods
 */
export async function getPayoutMethods(userId, onlyVerified = false) {
  await delay(300);
  
  const users = load(K.users, DEMO_USERS);
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  
  if (!user.payoutMethods) {
    return [];
  }
  
  let methods = user.payoutMethods;
  if (onlyVerified) {
    methods = methods.filter(m => m.isVerified === true);
  }
  
  return methods.sort((a, b) => {
    // Sort: default first, then by creation date
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

/**
 * Set a payout method as default
 * @param {string} userId - The user's ID
 * @param {number} methodIndex - Index of the method in the payoutMethods array
 */
export async function setDefaultPayoutMethod(userId, methodIndex) {
  await delay(350);
  
  const users = load(K.users, DEMO_USERS);
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  
  if (!users[idx].payoutMethods || !users[idx].payoutMethods[methodIndex]) {
    throw new Error('Payout method not found');
  }
  
  // Remove default from all methods
  users[idx].payoutMethods.forEach(m => m.isDefault = false);
  
  // Set the selected method as default
  users[idx].payoutMethods[methodIndex].isDefault = true;
  users[idx].payoutMethods[methodIndex].updatedAt = new Date().toISOString();
  
  persist(K.users, users);
  return users[idx].payoutMethods[methodIndex];
}