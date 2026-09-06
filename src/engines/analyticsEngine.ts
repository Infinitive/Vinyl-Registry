import { Album, ListenLog } from '../types';

export type AnalyticsTimeRange = 'all' | '30d' | '90d' | 'year';

export interface CollectionOverviewStats {
  totalRecords: number;
  uniqueArtists: number;
  uniqueGenres: number;
  uniqueStyles: number;
  releaseYearSpan: {
    min: number;
    max: number;
    spanYears: number;
  } | null;
  representedDecadesCount: number;
  ratedRecordsCount: number;
  unratedRecordsCount: number;
  averageRating: number | null; // calculated strictly among rated records
  recordsWithEditionCount: number;
  recordsWithVariantCount: number;
  recordsWithPurchaseInfoCount: number;
  totalEstimatedSpend: number | null;
}

export interface CollectionDemographicsStats {
  genresDistribution: {
    name: string;
    count: number;
    percentage: number; // percentage of total records containing this genre
  }[];
  stylesDistribution: {
    name: string;
    count: number;
    percentage: number;
  }[];
  decadesDistribution: {
    decade: string;
    count: number;
    percentage: number;
  }[];
  formatsDistribution: {
    format: string;
    count: number;
    percentage: number;
  }[];
  editionsDistribution: {
    edition: string;
    count: number;
    percentage: number;
  }[];
  ratingDistribution: {
    rating: number;
    label: string;
    count: number;
    percentage: number;
  }[];
  highestRatedAlbums: Album[];
}

export interface CollectionGrowthStats {
  recentlyAdded: Album[];
  growthByMonth: {
    monthKey: string;
    label: string;
    count: number;
  }[];
}

export interface RegistryCompletenessStats {
  overallPercentage: number;
  fieldCompleteness: {
    field: string;
    label: string;
    filledCount: number;
    missingCount: number;
    percentage: number;
  }[];
  mostCommonlyMissing: {
    field: string;
    label: string;
    missingCount: number;
    percentage: number;
  }[];
  incompleteAlbums: {
    album: Album;
    missingFields: string[];
    completenessPercentage: number;
  }[];
}

export interface ListeningOverviewStats {
  totalListens: number;
  uniqueRecordsPlayed: number;
  recordsNeverPlayed: number;
  collectionEngagementRate: number; // % of total records played at least once
  averageListensPerPlayedRecord: number | null;
  averageListensPerRecordInCollection: number | null;
  mostRecentListen: { log: ListenLog; album?: Album } | null;
  firstRecordedListen: { log: ListenLog; album?: Album } | null;
  averageSessionRating: number | null;
  hasListeningData: boolean;
  hasSufficientData: boolean; // >= 3 listens for pattern charts
}

export interface ListeningRankingsStats {
  mostPlayed: { album: Album; playCount: number; lastPlayed?: string }[];
  leastPlayed: { album: Album; playCount: number; lastPlayed?: string }[];
  neverPlayed: Album[];
  recentlyPlayed: { album: Album; playCount: number; lastPlayed?: string }[];
}

export interface ArtistListeningStats {
  topArtists: {
    artist: string;
    totalListens: number;
    uniqueRecordsPlayed: number;
    totalRecordsOwned: number;
  }[];
}

export interface GenreListeningStats {
  topGenres: {
    genre: string;
    totalListens: number;
    uniqueRecordsPlayed: number;
    totalRecordsOwned: number;
  }[];
}

export interface TemporalListeningStats {
  listensByWeekday: {
    day: string;
    fullDay: string;
    count: number;
    percentage: number;
  }[];
  listensByTimeOfDay: {
    timeSlot: string;
    label: string;
    hours: string;
    count: number;
    percentage: number;
  }[];
  listensByMonth: {
    monthKey: string;
    label: string;
    count: number;
  }[];
}

export interface HistoryAwareInsights {
  neglectedRecords: {
    album: Album;
    playCount: number;
    lastPlayed: string;
    daysSinceLastListen: number;
  }[];
  highlyRatedUnderplayed: {
    album: Album;
    rating: number;
    playCount: number;
  }[];
  frequentlyPlayedFavorites: {
    album: Album;
    rating: number;
    playCount: number;
  }[];
  recentRotation: {
    album: Album;
    recentListensCount: number;
  }[];
}

export interface ComprehensiveAnalytics {
  timeRange: AnalyticsTimeRange;
  collectionOverview: CollectionOverviewStats;
  collectionDemographics: CollectionDemographicsStats;
  collectionGrowth: CollectionGrowthStats;
  registryCompleteness: RegistryCompletenessStats;
  listeningOverview: ListeningOverviewStats;
  listeningRankings: ListeningRankingsStats;
  artistListening: ArtistListeningStats;
  genreListening: GenreListeningStats;
  temporalListening: TemporalListeningStats;
  insights: HistoryAwareInsights;
}

