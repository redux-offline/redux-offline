import defaultEffect, { getHeaders } from '../effect';

function fetch(body) {
  return Promise.resolve({
    ok: true,
    headers: { get: jest.fn(() => 'application/json') },
    text: jest.fn(() => Promise.resolve(body))
  } as unknown as Response);
}

const meta = {
  effect: { url: '/any_effect'},
  commit: {},
  rollback: {}
}

let globalFetch;

beforeAll(() => {
  globalFetch = global.fetch;
});

afterAll(() => {
  global.fetch = globalFetch;
});

test('effector accept JSON stringified object', () => {
  const body = {
    email: 'email@example.com',
    password: 'p4ssw0rd'
  };

  // @ts-ignore
  global.fetch = jest.fn((url, options) => {
    expect(options.headers['content-type']).toEqual('application/json');
    expect(JSON.parse(options.body as string)).toEqual(body);

    return fetch('');
  })

  return defaultEffect({ body: JSON.stringify(body) }, { meta }).then(body2 => {
    expect(body2).toEqual(null);
  });
});

test('effector accept JSON object', () => {
  const json = {
    email: 'email@example.com',
    password: 'p4ssw0rd'
  };

  // @ts-ignore
  global.fetch = jest.fn((url, options) => {
    expect(options.headers['content-type']).toEqual('application/json');
    expect(JSON.parse(options.body as string)).toEqual(json);

    return fetch('');
  });

  return defaultEffect({ json }, { meta }).then(body2 => {
    expect(body2).toEqual(null);
  });
});

test('effector rejects invalid JSON object', () => {
  const circularObject = {};
  // @ts-ignore
  circularObject.self = circularObject;

  return defaultEffect({ json: circularObject }, { meta }).catch(error => {
    expect(error).toBeInstanceOf(TypeError);
  });
});

test('effector receive JSON and response objects', () => {
  const body = { id: 1234 };

  global.fetch = jest.fn(() => fetch(JSON.stringify(body)));

  return defaultEffect({}, { meta }).then(body2 => {
    expect(body2).toEqual(body);
  });
});

test('effector accepts content-type and Content-Type headers', () => {
  const otherHeaders = { 'other-one': 'other-one', 'other-two': 'other-two' };
  const formUrlEncoded = 'application/x-www-form-urlencoded';

  const noHeaders = undefined;
  const capitalizedHeaders = {
    'Content-Type': formUrlEncoded,
    ...otherHeaders
  };
  const lowerCasedHeaders = { 'content-type': formUrlEncoded, ...otherHeaders };

  expect(getHeaders(noHeaders)).toEqual({ 'content-type': 'application/json' });
  expect(getHeaders(capitalizedHeaders)).toEqual({
    'content-type': formUrlEncoded,
    ...otherHeaders
  });
  expect(getHeaders(lowerCasedHeaders)).toEqual({
    'content-type': formUrlEncoded,
    ...otherHeaders
  });
});

test('effector receives object as multipart/form-data', () => {
  const body = new FormData();
  body.append('id', '1234');
  body.append('name', 'john');
  body.forEach((value, key) => {
    body[key] = value;
  });

  // @ts-ignore
  global.fetch = jest.fn((url, options) => {
    expect(options.headers['content-type']).toEqual('multipart/form-data');
    expect(options.body).toBeInstanceOf(FormData);
    //@ts-ignore
    expect(options.body.get('id')).toBe('1234');
    return fetch('');
  });

  return defaultEffect({
    body,
    headers: { 'content-type': 'multipart/form-data' }
  }, { meta }).then(body2 => {
    expect(body2).toEqual(null);
  });
});
