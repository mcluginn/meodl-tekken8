import { handleRequest } from '../../server.js';

export default async function handler(req, res) {
  req.url = '/api/attendance/health';
  return handleRequest(req, res);
}
