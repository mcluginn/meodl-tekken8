import { handleRequest } from '../../../server.js';

export default async function handler(req, res) {
  req.url = '/api/engday/attendance/stream';
  return handleRequest(req, res);
}
