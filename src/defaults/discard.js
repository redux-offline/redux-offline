// flow
import { OfflineAction } from '../types';

const MAX_RETRIES = 10;
export default (error: Error, action: OfflineAction, retries: number = 0): boolean => {
  if ('status' in error) {
    if (error.status >= 400 && error.status < 500) {
      return true;
    }
  }
  return false;
};
