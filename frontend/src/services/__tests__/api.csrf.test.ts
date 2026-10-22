import { afterEach, describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import client from '../api';

const originalAdapter = client.defaults.adapter;
afterEach(() => {
  client.defaults.adapter = originalAdapter;
});

function response(config: InternalAxiosRequestConfig, data: unknown, status = 200) {
  return { config, data, status, statusText: String(status), headers: new AxiosHeaders() };
}

describe('Cookie CSRF request flow', () => {
  it('bootstraps a token for writes and shares concurrent bootstrap requests', async () => {
    const calls: InternalAxiosRequestConfig[] = [];
    client.defaults.adapter = async (config) => {
      calls.push(config);
      return response(config, config.url === 'auth/csrf/' ? { csrfToken: 'masked-token' } : {});
    };
    await Promise.all([client.post('auth/login/', {}), client.patch('blog-posts/example/', {})]);
    expect(calls.filter((config) => config.url === 'auth/csrf/')).toHaveLength(1);
    const writes = calls.filter((config) => config.method !== 'get');
    expect(writes).toHaveLength(2);
    for (const config of writes) {
      expect(config.headers.get('X-CSRFToken')).toBe('masked-token');
      expect(config.withCredentials).toBe(true);
    }
    await client.delete('blog-posts/example/');
    expect(calls.filter((config) => config.url === 'auth/csrf/')).toHaveLength(2);
  });

  it('does not bootstrap read requests', async () => {
    const urls: (string | undefined)[] = [];
    client.defaults.adapter = async (config) => {
      urls.push(config.url);
      return response(config, {});
    };
    await client.get('blog-posts/');
    expect(urls).toEqual(['blog-posts/']);
  });

  it('blocks the write when bootstrap fails and permits a subsequent retry', async () => {
    const urls: (string | undefined)[] = [];
    let unavailable = true;
    client.defaults.adapter = async (config) => {
      urls.push(config.url);
      if (unavailable) throw new AxiosError('Unavailable', 'ERR_NETWORK', config);
      return response(config, { csrfToken: 'recovered-token' });
    };
    await expect(client.post('auth/login/', {})).rejects.toBeDefined();
    expect(urls).toEqual(['auth/csrf/']);
    unavailable = false;
    await client.post('auth/login/', {});
    expect(urls).toEqual(['auth/csrf/', 'auth/csrf/', 'auth/login/']);
  });

  it('supplies CSRF to cookie refresh and retries the original request', async () => {
    let expired = true;
    const calls: InternalAxiosRequestConfig[] = [];
    client.defaults.adapter = async (config) => {
      calls.push(config);
      if (config.url === 'auth/csrf/') return response(config, { csrfToken: 'refresh-csrf' });
      if (config.url === 'auth/token/refresh/') {
        expect(config.headers.get('X-CSRFToken')).toBe('refresh-csrf');
        expired = false;
      } else if (expired) {
        throw new AxiosError(
          'Expired',
          'ERR_BAD_REQUEST',
          config,
          undefined,
          response(config, {}, 401)
        );
      }
      return response(config, {});
    };
    await expect(client.get('notifications/')).resolves.toHaveProperty('status', 200);
    expect(calls.map((config) => config.url)).toEqual([
      'notifications/',
      'auth/csrf/',
      'auth/token/refresh/',
      'notifications/',
    ]);
  });
});
