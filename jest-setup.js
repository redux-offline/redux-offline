/* global fetch */

/*==================================================
                     MOCKING
==================================================*/
// Mocking the global.fetch included in React Native
global.fetch = jest.fn();

function _setUpMockResponse(mockType) {
  return (body, extraOptions = {}) => {
    if (typeof body !== 'string') {
      body = JSON.stringify(body);
    }

    fetch[mockType](() =>
      Promise.resolve({
        ...extraOptions,
        ok: true,
        headers: {
          get: () => ['json']
        },
        json: () => Promise.resolve(JSON.parse(body))
      }));
  };
}

// Helpers to mock a success response
fetch.mockResponseSuccess = _setUpMockResponse('mockImplementation');
fetch.mockResponseSuccessOnce = _setUpMockResponse('mockImplementationOnce');

// Helpers to mock a failure response
fetch.mockResponseFailureOnce = error => {
  fetch.mockImplementationOnce(() => Promise.reject(error));
};

fetch.mockResponseFailure = error => {
  fetch.mockImplementation(() => Promise.reject(error));
};
