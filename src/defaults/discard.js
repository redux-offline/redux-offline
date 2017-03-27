// flow
import { OfflineAction } from '../types';

export default (error: Error, action: OfflineAction, _retries: number = 0): boolean => {
  console.log('discard?', error.status);
  return error.status && (error.status >= 400 && error.status < 500);
};