// ==========================================
// SOURCE OF TRUTH: PLAY COUNTS & LAST PLAYED
// ==========================================
/**
 * Canonical function computing playCount and lastPlayed from actual ListenLog entries.
 * Reused across Library, Discover, and Analytics to ensure absolute consistency.
 */
export function computeAlbumStats(
  albums: Album[],
  logs: ListenLog[]
): Map<string, { playCount: number; lastPlayed?: string }> {
  const statsMap = new Map<string, { playCount: number; lastPlayed?: string }>();

  for (const album of albums) {
    statsMap.set(album.id, { playCount: 0 });
  }

  // Sort logs chronologically to identify latest play accurately
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.listenedAt).getTime() - new Date(b.listenedAt).getTime()
  );

  for (const log of sortedLogs) {
    const stat = statsMap.get(log.recordId);
    if (stat) {
      stat.playCount += 1;
      stat.lastPlayed = log.listenedAt;
    }
  }

  return statsMap;
}

// ==========================================
// TIME-RANGE FILTERING
// ==========================================
export function filterLogsByTimeRange(
  logs: ListenLog[],
  range: AnalyticsTimeRange,
  referenceDate: Date = new Date()
): ListenLog[] {
  if (range === 'all') return logs;

  const nowMs = referenceDate.getTime();
  let cutoffMs = 0;

  if (range === '30d') {
    cutoffMs = nowMs - 30 * 24 * 60 * 60 * 1000;
  } else if (range === '90d') {
    cutoffMs = nowMs - 90 * 24 * 60 * 60 * 1000;
  } else if (range === 'year') {
    cutoffMs = new Date(referenceDate.getFullYear(), 0, 1).getTime();
  }

  return logs.filter((log) => {
    const time = new Date(log.listenedAt).getTime();
    return !isNaN(time) && time >= cutoffMs;
  });
}

// ==========================================
// 1. COLLECTION INTELLIGENCE CALCULATIONS
// ==========================================
export function computeCollectionOverview(albums: Album[]): CollectionOverviewStats {
  const totalRecords = albums.length;
  if (totalRecords === 0) {
    return {
      totalRecords: 0,
      uniqueArtists: 0,
      uniqueGenres: 0,
      uniqueStyles: 0,
      releaseYearSpan: null,
      representedDecadesCount: 0,
      ratedRecordsCount: 0,
      unratedRecordsCount: 0,
      averageRating: null,
      recordsWithEditionCount: 0,
      recordsWithVariantCount: 0,
      recordsWithPurchaseInfoCount: 0,
      totalEstimatedSpend: null,
    };
  }

  const artistsSet = new Set<string>();
  const genresSet = new Set<string>();
  const stylesSet = new Set<string>();
  const decadesSet = new Set<string>();

  let minYear = Infinity;
  let maxYear = -Infinity;
  let ratedCount = 0;
  let ratingSum = 0;
  let editionCount = 0;
  let variantCount = 0;
  let purchaseInfoCount = 0;
  let spendSum = 0;
  let spendRecordsCount = 0;

  for (const album of albums) {
    if (album.artist?.trim()) {
      artistsSet.add(album.artist.trim());
    }

    if (album.genres && album.genres.length > 0) {
      for (const g of album.genres) {
        if (g.trim()) genresSet.add(g.trim());
      }
    }

    if (album.styles && album.styles.length > 0) {
      for (const s of album.styles) {
        if (s.trim()) stylesSet.add(s.trim());
      }
    }

    if (album.releaseYear && album.releaseYear > 1900 && album.releaseYear < 2100) {
      if (album.releaseYear < minYear) minYear = album.releaseYear;
      if (album.releaseYear > maxYear) maxYear = album.releaseYear;
      const dec = `${Math.floor(album.releaseYear / 10) * 10}s`;
      decadesSet.add(dec);
    }

    if (album.personalRating !== undefined && album.personalRating > 0) {
      ratedCount++;
      ratingSum += album.personalRating;
    }

    if (album.edition && album.edition.trim()) {
      editionCount++;
    }

    if (album.variant && album.variant.trim()) {
      variantCount++;
    }

    if (album.purchasePrice !== undefined || album.purchaseDate) {
      purchaseInfoCount++;
      if (album.purchasePrice !== undefined && album.purchasePrice > 0) {
        spendSum += album.purchasePrice;
        spendRecordsCount++;
      }
    }
  }

  const releaseYearSpan =
    minYear !== Infinity && maxYear !== -Infinity
      ? { min: minYear, max: maxYear, spanYears: maxYear - minYear + 1 }
      : null;

  const averageRating = ratedCount > 0 ? Number((ratingSum / ratedCount).toFixed(1)) : null;

  return {
    totalRecords,
    uniqueArtists: artistsSet.size,
    uniqueGenres: genresSet.size,
    uniqueStyles: stylesSet.size,
    releaseYearSpan,
    representedDecadesCount: decadesSet.size,
    ratedRecordsCount: ratedCount,
    unratedRecordsCount: totalRecords - ratedCount,
    averageRating,
    recordsWithEditionCount: editionCount,
    recordsWithVariantCount: variantCount,
    recordsWithPurchaseInfoCount: purchaseInfoCount,
    totalEstimatedSpend: spendRecordsCount > 0 ? Number(spendSum.toFixed(2)) : null,
  };
}

