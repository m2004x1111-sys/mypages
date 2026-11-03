import assert from 'node:assert/strict';
import { test } from 'node:test';
import { toLocalMusicTracks } from './local-music';

test('unpublished entries are skipped while local song order and metadata are preserved', () => {
  const tracks = toLocalMusicTracks([
    { name: 'Later', url: ' ' },
    { name: ' Tokyo ', url: ' /music/tokyo.mp3 ', cover: '/music/tokyo.jpg', lrc: '/music/tokyo.lrc' },
    { name: 'Next', artist: ' Artist ', url: '/music/next.MP3' },
  ]);
  assert.deepEqual(tracks, [
    { name: 'Tokyo', artist: '', url: '/music/tokyo.mp3', pic: '/music/tokyo.jpg', lrc: '/music/tokyo.lrc' },
    { name: 'Next', artist: 'Artist', url: '/music/next.MP3', pic: '', lrc: '' },
  ]);
});

test('direct URLs and inline lyrics remain usable without a platform playlist API', () => {
  const [track] = toLocalMusicTracks([{ name: '', url: 'https://example.com/song.mp3', lrc: '[00:01.00]Hello' }]);
  assert.equal(track.name, 'song.mp3');
  assert.equal(track.url, 'https://example.com/song.mp3');
  assert.equal(track.lrc, '[00:01.00]Hello');
});
