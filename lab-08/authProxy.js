'use strict';

class ApiKeyStrategy {
  constructor(key) { this.key = key; }
  apply(headers)   { return { ...headers, 'X-API-Key': this.key }; }
  get name()       { return 'ApiKey'; }
}

class JwtStrategy {
  constructor(token, refresh) { this.token = token; this._refresh = refresh; }
  apply(headers)  { return { ...headers, 'Authorization': `Bearer ${this.token}` }; }
  renewToken()    { this.token = this._refresh(); console.log('[JWT] новий токен:', this.token); }
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
      console.log(`[RATE] ліміт ${this._max} запитів вичерпано`);
      return { status: 429, body: { message: 'Too Many Requests' } };
    }
    console.log(`[RATE] запит ${++this._n}/${this._max}`);
    return this._client.request(req);
  }
}

class AuthProxy {
  constructor(client, strategy) { this._client = client; this._strategy = strategy; }

  setStrategy(s) { console.log(`[AUTH] заміна: ${this._strategy.name} → ${s.name}`); this._strategy = s; }

  async request(req) {
    const authed = { ...req, headers: this._strategy.apply(req.headers || {}) };
    let response = await this._client.request(authed);

    if (response.status === 401 && this._strategy.name === 'JWT') {
      console.log('[AUTH] 401 → оновляю токен...');
      this._strategy.renewToken();
      response = await this._client.request({ ...req, headers: this._strategy.apply({}) });
    }
    return response;
  }
}

class ApiService {
  constructor(http) { this._http = http; }
  get(url)         { return this._http.request({ url, method: 'GET' }); }
  post(url, body)  { return this._http.request({ url, method: 'POST', body }); }
}

(async () => {
  const jwt     = new JwtStrategy('expired', () => 'fresh-token-' + Date.now());
  const apiKey  = new ApiKeyStrategy(process.env.API_KEY || 'real-key');
  const chain   = new AuthProxy(new RateLimitProxy(new LoggingProxy(new BaseHttpClient(mockFetch)), 3), jwt);
  const service = new ApiService(chain);

  console.log('\n── Тест 1: JWT 401 → автооновлення токена ─────────────');
  console.log(await service.get('/api/profile'));

  console.log('\n── Тест 2: заміна стратегії → API Key ───────────────────');
  chain.setStrategy(apiKey);
  console.log(await service.post('/api/items', { name: 'test' }));

  console.log('\n── Тест 3: Rate Limit (3-й запит — останній) ─────────');
  console.log(await service.get('/api/data')); 

  console.log('\n── Тест 4: 4-й запит → 429 ────────────────────────────');
  console.log(await service.get('/api/data'));
})();