/**
 * Multi-Value Handling Documentation:
 * In collection demographics, records may possess multiple genres or styles (e.g. ["Electronic", "Ambient"]).
 * - Total collection size is strictly 1 record = 1 unit.
 * - Attribute distributions count each record towards every attribute it contains.
 * - Percentage represents "% of total collection containing this attribute" = (count / totalRecords) * 100.
 * - This prevents artificial under-counting of multifaceted works while preserving aggregate collection truth.
 */
export function computeCollectionDemographics(albums: Album[]): CollectionDemographicsStats {
  const total = albums.length;
  if (total === 0) {
    return {
      genresDistribution: [],
      stylesDistribution: [],
      decadesDistribution: [],
      formatsDistribution: [],
      editionsDistribution: [],
      ratingDistribution: [],
      highestRatedAlbums: [],
    };
  }

  const genreMap = new Map<string, number>();
  const styleMap = new Map<string, number>();
  const decadeMap = new Map<string, number>();
  const formatMap = new Map<string, number>();
  const editionMap = new Map<string, number>();
  const ratingMap = new Map<number, number>();

  for (const a of albums) {
    // Genres
    if (a.genres && a.genres.length > 0) {
      for (const g of a.genres) {
        const clean = g.trim();
        if (clean) genreMap.set(clean, (genreMap.get(clean) || 0) + 1);
      }
    }

    // Styles
    if (a.styles && a.styles.length > 0) {
      for (const s of a.styles) {
        const clean = s.trim();
        if (clean) styleMap.set(clean, (styleMap.get(clean) || 0) + 1);
      }
    }

    // Decades
    if (a.releaseYear && a.releaseYear > 1900 && a.releaseYear < 2100) {
      const decade = `${Math.floor(a.releaseYear / 10) * 10}s`;
      decadeMap.set(decade, (decadeMap.get(decade) || 0) + 1);
    }

    // Formats
    const fmt = a.format?.trim() || 'Standard LP';
    formatMap.set(fmt, (formatMap.get(fmt) || 0) + 1);

    // Editions
    if (a.edition && a.edition.trim()) {
      const ed = a.edition.trim();
      editionMap.set(ed, (editionMap.get(ed) || 0) + 1);
    }

    // Ratings
    if (a.personalRating !== undefined && a.personalRating > 0) {
      ratingMap.set(a.personalRating, (ratingMap.get(a.personalRating) || 0) + 1);
    }
  }

  let ratedTotal = 0;
  for (const count of ratingMap.values()) {
    ratedTotal += count;
  }

  const genresDistribution = Array.from(genreMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const stylesDistribution = Array.from(styleMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const decadesDistribution = Array.from(decadeMap.entries())
    .map(([decade, count]) => ({
      decade,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => a.decade.localeCompare(b.decade));

  const formatsDistribution = Array.from(formatMap.entries())
    .map(([format, count]) => ({
      format,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const editionsDistribution = Array.from(editionMap.entries())
    .map(([edition, count]) => ({
      edition,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Ratings distribution across 0.5 - 5 stars (% calculated among rated records)
  const ratingDistribution = Array.from(ratingMap.entries())
    .map(([rating, count]) => ({
      rating,
      label: `★ ${rating}`,
      count,
      percentage: ratedTotal > 0 ? Math.round((count / ratedTotal) * 100) : 0,
    }))
    .sort((a, b) => a.rating - b.rating);

  // Highest rated albums (>= 4.5 stars)
  const highestRatedAlbums = albums
    .filter((a) => (a.personalRating || 0) >= 4.5)
    .sort((a, b) => (b.personalRating || 0) - (a.personalRating || 0));

  return {
    genresDistribution,
    stylesDistribution,
    decadesDistribution,
    formatsDistribution,
    editionsDistribution,
    ratingDistribution,
    highestRatedAlbums,
  };
}

export function computeCollectionGrowth(albums: Album[]): CollectionGrowthStats {
  const recentlyAdded = [...albums]
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, 8);

  const monthMap = new Map<string, { label: string; count: number }>();

  for (const a of albums) {
    try {
      const d = new Date(a.addedAt);
      if (!isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        const entry = monthMap.get(key) || { label, count: 0 };
        entry.count += 1;
        monthMap.set(key, entry);
      }
    } catch {
      // ignore
    }
  }

  const growthByMonth = Array.from(monthMap.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([monthKey, data]) => ({
      monthKey,
      label: data.label,
      count: data.count,
    }));

  return {
    recentlyAdded,
    growthByMonth,
  };
}

/**
 * Registry Completeness:
 * Weighted scoring to distinguish core identity requirements from optional attributes.
 * Never frames this as a "grade", but rather provides actionable insights for catalogue improvement.
 */
export function computeRegistryCompleteness(albums: Album[]): RegistryCompletenessStats {
  const total = albums.length;
  if (total === 0) {
    return {
      overallPercentage: 0,
      fieldCompleteness: [],
      mostCommonlyMissing: [],
      incompleteAlbums: [],
    };
  }

  const fieldsToCheck = [
    { key: 'artist', label: 'Artist', weight: 2 },
    { key: 'title', label: 'Album Title', weight: 2 },
    { key: 'releaseYear', label: 'Release Year', weight: 1.5 },
    { key: 'genres', label: 'Genres', weight: 1.5 },
    { key: 'format', label: 'Format', weight: 1 },
    { key: 'label', label: 'Record Label', weight: 1 },
    { key: 'edition', label: 'Edition Details', weight: 1 },
    { key: 'variant', label: 'Colorway / Variant', weight: 1 },
    { key: 'catalogNumber', label: 'Catalog #', weight: 0.5 },
  ];

  const fieldCounts: Record<string, number> = {};
  for (const f of fieldsToCheck) {
    fieldCounts[f.key] = 0;
  }

  const totalMaxWeight = fieldsToCheck.reduce((acc, f) => acc + f.weight, 0);
  let totalScoreSum = 0;

  const incompleteAlbums: {
    album: Album;
    missingFields: string[];
    completenessPercentage: number;
  }[] = [];

  for (const a of albums) {
    let albumScore = 0;
    const missing: string[] = [];

    // Artist
    if (a.artist?.trim()) {
      albumScore += 2;
      fieldCounts.artist++;
    } else {
      missing.push('Artist');
    }

    // Title
    if (a.title?.trim()) {
      albumScore += 2;
      fieldCounts.title++;
    } else {
      missing.push('Title');
    }

    // Release Year
    if (a.releaseYear && a.releaseYear > 1900) {
      albumScore += 1.5;
      fieldCounts.releaseYear++;
    } else {
      missing.push('Release Year');
    }

    // Genres
    if (a.genres && a.genres.length > 0) {
      albumScore += 1.5;
      fieldCounts.genres++;
    } else {
      missing.push('Genres');
    }

    // Format
    if (a.format?.trim()) {
      albumScore += 1;
      fieldCounts.format++;
    } else {
      missing.push('Format');
    }

    // Label
    if (a.label?.trim()) {
      albumScore += 1;
      fieldCounts.label++;
    } else {
      missing.push('Label');
    }

    // Edition
    if (a.edition?.trim()) {
      albumScore += 1;
      fieldCounts.edition++;
    } else {
      missing.push('Edition');
    }

    // Variant
    if (a.variant?.trim()) {
      albumScore += 1;
      fieldCounts.variant++;
    } else {
      missing.push('Variant');
    }

    // Catalog #
    if (a.catalogNumber?.trim()) {
      albumScore += 0.5;
      fieldCounts.catalogNumber++;
    } else {
      missing.push('Catalog #');
    }

    const albumPercentage = Math.round((albumScore / totalMaxWeight) * 100);
    totalScoreSum += albumPercentage;

    if (missing.length > 0) {
      incompleteAlbums.push({
        album: a,
        missingFields: missing,
        completenessPercentage: albumPercentage,
      });
    }
  }

  const overallPercentage = Math.round(totalScoreSum / total);

  const fieldCompleteness = fieldsToCheck.map((f) => {
    const filled = fieldCounts[f.key] || 0;
    const missing = total - filled;
    return {
      field: f.key,
      label: f.label,
      filledCount: filled,
      missingCount: missing,
      percentage: Math.round((filled / total) * 100),
    };
  });

  const mostCommonlyMissing = [...fieldCompleteness]
    .filter((f) => f.missingCount > 0)
    .sort((a, b) => b.missingCount - a.missingCount)
    .map((f) => ({
      field: f.field,
      label: f.label,
      missingCount: f.missingCount,
      percentage: Math.round((f.missingCount / total) * 100),
    }));

  incompleteAlbums.sort((a, b) => a.completenessPercentage - b.completenessPercentage);

  return {
    overallPercentage,
    fieldCompleteness,
    mostCommonlyMissing,
    incompleteAlbums: incompleteAlbums.slice(0, 10),
  };
}

// ==========================================
// 2. LISTENING INTELLIGENCE CALCULATIONS
// ==========================================
export function computeListeningOverview(
  albums: Album[],
  logs: ListenLog[]
): ListeningOverviewStats {
  const totalListens = logs.length;
  const albumMap = new Map<string, Album>(albums.map((a) => [a.id, a]));

  const uniquePlayedIds = new Set<string>();
  let ratingSum = 0;
  let ratedCount = 0;

  for (const log of logs) {
    if (albumMap.has(log.recordId)) {
      uniquePlayedIds.add(log.recordId);
    }
    if (log.rating !== undefined && log.rating > 0) {
      ratingSum += log.rating;
      ratedCount++;
    }
  }

  const uniqueRecordsPlayed = uniquePlayedIds.size;
  const recordsNeverPlayed = Math.max(0, albums.length - uniqueRecordsPlayed);
  const collectionEngagementRate =
    albums.length > 0 ? Math.round((uniqueRecordsPlayed / albums.length) * 100) : 0;

  const averageListensPerPlayedRecord =
    uniqueRecordsPlayed > 0 ? Number((totalListens / uniqueRecordsPlayed).toFixed(1)) : null;

  const averageListensPerRecordInCollection =
    albums.length > 0 ? Number((totalListens / albums.length).toFixed(1)) : null;

  const sortedChronological = [...logs].sort(
    (a, b) => new Date(a.listenedAt).getTime() - new Date(b.listenedAt).getTime()
  );

  const firstLog = sortedChronological[0];
  const lastLog = sortedChronological[sortedChronological.length - 1];

  const firstRecordedListen = firstLog
    ? { log: firstLog, album: albumMap.get(firstLog.recordId) }
    : null;

  const mostRecentListen = lastLog
    ? { log: lastLog, album: albumMap.get(lastLog.recordId) }
    : null;

  const averageSessionRating =
    ratedCount > 0 ? Number((ratingSum / ratedCount).toFixed(1)) : null;

  return {
    totalListens,
    uniqueRecordsPlayed,
    recordsNeverPlayed,
    collectionEngagementRate,
    averageListensPerPlayedRecord,
    averageListensPerRecordInCollection,
    mostRecentListen,
    firstRecordedListen,
    averageSessionRating,
    hasListeningData: totalListens > 0,
    hasSufficientData: totalListens >= 3,
  };
}

export function computeListeningRankings(
  albums: Album[],
  logs: ListenLog[]
): ListeningRankingsStats {
  const statsMap = computeAlbumStats(albums, logs);
  const albumMap = new Map<string, Album>(albums.map((a) => [a.id, a]));

  const playedAlbumsWithStats: { album: Album; playCount: number; lastPlayed?: string }[] = [];
  const neverPlayed: Album[] = [];

  for (const album of albums) {
    const stat = statsMap.get(album.id);
    const playCount = stat?.playCount || 0;
    if (playCount > 0) {
      playedAlbumsWithStats.push({
        album,
        playCount,
        lastPlayed: stat?.lastPlayed,
      });
    } else {
      neverPlayed.push(album);
    }
  }

  // Most Played (ordered by playCount desc, then lastPlayed desc)
  const mostPlayed = [...playedAlbumsWithStats]
    .sort((a, b) => {
      if (b.playCount !== a.playCount) return b.playCount - a.playCount;
      const timeA = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0;
      const timeB = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 10);

  // Least Played (records with at least 1 listen, lowest count)
  const leastPlayed = [...playedAlbumsWithStats]
    .sort((a, b) => {
      if (a.playCount !== b.playCount) return a.playCount - b.playCount;
      const timeA = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0;
      const timeB = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0;
      return timeA - timeB;
    })
    .slice(0, 10);

  // Recently Played (ordered by lastPlayed desc)
  const recentlyPlayed = [...playedAlbumsWithStats]
    .filter((a) => Boolean(a.lastPlayed))
    .sort((a, b) => new Date(b.lastPlayed!).getTime() - new Date(a.lastPlayed!).getTime())
    .slice(0, 10);

  return {
    mostPlayed,
    leastPlayed,
    neverPlayed,
    recentlyPlayed,
  };
}

export function computeArtistListening(
  albums: Album[],
  logs: ListenLog[]
): ArtistListeningStats {
  const albumMap = new Map<string, Album>(albums.map((a) => [a.id, a]));
  const artistLogCounts = new Map<string, number>();
  const artistPlayedRecordSets = new Map<string, Set<string>>();
  const artistTotalRecordsOwned = new Map<string, number>();

  for (const a of albums) {
    const art = a.artist?.trim();
    if (art) {
      artistTotalRecordsOwned.set(art, (artistTotalRecordsOwned.get(art) || 0) + 1);
    }
  }

  for (const log of logs) {
    const album = albumMap.get(log.recordId);
    const art = album?.artist?.trim();
    if (art) {
      artistLogCounts.set(art, (artistLogCounts.get(art) || 0) + 1);
      if (!artistPlayedRecordSets.has(art)) {
        artistPlayedRecordSets.set(art, new Set());
      }
      artistPlayedRecordSets.get(art)!.add(log.recordId);
    }
  }

  const topArtists = Array.from(artistLogCounts.entries())
    .map(([artist, totalListens]) => ({
      artist,
      totalListens,
      uniqueRecordsPlayed: artistPlayedRecordSets.get(artist)?.size || 0,
      totalRecordsOwned: artistTotalRecordsOwned.get(artist) || 0,
    }))
    .sort((a, b) => b.totalListens - a.totalListens)
    .slice(0, 10);

  return { topArtists };
}

export function computeGenreListening(
  albums: Album[],
  logs: ListenLog[]
): GenreListeningStats {
  const albumMap = new Map<string, Album>(albums.map((a) => [a.id, a]));
  const genreLogCounts = new Map<string, number>();
  const genrePlayedRecordSets = new Map<string, Set<string>>();
  const genreTotalRecordsOwned = new Map<string, number>();

  for (const a of albums) {
    if (a.genres && a.genres.length > 0) {
      for (const g of a.genres) {
        const clean = g.trim();
        if (clean) {
          genreTotalRecordsOwned.set(clean, (genreTotalRecordsOwned.get(clean) || 0) + 1);
        }
      }
    }
  }

  for (const log of logs) {
    const album = albumMap.get(log.recordId);
    if (album?.genres && album.genres.length > 0) {
      for (const g of album.genres) {
        const clean = g.trim();
        if (clean) {
          genreLogCounts.set(clean, (genreLogCounts.get(clean) || 0) + 1);
          if (!genrePlayedRecordSets.has(clean)) {
            genrePlayedRecordSets.set(clean, new Set());
          }
          genrePlayedRecordSets.get(clean)!.add(log.recordId);
        }
      }
    }
  }

  const topGenres = Array.from(genreLogCounts.entries())
    .map(([genre, totalListens]) => ({
      genre,
      totalListens,
      uniqueRecordsPlayed: genrePlayedRecordSets.get(genre)?.size || 0,
      totalRecordsOwned: genreTotalRecordsOwned.get(genre) || 0,
    }))
    .sort((a, b) => b.totalListens - a.totalListens)
    .slice(0, 10);

  return { topGenres };
}

export function computeTemporalListening(logs: ListenLog[]): TemporalListeningStats {
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]; // 0=Sun .. 6=Sat
  const timeSlotCounts = {
    morning: 0, // 6:00 - 11:59
    afternoon: 0, // 12:00 - 16:59
    evening: 0, // 17:00 - 21:59
    night: 0, // 22:00 - 5:59
  };

  const monthMap = new Map<string, { label: string; count: number }>();

  for (const log of logs) {
    try {
      const d = new Date(log.listenedAt);
      if (!isNaN(d.getTime())) {
        const day = d.getDay();
        weekdayCounts[day]++;

        const hour = d.getHours();
        if (hour >= 6 && hour < 12) timeSlotCounts.morning++;
        else if (hour >= 12 && hour < 17) timeSlotCounts.afternoon++;
        else if (hour >= 17 && hour < 22) timeSlotCounts.evening++;
        else timeSlotCounts.night++;

        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        const entry = monthMap.get(monthKey) || { label, count: 0 };
        entry.count += 1;
        monthMap.set(monthKey, entry);
      }
    } catch {
      // ignore
    }
  }

  const total = logs.length || 1;

  const dayNames = [
    { day: 'Sun', fullDay: 'Sunday' },
    { day: 'Mon', fullDay: 'Monday' },
    { day: 'Tue', fullDay: 'Tuesday' },
    { day: 'Wed', fullDay: 'Wednesday' },
    { day: 'Thu', fullDay: 'Thursday' },
    { day: 'Fri', fullDay: 'Friday' },
    { day: 'Sat', fullDay: 'Saturday' },
  ];

  const listensByWeekday = dayNames.map((d, idx) => ({
    day: d.day,
    fullDay: d.fullDay,
    count: weekdayCounts[idx],
    percentage: Math.round((weekdayCounts[idx] / total) * 100),
  }));

  const listensByTimeOfDay = [
    {
      timeSlot: 'morning',
      label: 'Morning Spin',
      hours: '6:00 AM – 12:00 PM',
      count: timeSlotCounts.morning,
      percentage: Math.round((timeSlotCounts.morning / total) * 100),
    },
    {
      timeSlot: 'afternoon',
      label: 'Afternoon Session',
      hours: '12:00 PM – 5:00 PM',
      count: timeSlotCounts.afternoon,
      percentage: Math.round((timeSlotCounts.afternoon / total) * 100),
    },
    {
      timeSlot: 'evening',
      label: 'Evening Atmosphere',
      hours: '5:00 PM – 10:00 PM',
      count: timeSlotCounts.evening,
      percentage: Math.round((timeSlotCounts.evening / total) * 100),
    },
    {
      timeSlot: 'night',
      label: 'Late Night Listening',
      hours: '10:00 PM – 6:00 AM',
      count: timeSlotCounts.night,
      percentage: Math.round((timeSlotCounts.night / total) * 100),
    },
  ];

  const listensByMonth = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, data]) => ({
      monthKey,
      label: data.label,
      count: data.count,
    }));

  return {
    listensByWeekday,
    listensByTimeOfDay,
    listensByMonth,
  };
}

/**
 * Deterministic, history-aware analytical classifications (NO AI, 100% mathematical):
 * - Neglected: records with >= 1 listen where lastPlayed is > 30 days ago.
 * - Highly Rated Underplayed: personalRating >= 4.0 and playCount <= 1.
 * - Frequently Played Favorites: personalRating >= 4.0 and playCount >= 2.
 * - Recent Rotation: >= 2 listens within the last 15 recorded logs.
 */
export function computeHistoryAwareInsights(
  albums: Album[],
  logs: ListenLog[],
  referenceDate: Date = new Date()
): HistoryAwareInsights {
  const statsMap = computeAlbumStats(albums, logs);
  const nowMs = referenceDate.getTime();
  const msInDay = 24 * 60 * 60 * 1000;

  const neglectedRecords: {
    album: Album;
    playCount: number;
    lastPlayed: string;
    daysSinceLastListen: number;
  }[] = [];

  const highlyRatedUnderplayed: {
    album: Album;
    rating: number;
    playCount: number;
  }[] = [];

  const frequentlyPlayedFavorites: {
    album: Album;
    rating: number;
    playCount: number;
  }[] = [];

  // Recent rotation from the last 15 logs
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.listenedAt).getTime() - new Date(a.listenedAt).getTime())
    .slice(0, 15);

  const recentCounts = new Map<string, number>();
  for (const l of recentLogs) {
    recentCounts.set(l.recordId, (recentCounts.get(l.recordId) || 0) + 1);
  }

  const albumMap = new Map(albums.map((a) => [a.id, a]));

  for (const album of albums) {
    const stat = statsMap.get(album.id);
    const playCount = stat?.playCount || 0;
    const rating = album.personalRating || 0;

    // Neglected: played at least once, last played > 30 days ago
    if (playCount > 0 && stat?.lastPlayed) {
      const lastPlayedMs = new Date(stat.lastPlayed).getTime();
      const diffDays = Math.floor((nowMs - lastPlayedMs) / msInDay);
      if (diffDays >= 30) {
        neglectedRecords.push({
          album,
          playCount,
          lastPlayed: stat.lastPlayed,
          daysSinceLastListen: diffDays,
        });
      }
    }

    // Highly rated underplayed
    if (rating >= 4.0 && playCount <= 1) {
      highlyRatedUnderplayed.push({
        album,
        rating,
        playCount,
      });
    }

    // Frequently played favorites
    if (rating >= 4.0 && playCount >= 2) {
      frequentlyPlayedFavorites.push({
        album,
        rating,
        playCount,
      });
    }
  }

  neglectedRecords.sort((a, b) => b.daysSinceLastListen - a.daysSinceLastListen);
  highlyRatedUnderplayed.sort((a, b) => b.rating - a.rating);
  frequentlyPlayedFavorites.sort((a, b) => b.playCount - a.playCount);

  const recentRotation: { album: Album; recentListensCount: number }[] = [];
  for (const [recordId, count] of recentCounts.entries()) {
    if (count >= 2) {
      const alb = albumMap.get(recordId);
      if (alb) {
        recentRotation.push({ album: alb, recentListensCount: count });
      }
    }
  }
  recentRotation.sort((a, b) => b.recentListensCount - a.recentListensCount);

  return {
    neglectedRecords: neglectedRecords.slice(0, 8),
    highlyRatedUnderplayed: highlyRatedUnderplayed.slice(0, 8),
    frequentlyPlayedFavorites: frequentlyPlayedFavorites.slice(0, 8),
    recentRotation: recentRotation.slice(0, 8),
  };
}

// ==========================================
// UNIFIED MASTER CALCULATOR
// ==========================================
export function calculateComprehensiveAnalytics(
  albums: Album[],
  logs: ListenLog[],
  timeRange: AnalyticsTimeRange = 'all'
): ComprehensiveAnalytics {
  const collectionOverview = computeCollectionOverview(albums);
  const collectionDemographics = computeCollectionDemographics(albums);
  const collectionGrowth = computeCollectionGrowth(albums);
  const registryCompleteness = computeRegistryCompleteness(albums);

  // Filter logs for listening intelligence while preserving all-time collection metrics
  const filteredLogs = filterLogsByTimeRange(logs, timeRange);

  const listeningOverview = computeListeningOverview(albums, filteredLogs);
  const listeningRankings = computeListeningRankings(albums, filteredLogs);
  const artistListening = computeArtistListening(albums, filteredLogs);
  const genreListening = computeGenreListening(albums, filteredLogs);
  const temporalListening = computeTemporalListening(filteredLogs);
  // History-aware insights analyze comprehensive all-time habits (neglected, favorites, rotation)
  const insights = computeHistoryAwareInsights(albums, logs);

  return {
    timeRange,
    collectionOverview,
    collectionDemographics,
    collectionGrowth,
    registryCompleteness,
    listeningOverview,
    listeningRankings,
    artistListening,
    genreListening,
    temporalListening,
    insights,
  };
}

// Backward compatible aliases for earlier versions
export const calculateAnalytics = (albums: Album[], logs: ListenLog[]) => {
  const full = calculateComprehensiveAnalytics(albums, logs, 'all');
  const artistRecordCounts = new Map<string, number>();
  for (const a of albums) {
    if (a.artist) {
      const art = a.artist.trim();
      artistRecordCounts.set(art, (artistRecordCounts.get(art) || 0) + 1);
    }
  }
  const topArtistsByRecords = Array.from(artistRecordCounts.entries())
    .map(([artist, recordCount]) => ({ artist, recordCount }))
    .sort((a, b) => b.recordCount - a.recordCount);

  return {
    totalRecords: full.collectionOverview.totalRecords,
    uniqueArtists: full.collectionOverview.uniqueArtists,
    totalListens: full.listeningOverview.totalListens,
    playedRecordsCount: full.listeningOverview.uniqueRecordsPlayed,
    exploredPercentage: full.listeningOverview.collectionEngagementRate,
    specialEditionsCount: full.collectionOverview.recordsWithEditionCount,
    genreBreakdown: full.collectionDemographics.genresDistribution.map((g) => ({
      genre: g.name,
      count: g.count,
    })),
    decadeDistribution: full.collectionDemographics.decadesDistribution,
    topArtistsByRecords,
    ratingDistribution: full.collectionDemographics.ratingDistribution,
    mostPlayedRecords: full.listeningRankings.mostPlayed,
    recentListens: full.listeningRankings.recentlyPlayed.map((r) => ({
      log: { id: r.album.id, recordId: r.album.id, listenedAt: r.lastPlayed || '' },
      album: r.album,
    })),
  };
};

export const computeCollectionStats = (albums: Album[]) => {
  const full = calculateComprehensiveAnalytics(albums, [], 'all');
  return {
    totalRecords: full.collectionOverview.totalRecords,
    uniqueArtists: full.collectionOverview.uniqueArtists,
    genresDistribution: full.collectionDemographics.genresDistribution,
    decadesDistribution: full.collectionDemographics.decadesDistribution,
    formatsDistribution: full.collectionDemographics.formatsDistribution,
    editionsDistribution: full.collectionDemographics.editionsDistribution,
    ratingDistribution: full.collectionDemographics.ratingDistribution,
    specialEditionsCount: full.collectionOverview.recordsWithEditionCount,
    metadataCompleteness: {
      averagePercent: full.registryCompleteness.overallPercentage,
      missingReleaseYear:
        full.registryCompleteness.fieldCompleteness.find((f) => f.field === 'releaseYear')
          ?.missingCount || 0,
      missingGenre:
        full.registryCompleteness.fieldCompleteness.find((f) => f.field === 'genres')
          ?.missingCount || 0,
      missingEdition:
        full.registryCompleteness.fieldCompleteness.find((f) => f.field === 'edition')
          ?.missingCount || 0,
      missingLabel:
        full.registryCompleteness.fieldCompleteness.find((f) => f.field === 'label')
          ?.missingCount || 0,
    },
  };
};

export const computeListeningStats = (albums: Album[], logs: ListenLog[]) => {
  const full = calculateComprehensiveAnalytics(albums, logs, 'all');
  return {
    totalListens: full.listeningOverview.totalListens,
    uniqueRecordsPlayed: full.listeningOverview.uniqueRecordsPlayed,
    unplayedCount: full.listeningOverview.recordsNeverPlayed,
    engagementRate: full.listeningOverview.collectionEngagementRate,
    mostListenedAlbums: full.listeningRankings.mostPlayed.map((m) => ({
      album: m.album,
      count: m.playCount,
    })),
    mostListenedArtists: full.artistListening.topArtists.map((a) => ({
      artist: a.artist,
      count: a.totalListens,
    })),
    recentListens: logs
      .slice(-15)
      .reverse()
      .map((l) => ({ log: l, album: albums.find((a) => a.id === l.recordId) })),
    averageRating: full.listeningOverview.averageSessionRating,
    listensByWeekday: full.temporalListening.listensByWeekday,
    hasListeningData: full.listeningOverview.hasListeningData,
  };
};
