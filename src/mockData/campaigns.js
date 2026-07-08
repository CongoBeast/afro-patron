/**
 * campaigns.js — seed data for campaigns
 * 2 campaigns per creator:
 *   Tendai: 1 active (75% funded) + 1 completed
 *   Rudo:   1 active (39% funded) + 1 draft
 */

export const CAMPAIGNS = [
  // ── Tendai's campaigns ──────────────────────────────────────────────────
  {
    id: 'campaign-1',
    creatorId: 'user-creator-1',
    title: "Children's Book: \"Mwana WaMambo\"",
    description:
      "A richly illustrated children's book celebrating Zimbabwean folklore — the story of the young prince who brought rain back to the land. Every page features full-colour illustrations rooted in traditional Shona visual art.\n\nFunds will cover professional printing (first run of 500 copies), editorial work, and digital distribution on platforms accessible to readers in Zimbabwe and the diaspora. Patrons who pledge $25+ will receive a signed copy of the first print run.",
    goalAmount: 3000,
    currency: 'USD',
    currentAmount: 2250,
    deadline: '2025-03-31T00:00:00.000Z',
    status: 'active',    // 'active' | 'completed' | 'draft'
    coverImageUrl: null,
    backerCount: 31,
    createdAt: '2024-11-01T09:00:00.000Z',
  },
  {
    id: 'campaign-2',
    creatorId: 'user-creator-1',
    title: 'Mbare Community Mural',
    description:
      "A large-scale mural celebrating the resilience and creativity of Mbare township — one of Zimbabwe's most historically rich communities. The project brought together 12 local artists over three weeks to cover an 80-square-metre wall at the market entrance.\n\nThe mural is now complete and has become a beloved landmark in the community. This campaign is closed — thank you to every patron who made it happen.",
    goalAmount: 1500,
    currency: 'USD',
    currentAmount: 1500,
    deadline: '2024-09-30T00:00:00.000Z',
    status: 'completed',
    coverImageUrl: null,
    backerCount: 22,
    createdAt: '2024-07-01T09:00:00.000Z',
  },

  // ── Rudo's campaigns ────────────────────────────────────────────────────
  {
    id: 'campaign-3',
    creatorId: 'user-creator-2',
    title: 'Debut Album: "Chimurenga Soul"',
    description:
      "My debut album blends traditional chimurenga rhythms with contemporary Afrobeats and jazz. Ten original tracks, recorded at ZimStudios with live session musicians. Funds will cover studio time, mastering, cover artwork, and a physical CD run.\n\nAll backers get early digital access two weeks before public release. $50+ backers get a signed CD posted to them anywhere in Zimbabwe or to diaspora addresses.",
    goalAmount: 2500,
    currency: 'USD',
    currentAmount: 980,
    deadline: '2025-04-30T00:00:00.000Z',
    status: 'active',
    coverImageUrl: null,
    backerCount: 19,
    createdAt: '2024-12-01T09:00:00.000Z',
  },
  {
    id: 'campaign-4',
    creatorId: 'user-creator-2',
    title: 'Podcast Studio Upgrade',
    description:
      "Upgrading Ubuntu Unplugged from a basic home setup to proper podcast-grade equipment: an XLR condenser microphone, a Focusrite audio interface, acoustic foam panels, and a dedicated recording corner.\n\nThis will dramatically improve audio quality for all future episodes. Currently in draft — launching soon.",
    goalAmount: 800,
    currency: 'USD',
    currentAmount: 0,
    deadline: '2025-05-15T00:00:00.000Z',
    status: 'draft',
    coverImageUrl: null,
    backerCount: 0,
    createdAt: '2025-01-05T09:00:00.000Z',
  },
];
