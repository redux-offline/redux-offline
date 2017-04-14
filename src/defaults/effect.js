// @flow
/*global fetch*/

import type { OfflineAction } from '../types';

export function NetworkError(response: {} | string, status: number) {
  this.name = 'NetworkError';
  this.status = status;
  this.response = response;
}

//$FlowFixMe
NetworkError.prototype = Error.prototype;
NetworkError.prototype.status = null;

const tryParseJSON = (json: string): ?{} => {
  if (!json) {
    return null;
  }
  try {
    return JSON.parse(json);
  } catch (e) {
    throw new Error(`Failed to parse unexpected JSON response: ${json}`);
  }
};

const getResponseBody = (res: any): Promise<{} | string> => {
  const contentType = res.headers.get('content-type');
  return contentType.indexOf('json') >= 0 ? res.text().then(tryParseJSON) : res.text();
};

export default (effect: any, _action: OfflineAction): Promise<any> => {
  const { url, ...options } = effect;
  const headers = { 'content-type': 'application/json', ...options.headers };
  return fetch(url, { ...options, headers }).then(res => {
    if (res.ok) {
      return getResponseBody(res);
    } else {
      return getResponseBody(res).then(body => {
        throw new NetworkError(body || '', res.status);
      });
    }
  });
};
