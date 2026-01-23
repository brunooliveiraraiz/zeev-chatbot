// Vercel Serverless Function - Catch-all routes
export default async function handler(req, res) {
  // Import the Express app dynamically
  const { default: app } = await import('../apps/api/dist/server.js');

  // Let Express handle the request
  return app(req, res);
}
