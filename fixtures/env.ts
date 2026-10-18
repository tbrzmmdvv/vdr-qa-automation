export const env = {
  webUrl: process.env.WEB_URL ?? 'https://virtual-data-room-ten.vercel.app',
  apiUrl: process.env.API_URL ?? 'https://virtual-data-room-production.up.railway.app',
  owner: {
    email: process.env.OWNER_EMAIL ?? 'john@example.com',
    password: process.env.OWNER_PASSWORD ?? 'johnpass',
    name: 'John Doe',
  },
  viewer: {
    email: process.env.VIEWER_EMAIL ?? 'viewer@example.com',
    password: process.env.VIEWER_PASSWORD ?? 'viewerpass',
  },
};
