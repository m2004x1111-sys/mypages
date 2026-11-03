import type { LocalMusicTrack } from '@lib/local-music';

/**
 * 全站音乐歌单：在这里修改歌名、顺序、封面和歌词。
 * 音频放在 public/music/；这里的路径省略 public，例如 /music/12-13.mp3。
 * 继续添加歌曲：复制一份下面的 { ... }，修改 name 和 url 即可。
 * cover（封面）、artist（歌手）、lrc（歌词）可留空。
 * 歌词示例：lrc: '/music/12-13.lrc'；留空 url 可以暂时隐藏该首歌。
 */
export const musicTracks: LocalMusicTrack[] = [
  {
    name: 'ハッピーシンセサイザ',
    artist: 'mmj',
    url: '/music/ハッピーシンセサイザ.MP3',
    cover: '/music/index/1.png',
    lrc: '',
  },
  {
    name: 'メルト',
    artist: 'かぐや姫',
    url: '/music/メルト.MP3',
    cover: '/music/index/2.png',
    lrc: '',
  },
  { name: '私、私たち', artist: 'mmj', url: '/music/w1.MP3', cover: '/music/index/3.png', lrc: '' },
];
