// flow
import { OfflineAction } from '../types';

const MAX_RETRIES = 10;
export default (error: Error, action: OfflineAction, retries: number = 0): boolean => {
  console.log('discard?', error.status);
  return error.status && (error.status >= 400 && error.status < 500);
};
