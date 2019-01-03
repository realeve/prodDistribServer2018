module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js','jsx','json', 'ts', 'tsx'],
  transform: { '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest' },
  testMatch: ['**/?(*.)(spec|test|e2e).(j|t)s?(x)'],
  collectCoverage: true,
  globals: {
    'ts-jest': {
      useBabelrc: true
    }
  }
};
