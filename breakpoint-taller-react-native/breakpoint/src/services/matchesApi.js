import { request } from './httpClient';
import { ENDPOINTS, REMOTE_PAGE_LIMIT } from '../constants/config';
import { fromRemotePost, toRemotePayload } from './matchMapper';

export async function fetchMatches({ token, limit = REMOTE_PAGE_LIMIT } = {}) {
  const data = await request(`${ENDPOINTS.collection}?limit=${limit}&skip=0`, { token });
  const posts = Array.isArray(data?.posts) ? data.posts : [];
  return posts.map(fromRemotePost).filter(Boolean);
}

export async function fetchMatchById(remoteId, { token } = {}) {
  const post = await request(ENDPOINTS.detail(remoteId), { token });
  return fromRemotePost(post);
}

export async function createMatch(match, { token } = {}) {
  const post = await request(ENDPOINTS.create, {
    method: 'POST',
    body: toRemotePayload(match),
    token,
  });
  return fromRemotePost(post);
}

export async function updateMatch(remoteId, match, { token } = {}) {
  const post = await request(ENDPOINTS.update(remoteId), {
    method: 'PATCH',
    body: toRemotePayload(match),
    token,
  });
  return fromRemotePost(post);
}

export async function deleteMatch(remoteId, { token } = {}) {
  return request(ENDPOINTS.remove(remoteId), { method: 'DELETE', token });
}
