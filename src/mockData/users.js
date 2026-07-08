/**
 * users.js — seed data for demo users
 * 2 creators + 2 supporters
 * Role determines which layout/nav the AppShell renders.
 */

export const DEMO_USERS = [
  {
    id: 'user-creator-1',
    name: 'Tendai Moyo',
    email: 'tendai@afropatron.demo',
    role: 'creator',
  },
  {
    id: 'user-creator-2',
    name: 'Rudo Chikwanda',
    email: 'rudo@afropatron.demo',
    role: 'creator',
  },
  {
    id: 'user-supporter-1',
    name: 'Chipo Ndlovu',
    email: 'chipo@afropatron.demo',
    role: 'supporter',
  },
  {
    id: 'user-supporter-2',
    name: 'Farai Mutasa',
    email: 'farai@afropatron.demo',
    role: 'supporter',
  },
];

/** Primary demo creator — used by loginAs('creator') */
export const DEMO_CREATOR_USER  = DEMO_USERS[0]; // Tendai Moyo

/** Primary demo supporter — used by loginAs('supporter') */
export const DEMO_SUPPORTER_USER = DEMO_USERS[2]; // Chipo Ndlovu
