import { handleRequest } from '../../../server.js';

export default async function handler(req, res) {
  req.url = '/api/engday/attendance/sync';
  return handleRequest(req, res);
}
