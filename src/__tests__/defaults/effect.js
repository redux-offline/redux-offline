import effectReconciler from '../../defaults/effect';

function fetch(body) {
  return Promise.resolve({
    ok: true,
    headers: { get: jest.fn(() => 'application/json') },
    text: jest.fn(() => Promise.resolve(body))
  });
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

  global.fetch = jest.fn((url, options) => {
    expect(options.headers['content-type']).toEqual('application/json');
    expect(JSON.parse(options.body)).toEqual(body);

    return fetch('');
  });

  return effectReconciler({ body: JSON.stringify(body) }).then(body2 => {
    expect(body2).toEqual(null);
  });
});

test('effector accept JSON object', () => {
  const json = {
    email: 'email@example.com',
    password: 'p4ssw0rd'
  };

  global.fetch = jest.fn((url, options) => {
    expect(options.headers['content-type']).toEqual('application/json');
    expect(JSON.parse(options.body)).toEqual(json);

    return fetch('');
  });

  return effectReconciler({ json }).then(body2 => {
    expect(body2).toEqual(null);
  });
});

test('effector rejects invalid JSON object', () => {
  const circularObject = {};
  circularObject.self = circularObject;

  return effectReconciler({ json: circularObject }).catch(error => {
    expect(error).toBeInstanceOf(TypeError);
  });
});

test('effector receive JSON and response objects', () => {
  const body = { id: 1234 };

  global.fetch = jest.fn(() => fetch(JSON.stringify(body)));

  return effectReconciler({}).then(body2 => {
    expect(body2).toEqual(body);
  });
});
