import { handleRequest } from '../server.js';

export default async function handler(req, res) {
  const originalPath = req.headers['x-forwarded-uri'] || 
    (req.headers['x-matched-path'] && !req.headers['x-matched-path'].includes('/api/index') ? req.headers['x-matched-path'] : null) ||
    req.url;
  
  if (originalPath && !originalPath.includes('/api/index')) {
    const qs = (req.url && req.url.includes('?'))
      ? req.url.slice(req.url.indexOf('?'))
      : (req.query && Object.keys(req.query).length > 0 ? '?' + new URLSearchParams(req.query).toString() : '');
    req.url = originalPath.split('?')[0] + qs;
  }
  return handleRequest(req, res);
}

