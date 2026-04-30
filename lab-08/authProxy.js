'use strict';

function mockFetch(url, { method = 'GET', headers = {} } = {}) {
  const key   = headers['X-API-Key'];
  const token = (headers['Authorization'] || '').replace('Bearer ', '');

  if (key)   return key   === 'real-key'   ? ok(url, method) : res(403, 'Bad API key');
  if (token) return token === 'expired'    ? res(401, 'Token expired')
           : token.startsWith('fresh')     ? ok(url, method)
           : res(403, 'Bad token');

  return res(403, 'No credentials');
}

const ok  = (url, m) => ({ status: 200, body: { ok: true, url, method: m } });
const res = (status, message) => ({ status, body: { message } });

class BaseHttpClient {
  constructor(fetchFn) { this._fetch = fetchFn; }

  request({ url, method = 'GET', headers = {}, body = null }) {
    return this._fetch(url, { method, headers, body });
  }
}