/**
 * notifications.js — seed notification records
 * Creator notifications: pledges received, milestones, KYC
 * Supporter notifications: post updates, pledge confirmations
 */

export const NOTIFICATIONS = [
  // ── Creator (Tendai) notifications ──────────────────────────────────────
  {
    id: 'notif-1',
    userId: 'user-creator-1',
    type: 'pledge',       // 'pledge' | 'milestone' | 'kyc' | 'post' | 'pledge_confirmed'
    message: "Chipo Ndlovu pledged $25 to \"Mwana WaMambo\"",
    isRead: false,
    linkTo: '/app/campaigns',
    createdAt: '2024-11-15T10:01:00.000Z',
  },
  {
    id: 'notif-2',
    userId: 'user-creator-1',
    type: 'pledge',
    message: "Farai Mutasa pledged $75 to \"Mwana WaMambo\"",
    isRead: false,
    linkTo: '/app/campaigns',
    createdAt: '2025-01-02T16:01:00.000Z',
  },
  {
    id: 'notif-3',
    userId: 'user-creator-1',
    type: 'milestone',
    message: "Your campaign \"Mwana WaMambo\" reached 75% of its goal! 🎉",
    isRead: true,
    linkTo: '/app/campaigns',
    createdAt: '2025-01-05T09:00:00.000Z',
  },
  {
    id: 'notif-4',
    userId: 'user-creator-1',
    type: 'kyc',
    message: "Your KYC verification is complete. You can now request payouts.",
    isRead: true,
    linkTo: '/app/payouts',
    createdAt: '2024-02-01T09:00:00.000Z',
  },

  // ── Supporter (Chipo) notifications ─────────────────────────────────────
  {
    id: 'notif-5',
    userId: 'user-supporter-1',
    type: 'post',
    message: 'Tendai Moyo posted: "Chapter 3 Illustrations — Almost Done!"',
    isRead: false,
    linkTo: '/app/following',
    createdAt: '2025-01-12T14:31:00.000Z',
  },
  {
    id: 'notif-6',
    userId: 'user-supporter-1',
    type: 'post',
    message: 'Rudo Chikwanda posted: "Track 4 Studio Session Recap"',
    isRead: false,
    linkTo: '/app/following',
    createdAt: '2025-01-10T12:01:00.000Z',
  },
  {
    id: 'notif-7',
    userId: 'user-supporter-1',
    type: 'pledge_confirmed',
    message: 'Your $20 pledge to "Chimurenga Soul" was confirmed.',
    isRead: true,
    linkTo: '/app/history',
    createdAt: '2024-12-05T10:02:00.000Z',
  },
];
