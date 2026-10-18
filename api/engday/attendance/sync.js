import { handleRequest } from '../../../server.js';

export default async function handler(req, res) {
  const qs = (req.url && req.url.includes('?'))
    ? req.url.slice(req.url.indexOf('?'))
    : (req.query && Object.keys(req.query).length > 0 ? '?' + new URLSearchParams(req.query).toString() : '');
  req.url = '/api/engday/attendance/sync' + qs;
  return handleRequest(req, res);
}
