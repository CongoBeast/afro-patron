/**
 * posts.js — seed data for creator posts
 * 4 posts from Tendai, 3 from Rudo
 * Types: 'update' (tied to a campaign) | 'announcement' (general)
 */

export const POSTS = [
  // ── Tendai's posts ──────────────────────────────────────────────────────
  {
    id: 'post-1',
    creatorId: 'user-creator-1',
    campaignId: 'campaign-1',
    type: 'update',
    title: 'Chapter 3 Illustrations — Almost Done!',
    body: "Good news, patrons! Chapter 3 of Mwana WaMambo is nearly complete. The market scene took longer than expected — I wanted to capture every texture of Mbare market in each stall, from the fabric bolts to the stacked tomatoes.\n\nWe're on track for the March deadline. Your support means everything — we're at 75% of our goal and every pledge brings this book one step closer to the children it's meant for.\n\nI'll share a preview of the main spread with $10+ backers in the next update. Thank you!",
    images: [],
    createdAt: '2025-01-12T14:30:00.000Z',
  },
  {
    id: 'post-2',
    creatorId: 'user-creator-1',
    campaignId: null,
    type: 'announcement',
    title: 'New Partnership with Harare City Library',
    body: "Exciting news! Through AfroPatron's community connections, I've been introduced to the Harare City Library — and we've agreed to donate 50 copies of \"Mwana WaMambo\" to their children's reading programme once the campaign is funded.\n\nThis is why your support matters beyond just the book itself. These aren't only copies sold — they're stories that will live on library shelves for years, in the hands of children who need them most.",
    images: [],
    createdAt: '2025-01-08T10:00:00.000Z',
  },
  {
    id: 'post-3',
    creatorId: 'user-creator-1',
    campaignId: 'campaign-2',
    type: 'update',
    title: 'Mbare Mural — Unveiled and Complete! 🎉',
    body: "We did it. The Mbare Community Mural is officially unveiled.\n\nTwelve artists. Three weeks. One incredible wall.\n\nThank you to every single patron who believed in this before the first brushstroke was applied. The community response has been overwhelming — children have been sitting in front of it every day after school. A local grandmother said it was \"the most beautiful thing to happen to this street in 30 years.\"\n\nI'll post a proper photo essay soon. For now: thank you. From the bottom of my heart.",
    images: [],
    createdAt: '2024-09-28T16:00:00.000Z',
  },
  {
    id: 'post-4',
    creatorId: 'user-creator-1',
    campaignId: null,
    type: 'announcement',
    title: 'Welcome to My AfroPatron Page!',
    body: "Hi everyone — I'm Tendai, and I'm so glad you're here.\n\nI've been creating art for 12 years: illustrations, murals, and prints rooted in Zimbabwean life and Shona visual tradition. AfroPatron makes it possible for people like you — wherever you are, whether you're in Harare, in the diaspora, or anywhere in the world — to directly fund the work I'm most passionate about.\n\nFollow along for updates, behind-the-scenes moments, and early previews of work in progress. Every pledge, however small, keeps the studio lights on.",
    images: [],
    createdAt: '2024-01-15T09:00:00.000Z',
  },

  // ── Rudo's posts ────────────────────────────────────────────────────────
  {
    id: 'post-5',
    creatorId: 'user-creator-2',
    campaignId: 'campaign-3',
    type: 'update',
    title: "Track 4 \"Nehanda's Echo\" — Studio Session Recap",
    body: "We spent last Saturday recording the mbira and bass layers for track 4 — \"Nehanda's Echo\". The session musicians were absolutely incredible.\n\nWhen the mbira and the upright bass locked in together, everyone in the studio stopped what they were doing. That's the moment you live for.\n\nWe're at 39% funded — if you haven't shared the campaign link yet, now is the time. Every share brings more patrons into the circle, and every patron brings the album one step closer.",
    images: [],
    createdAt: '2025-01-10T12:00:00.000Z',
  },
  {
    id: 'post-6',
    creatorId: 'user-creator-2',
    campaignId: null,
    type: 'announcement',
    title: 'Ubuntu Unplugged Ep. 22 — "Money, Dignity & the African Middle Class"',
    body: "New episode of Ubuntu Unplugged is live!\n\nThis week I'm joined by economist Dr. Tapiwa Zvobgo to talk about what the emerging African middle class means for cultural production, who gets to create, and how platforms like AfroPatron fit into a broader story about dignity, ownership, and economic self-determination.\n\nWe go deep — this one is worth the full listen. Link in bio, also on YouTube.",
    images: [],
    createdAt: '2025-01-06T08:00:00.000Z',
  },
  {
    id: 'post-7',
    creatorId: 'user-creator-2',
    campaignId: null,
    type: 'announcement',
    title: 'Hello from Bulawayo — I\'m Rudo',
    body: "I'm Rudo — musician, podcast host, and lifelong music lover from Bulawayo.\n\nI joined AfroPatron because I needed a way for listeners of Ubuntu Unplugged, and fans of my music, to support the work directly — without the barriers most global platforms put in front of Zimbabwean creators.\n\nEcoCash, card, whatever works for you — it works here. Let's build something together.",
    images: [],
    createdAt: '2024-03-10T11:00:00.000Z',
  },
];
