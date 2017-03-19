// @flow
import type { OfflineAction, Retry } from '../types';

export default (_action: OfflineAction, _retries: number): ?Retry => {
  return null;
};
