/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!main.ts',
    '!**/cli/**',
    '!**/migrations/**',
    '!**/seed-data.ts',
    '!**/seed-product-images.ts',
    '!**/data-source.ts',
    '!**/bulk-load.service.ts',
    '!test/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
