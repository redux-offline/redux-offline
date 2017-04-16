/*==================================================
                   IMPORTS / SETUP
==================================================*/
import defaultConfig from '../defaults';
import { applyDefaults } from '../config';
/*==================================================
                        TESTS
==================================================*/
describe('config', () => {
  it(`should take in a user config object and merge it as
    an override with a default config object`, () => {
    const userConfig = { rick: 'morty' };
    const expectedConfig = { ...defaultConfig, ...userConfig };
    expect(expectedConfig).toEqual(applyDefaults(userConfig));
  });
});
