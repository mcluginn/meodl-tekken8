import { handleRequest } from '../../server.js';

export default async function handler(req, res) {
  req.url = '/api/attendance/reset';
  return handleRequest(req, res);
}
