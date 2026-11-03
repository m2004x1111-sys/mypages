import type { MetingSong } from './meting';

/** Songs hosted in public/music, or at a direct audio URL. */
export interface LocalMusicTrack {
  name: string;
  url: string;
  artist?: string;
  cover?: string;
  /** A /music/song.lrc path, an HTTPS URL, or inline timestamped LRC text. */
  lrc?: string;
}

/** Empty URLs are unpublished entries and must never become playable tracks. */
export function toLocalMusicTracks(tracks: LocalMusicTrack[]): MetingSong[] {
  return tracks.flatMap((track) => {
    const url = track.url.trim();
    if (!url) return [];
    return [
      {
        name: track.name.trim() || url.split('/').pop() || 'Music',
        artist: track.artist?.trim() ?? '',
        url,
        pic: track.cover?.trim() ?? '',
        lrc: track.lrc?.trim() ?? '',
      },
    ];
  });
}
