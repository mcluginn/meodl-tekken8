import { handleRequest } from '../../server.js';

export default async function handler(req, res) {
  // Preserve query parameters if present
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  req.url = '/api/attendance/events' + qs;
  return handleRequest(req, res);
}
