import { handleRequest } from '../../../server.js';

export default async function handler(req, res) {
  req.url = '/api/engday/attendance/state';
  return handleRequest(req, res);
}
