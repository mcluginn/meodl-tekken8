import { handleRequest } from '../server.js';

export default async function handler(req, res) {
  if (req.headers['x-matched-path']) {
    req.url = req.headers['x-matched-path'];
  }
  return handleRequest(req, res);
}
