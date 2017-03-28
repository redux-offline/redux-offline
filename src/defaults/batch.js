import type { Outbox } from '../types';
export default (outbox: Outbox): Outbox => {
  if (outbox.length > 0) {
    return [outbox[0]];
  }
  return [];
};
