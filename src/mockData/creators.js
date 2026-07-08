/**
 * creators.js — seed data for creator profiles
 * Tendai: KYC verified, Art & Illustration
 * Rudo:   KYC unverified, Music & Podcasts
 */

export const CREATOR_PROFILES = [
  {
    userId: 'user-creator-1',
    displayName: 'Tendai Moyo',
    uniqueSlug: 'tendai-moyo',
    bio: "Illustrator & visual storyteller based in Harare. I create vibrant African-inspired artwork, children's book illustrations, and community murals. Every painting tells a story rooted in Zimbabwean heritage.",
    category: 'Art & Illustration',
    avatarUrl: null,       // No real image — components fall back to initials
    coverImageUrl: null,
    socialLinks: {
      instagram: 'https://instagram.com/tendai.moyo',
      twitter:   'https://twitter.com/tendaimoyo',
      website:   'https://tendaimoyo.art',
    },
    kycStatus: 'verified',   // 'unverified' | 'pending' | 'verified'
    payoutMethods: [
      {
        type: 'ecocash',
        details: { phone: '+263 77 123 4567', name: 'Tendai Moyo' },
        verified: true,
      },
      {
        type: 'bank',
        details: { bank: 'CBZ Bank', account: '****4821', branch: 'Harare' },
        verified: true,
      },
    ],
    totalEarned: 4850.00,
    supporterCount: 47,
    fundingLink: 'https://afropatron.zw/support/tendai-moyo',
    joinedAt: '2024-01-15T08:00:00.000Z',
  },
  {
    userId: 'user-creator-2',
    displayName: 'Rudo Chikwanda',
    uniqueSlug: 'rudo-chikwanda',
    bio: "Independent musician, podcast host & audio producer from Bulawayo. I blend mbira, jazz, and Afropop into something entirely my own. My podcast 'Ubuntu Unplugged' explores African philosophy & modern life — one honest conversation at a time.",
    category: 'Music & Podcasts',
    avatarUrl: null,
    coverImageUrl: null,
    socialLinks: {
      instagram: 'https://instagram.com/rudo.sounds',
      youtube:   'https://youtube.com/@rudochikwanda',
    },
    kycStatus: 'unverified',
    payoutMethods: [
      {
        type: 'ecocash',
        details: { phone: '+263 71 987 6543', name: 'Rudo Chikwanda' },
        verified: false,
      },
    ],
    totalEarned: 1620.00,
    supporterCount: 23,
    fundingLink: 'https://afropatron.zw/support/rudo-chikwanda',
    joinedAt: '2024-03-10T10:00:00.000Z',
  },
];
