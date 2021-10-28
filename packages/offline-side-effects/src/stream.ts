import { Stream, NextFn, Context } from './types';
import { createMiddleware } from './middleware';

export function createStream(context: Context): Stream {
  const {
    updater: [state],
    options
  } = context;
  const { processOutbox, send, retry } = createMiddleware(context);

  const stream = options.alterStream([processOutbox, send, retry], context);

  const start = () => {
    let i = 0;
    const next: NextFn<any> = async (...prev) => {
      const current = stream[i];
      if (current) {
        i++;
        await current(next, ...prev);
      } else if (state.outbox.length > 0) {
        start();
      }
    };

    next(null).catch(console.error);
  };

  return { start };
}
