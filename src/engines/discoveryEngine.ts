import { Album, ListenLog } from '../types';

export type DiscoveryMode =
  | 'choose_for_me'
  | 'blind_pull'
  | 'unplayed'
  | 'fresh_additions'
  | 'genre'
  | 'decade'
  | 'genre_era';

export interface DiscoveryCandidate {
  album: Album;
  reason: string;
  playCount: number;
  lastPlayed?: string;
}

export function pickRandomItems<T>(items: T[], count: number): T[] {
  if (items.length <= count) return [...items];
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function runDiscovery(
  mode: DiscoveryMode,
  albums: Album[],
  logs: ListenLog[],
  options?: { genre?: string; decade?: string }
): DiscoveryCandidate[] {
  if (albums.length === 0) return [];

  // Compute play stats dynamically from logs
  const albumPlayCounts = new Map<string, { count: number; lastPlayed?: string }>();
  for (const album of albums) {
    albumPlayCounts.set(album.id, { count: 0 });
  }
  for (const log of logs) {
    const stat = albumPlayCounts.get(log.recordId);
    if (stat) {
      stat.count += 1;
      if (!stat.lastPlayed || new Date(log.listenedAt) > new Date(stat.lastPlayed)) {
        stat.lastPlayed = log.listenedAt;
      }
    }
  }

  const getCandidate = (album: Album, reason: string): DiscoveryCandidate => {
    const stat = albumPlayCounts.get(album.id);
    return {
      album,
      reason,
      playCount: stat?.count || 0,
      lastPlayed: stat?.lastPlayed,
    };
  };

  switch (mode) {
    case 'blind_pull': {
      // Small group of randomly selected records (3 records)
      const selected = pickRandomItems(albums, 3);
      return selected.map((album) => {
        const stat = albumPlayCounts.get(album.id);
        const reason =
          stat && stat.count === 0
            ? 'Unplayed selection from shelf'
            : album.edition
            ? `Edition: ${album.edition}`
            : 'Blind pull from shelf';
        return getCandidate(album, reason);
      });
    }

    case 'unplayed': {
      // Prioritize records with zero listen logs
      const unplayedAlbums = albums.filter(
        (a) => (albumPlayCounts.get(a.id)?.count || 0) === 0
      );
      if (unplayedAlbums.length === 0) {
        // Return empty so the UI can explicitly show the "All records have been played" empty state
        return [];
      }
      const picked = pickRandomItems(unplayedAlbums, Math.min(3, unplayedAlbums.length));
      return picked.map((album) => getCandidate(album, 'Unplayed record'));
    }

    case 'fresh_additions': {
      // Prioritize recently added records
      const sortedByAdded = [...albums].sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
      const recentPool = sortedByAdded.slice(0, Math.min(10, albums.length));
      const picked = pickRandomItems(recentPool, Math.min(3, recentPool.length));
      return picked.map((album) => getCandidate(album, 'Recently added to collection'));
    }

    case 'genre': {
      let pool = albums;
      if (options?.genre && options.genre.trim()) {
        const target = options.genre.trim().toLowerCase();
        pool = albums.filter((a) =>
          a.genres?.some((g) => g.toLowerCase() === target)
        );
        if (pool.length === 0) {
          return []; // Return empty for no-match empty state
        }
        const picked = pickRandomItems(pool, Math.min(3, pool.length));
        return picked.map((album) => getCandidate(album, `Genre: ${options.genre}`));
      }

      // No specific genre filter selected: sample albums with genres
      const withGenres = albums.filter((a) => a.genres && a.genres.length > 0);
      const samplePool = withGenres.length > 0 ? withGenres : albums;
      const picked = pickRandomItems(samplePool, Math.min(3, samplePool.length));
      return picked.map((album) =>
        getCandidate(
          album,
          album.genres && album.genres.length > 0
            ? `Genre: ${album.genres[0]}`
            : 'From your collection'
        )
      );
    }

    case 'decade': {
      let pool = albums;
      if (options?.decade && options.decade.trim()) {
        const target = options.decade.trim();
        pool = albums.filter((a) => {
          if (!a.releaseYear) return false;
          const decadeStr = `${Math.floor(a.releaseYear / 10) * 10}s`;
          return decadeStr === target;
        });
        if (pool.length === 0) {
          return []; // Return empty for no-match empty state
        }
        const picked = pickRandomItems(pool, Math.min(3, pool.length));
        return picked.map((album) => getCandidate(album, `Released in the ${options.decade}`));
      }

      // No specific decade selected: sample albums with release years
      const withYears = albums.filter((a) => a.releaseYear);
      const samplePool = withYears.length > 0 ? withYears : albums;
      const picked = pickRandomItems(samplePool, Math.min(3, samplePool.length));
      return picked.map((album) =>
        getCandidate(
          album,
          album.releaseYear ? `Released in ${album.releaseYear}` : 'From your collection'
        )
      );
    }

    case 'genre_era': {
      // Combined legacy mode fallback
      let filtered = [...albums];
      const reasons: string[] = [];

      if (options?.genre && options.genre.trim()) {
        filtered = filtered.filter((a) =>
          a.genres?.some((g) => g.toLowerCase() === options.genre!.toLowerCase())
        );
        reasons.push(`Genre: ${options.genre}`);
      }

      if (options?.decade && options.decade.trim()) {
        filtered = filtered.filter((a) => {
          if (!a.releaseYear) return false;
          const decade = `${Math.floor(a.releaseYear / 10) * 10}s`;
          return decade === options.decade;
        });
        reasons.push(`Era: ${options.decade}`);
      }

      if (filtered.length === 0) return [];

      const picked = pickRandomItems(filtered, Math.min(3, filtered.length));
      return picked.map((album) => getCandidate(album, reasons.join(' • ') || 'Curated match'));
    }

    case 'choose_for_me':
    default: {
      // Select 1 appropriate record from the collection
      // Works perfectly when listenLogs.length === 0
      const unplayed = albums.filter((a) => (albumPlayCounts.get(a.id)?.count || 0) === 0);
      let chosenAlbum: Album;
      let reason: string;

      if (unplayed.length > 0 && Math.random() > 0.35) {
        chosenAlbum = pickRandomItems(unplayed, 1)[0];
        reason = 'Unplayed record from shelf';
      } else {
        const highlyRated = albums.filter((a) => a.personalRating && a.personalRating >= 4);
        if (highlyRated.length > 0 && Math.random() > 0.4) {
          chosenAlbum = pickRandomItems(highlyRated, 1)[0];
          reason = `Personal favorite (Rated ★ ${chosenAlbum.personalRating})`;
        } else {
          chosenAlbum = pickRandomItems(albums, 1)[0];
          if (chosenAlbum.edition) {
            reason = `Edition: ${chosenAlbum.edition}`;
          } else if (chosenAlbum.genres && chosenAlbum.genres.length > 0) {
            reason = `Genre: ${chosenAlbum.genres[0]}`;
          } else if (chosenAlbum.releaseYear) {
            reason = `Released in ${chosenAlbum.releaseYear}`;
          } else {
            reason = 'Selected from your collection';
          }
        }
      }

      return [getCandidate(chosenAlbum, reason)];
    }
  }
}
