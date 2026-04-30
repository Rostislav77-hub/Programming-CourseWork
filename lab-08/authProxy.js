'use strict';

class ApiKeyStrategy {
  constructor(key) { this.key = key; }
  apply(headers)   { return { ...headers, 'X-API-Key': this.key }; }
  get name()       { return 'ApiKey'; }
}

class JwtStrategy {
  constructor(token, refresh) { this.token = token; this._refresh = refresh; }
  apply(headers)  { return { ...headers, 'Authorization': `Bearer ${this.token}` }; }
  renewToken()    { this.token = this._refresh(); console.log('[JWT] новый токен:', this.token); }
  get name()      { return 'JWT'; }
}

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

class LoggingProxy {
  constructor(client) { this._client = client; }

  async request(req) {
    console.log(`[LOG] → ${req.method || 'GET'} ${req.url}`);
    const res = await this._client.request(req);
    console.log(`[LOG] ← ${res.status}`);
    return res;
  }
}

class RateLimitProxy {
  constructor(client, max) { this._client = client; this._max = max; this._n = 0; }

  request(req) {
    if (this._n >= this._max) {
      console.log(`[RATE] лимит ${this._max} исчерпан`);
      return { status: 429, body: { message: 'Too Many Requests' } };
    }
    console.log(`[RATE] запрос ${++this._n}/${this._max}`);
    return this._client.request(req);
  }
}

class AuthProxy {
  constructor(client, strategy) { this._client = client; this._strategy = strategy; }

  setStrategy(s) { console.log(`[AUTH] смена: ${this._strategy.name} → ${s.name}`); this._strategy = s; }

  async request(req) {
    const authed = { ...req, headers: this._strategy.apply(req.headers || {}) };
    let response = await this._client.request(authed);

    if (response.status === 401 && this._strategy.name === 'JWT') {
      console.log('[AUTH] 401 → обновляю токен...');
      this._strategy.renewToken();
      response = await this._client.request({ ...req, headers: this._strategy.apply({}) });
    }
    return response;
  }
}