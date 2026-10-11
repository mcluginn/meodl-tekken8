import { handleRequest } from '../../../server.js';

export default async function handler(req, res) {
  req.url = '/api/engday/attendance/events';
  return handleRequest(req, res);
}
