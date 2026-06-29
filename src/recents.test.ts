import { expect, test } from 'vitest';
import { mergeRecent } from './recents';

test('adds to front, dedupes, caps length', () => {
  expect(mergeRecent(['/b', '/c'], '/a', 8)).toEqual(['/a', '/b', '/c']);
  expect(mergeRecent(['/a', '/b'], '/b', 8)).toEqual(['/b', '/a']);
  expect(mergeRecent(['/a', '/b'], '/c', 2)).toEqual(['/c', '/a']);
});
