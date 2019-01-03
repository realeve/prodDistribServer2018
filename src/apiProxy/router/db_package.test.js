const lib = require('./db_package');

test('班次自动确定', () => {
  expect(lib.getTimeRange(630)).toBe(0);
  expect(lib.getTimeRange(730)).toBe(0);
  expect(lib.getTimeRange(1430)).toBe(1);
  expect(lib.getTimeRange(1500)).toBe(1);
  expect(lib.getTimeRange(1559)).toBe(1);
  expect(lib.getTimeRange(629)).toBe(2);
  expect(lib.getTimeRange(731)).toBe(2);
  expect(lib.getTimeRange(1429)).toBe(2);

  expect(lib.getWorkTypes(630)).toBe('白班');
  expect(lib.getWorkTypes(730)).toBe('白班');
  expect(lib.getWorkTypes(1430)).toBe('中班');
  expect(lib.getWorkTypes(1500)).toBe('中班');
  expect(lib.getWorkTypes(1559)).toBe('中班');
  expect(lib.getWorkTypes(629)).toBe('');
  expect(lib.getWorkTypes(731)).toBe('');
  expect(lib.getWorkTypes(1429)).toBe('');
  expect(lib.getWorkTypes(1560)).toBe('');
});

test('班次手动确定', () => {
  expect(lib.getWorkTypesManual(630)).toBe('白班');
  expect(lib.getWorkTypesManual(730)).toBe('白班');
  expect(lib.getWorkTypesManual(1430)).toBe('中班');
  expect(lib.getWorkTypesManual(1500)).toBe('中班');
  expect(lib.getWorkTypesManual(1559)).toBe('中班');
  expect(lib.getWorkTypesManual(629)).toBe('');
  expect(lib.getWorkTypesManual(731)).toBe('白班');
  expect(lib.getWorkTypesManual(1429)).toBe('白班');
  expect(lib.getWorkTypesManual(1560)).toBe('中班');

  expect(lib.getWorkTypesManual()).toBe('白班');
});
