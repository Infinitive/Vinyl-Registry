import React, { useState, useMemo } from 'react';
import {
  BarChart2,
  Disc,
  Headphones,
  Calendar,
  Sparkles,
  TrendingUp,
  Star,
  Award,
  Layers,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Zap,
  Tag,
  ArrowUpRight,
  Filter,
  PlusCircle,
} from 'lucide-react';
import { Album, ListenLog } from '../types';
import {
  calculateComprehensiveAnalytics,
  AnalyticsTimeRange,
} from '../engines/analyticsEngine';
import { RatingStars } from '../components/RatingStars';
import { VinylArtwork } from '../components/VinylArtwork';

type AnalyticsSection = 'all' | 'collection' | 'listening' | 'completeness';

interface AnalyticsViewProps {
  albums: Album[];
  listenLogs: ListenLog[];
  onSelectAlbum: (album: Album) => void;
  onDeleteListenLog: (logId: string) => void;
  onLogListen?: (album: Album) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  albums,
  listenLogs,
  onSelectAlbum,
  onDeleteListenLog,
  onLogListen,
}) => {
  const [activeSection, setActiveSection] = useState<AnalyticsSection>('all');
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('all');
  const [rankingTab, setRankingTab] = useState<'most' | 'least' | 'recent' | 'never'>('most');

  // Compute comprehensive analytics purely from reactive inputs
  const analytics = useMemo(() => {
    return calculateComprehensiveAnalytics(albums, listenLogs, timeRange);
  }, [albums, listenLogs, timeRange]);

  const albumMap = useMemo(() => new Map(albums.map((a) => [a.id, a])), [albums]);

  const {
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
  } = analytics;

  // Format date helper
  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Unknown';
    try {
      const d = new Date(isoStr);
      return isNaN(d.getTime()) ? 'Unknown' : d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div id="analytics-view" className="space-y-6 pb-12">
      {/* Header & Section Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D9D4C7]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#5D614E]" />
            <h2 className="font-serif text-2xl font-bold text-[#2D2D2A] tracking-tight">
              Collection Intelligence
            </h2>
          </div>
          <p className="text-xs text-[#726E65]">
            Dynamic analytics derived from {albums.length} records and {listenLogs.length} listening logs
          </p>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#EFECE4] border border-[#D9D4C7] overflow-x-auto">
          <button
            id="tab-analytics-all"
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeSection === 'all'
                ? 'bg-white text-[#2D2D2A] shadow-xs font-semibold'
                : 'text-[#726E65] hover:text-[#2D2D2A]'
            }`}
          >
            All Intelligence
          </button>
          <button
            id="tab-analytics-collection"
            onClick={() => setActiveSection('collection')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeSection === 'collection'
                ? 'bg-white text-[#2D2D2A] shadow-xs font-semibold'
                : 'text-[#726E65] hover:text-[#2D2D2A]'
            }`}
          >
            Collection
          </button>
          <button
            id="tab-analytics-listening"
            onClick={() => setActiveSection('listening')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeSection === 'listening'
                ? 'bg-white text-[#2D2D2A] shadow-xs font-semibold'
                : 'text-[#726E65] hover:text-[#2D2D2A]'
            }`}
          >
            Listening History
          </button>
          <button
            id="tab-analytics-completeness"
            onClick={() => setActiveSection('completeness')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeSection === 'completeness'
                ? 'bg-white text-[#2D2D2A] shadow-xs font-semibold'
                : 'text-[#726E65] hover:text-[#2D2D2A]'
            }`}
          >
            Registry Health
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION A: COLLECTION INTELLIGENCE ("What do I own?")     */}
      {/* ========================================================= */}
      {(activeSection === 'all' || activeSection === 'collection') && (
        <section id="section-collection-intelligence" className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc className="w-4 h-4 text-[#5D614E]" />
              <h3 className="font-serif text-lg font-semibold text-[#2D2D2A]">
                Collection Overview & Composition
              </h3>
            </div>
            <span className="text-xs font-mono text-[#726E65]">
              {collectionOverview.totalRecords} Records Registered
            </span>
          </div>

          {/* Collection Overview KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Records */}
            <div className="p-4 rounded-2xl bg-white border border-[#D9D4C7] space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[#726E65]">
                <span className="text-xs font-medium">Total Records</span>
                <Disc className="w-4 h-4 text-[#5D614E]" />
              </div>
              <p className="text-2xl font-bold text-[#2D2D2A] font-mono">
                {collectionOverview.totalRecords}
              </p>
              <p className="text-[11px] text-[#726E65]">
                across {collectionOverview.uniqueArtists} unique artists
              </p>
            </div>

            {/* Diversity (Genres & Decades) */}
            <div className="p-4 rounded-2xl bg-white border border-[#D9D4C7] space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[#726E65]">
                <span className="text-xs font-medium">Musical Diversity</span>
                <Layers className="w-4 h-4 text-[#5D614E]" />
              </div>
              <p className="text-2xl font-bold text-[#2D2D2A] font-mono">
                {collectionOverview.uniqueGenres} <span className="text-sm font-normal text-[#726E65]">genres</span>
              </p>
              <p className="text-[11px] text-[#726E65]">
                {collectionOverview.uniqueStyles} styles across {collectionOverview.representedDecadesCount} decades
              </p>
            </div>

            {/* Era Span */}
            <div className="p-4 rounded-2xl bg-white border border-[#D9D4C7] space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[#726E65]">
                <span className="text-xs font-medium">Release Span</span>
                <Calendar className="w-4 h-4 text-[#5D614E]" />
              </div>
              <p className="text-lg font-bold text-[#2D2D2A] font-mono truncate">
                {collectionOverview.releaseYearSpan
                  ? `${collectionOverview.releaseYearSpan.min} – ${collectionOverview.releaseYearSpan.max}`
                  : 'N/A'}
              </p>
              <p className="text-[11px] text-[#726E65]">
                {collectionOverview.releaseYearSpan
                  ? `${collectionOverview.releaseYearSpan.spanYears}-year span`
                  : 'No release years'}
              </p>
            </div>

            {/* Ratings & Special Editions */}
            <div className="p-4 rounded-2xl bg-white border border-[#D9D4C7] space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[#726E65]">
                <span className="text-xs font-medium">Catalog Ratings</span>
                <Star className="w-4 h-4 text-[#5D614E]" />
              </div>
              <p className="text-2xl font-bold text-[#2D2D2A] font-mono">
                {collectionOverview.averageRating ? `★ ${collectionOverview.averageRating}` : 'Unrated'}
              </p>
              <p className="text-[11px] text-[#726E65]">
                {collectionOverview.ratedRecordsCount} rated • {collectionOverview.unratedRecordsCount} unrated
              </p>
            </div>
          </div>

          {/* Demographics Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Genre Distribution */}
            <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#5D614E]" />
                  <span>Genre Distribution</span>
                </h4>
                <span className="text-[10px] text-[#726E65] font-mono">
                  Multi-genre records counted per tag
                </span>
              </div>

              {collectionDemographics.genresDistribution.length === 0 ? (
                <p className="text-xs text-[#726E65] italic">No genres entered in collection.</p>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {collectionDemographics.genresDistribution.slice(0, 7).map((g) => (
                    <div key={g.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#2D2D2A] font-medium">{g.name}</span>
                        <span className="font-mono text-[#726E65]">
                          {g.count} records ({g.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#EFECE4] overflow-hidden">
                        <div
                          className="h-full bg-[#5D614E] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(4, g.percentage))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Style Distribution */}
            <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#5D614E]" />
                  <span>Style Distribution</span>
                </h4>
                <span className="text-[10px] text-[#726E65] font-mono">
                  {collectionDemographics.stylesDistribution.length} Distinct Styles
                </span>
              </div>

              {collectionDemographics.stylesDistribution.length === 0 ? (
                <p className="text-xs text-[#726E65] italic">No styles entered in collection.</p>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {collectionDemographics.stylesDistribution.slice(0, 7).map((s) => (
                    <div key={s.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#2D2D2A] font-medium">{s.name}</span>
                        <span className="font-mono text-[#726E65]">
                          {s.count} records ({s.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#EFECE4] overflow-hidden">
                        <div
                          className="h-full bg-[#8B8C7A] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(4, s.percentage))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Decades / Era Distribution */}
            <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#5D614E]" />
                  <span>Release Decades</span>
                </h4>
                <span className="text-[10px] text-[#726E65] font-mono">
                  {collectionDemographics.decadesDistribution.length} Decades
                </span>
              </div>

              {collectionDemographics.decadesDistribution.length === 0 ? (
                <p className="text-xs text-[#726E65] italic">No release dates recorded.</p>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {collectionDemographics.decadesDistribution.map((d) => {
                    const maxDecade = Math.max(
                      ...collectionDemographics.decadesDistribution.map((x) => x.count),
                      1
                    );
                    const relativeWidth = Math.round((d.count / maxDecade) * 100);
                    return (
                      <div key={d.decade} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#2D2D2A] font-mono font-medium">{d.decade}</span>
                          <span className="font-mono text-[#726E65]">
                            {d.count} albums ({d.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#EFECE4] overflow-hidden">
                          <div
                            className="h-full bg-[#8B8C7A] rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(4, relativeWidth))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Formats & Editions */}
            <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5D614E]" />
                <span>Physical Formats & Editions</span>
              </h4>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-[#2D2D2A] block">Special Editions & Pressings</span>
                    <span className="text-[11px] text-[#726E65]">Box sets, anniversary & picture discs</span>
                  </div>
                  <span className="font-mono font-semibold text-[#5D614E] text-sm">
                    {collectionOverview.recordsWithEditionCount}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-[#2D2D2A] block">Colored Vinyl & Variants</span>
                    <span className="text-[11px] text-[#726E65]">Colorways, splatters & custom pressings</span>
                  </div>
                  <span className="font-mono font-semibold text-[#5D614E] text-sm">
                    {collectionOverview.recordsWithVariantCount}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-mono text-[#726E65] block mb-1.5 uppercase">
                    Formats Breakdown
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {collectionDemographics.formatsDistribution.map((f) => (
                      <span
                        key={f.format}
                        className="px-2 py-1 rounded-lg bg-[#EAE6DC] border border-[#D9D4C7] text-xs font-mono text-[#474A3D]"
                      >
                        {f.format}: <strong>{f.count}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Breakdown & Highlights */}
            <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#5D614E]" />
                  <span>Personal Rating Spectrum</span>
                </h4>
                <span className="text-xs font-mono text-[#5D614E] font-medium">
                  {collectionOverview.averageRating ? `Avg: ★ ${collectionOverview.averageRating}` : 'No ratings'}
                </span>
              </div>

              {collectionDemographics.ratingDistribution.length === 0 ? (
                <p className="text-xs text-[#726E65] italic">No albums rated yet.</p>
              ) : (
                <div className="space-y-2 pt-1">
                  {collectionDemographics.ratingDistribution.map((r) => (
                    <div key={r.rating} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#2D2D2A] font-medium flex items-center gap-1">
                          <span>{r.label}</span>
                        </span>
                        <span className="font-mono text-[#726E65]">
                          {r.count} ({r.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#EFECE4] overflow-hidden">
                        <div
                          className="h-full bg-[#5D614E] rounded-full"
                          style={{ width: `${Math.min(100, Math.max(4, r.percentage))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Collection Growth / Recently Added */}
          {collectionGrowth.recentlyAdded.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#5D614E]" />
                  <span>Recently Added to Collection</span>
                </h4>
                <span className="text-xs text-[#726E65] font-mono">By registration date</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {collectionGrowth.recentlyAdded.slice(0, 4).map((album) => (
                  <div
                    key={album.id}
                    onClick={() => onSelectAlbum(album)}
                    className="p-3 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] hover:border-[#8B8C7A] hover:bg-[#FAF8F5] cursor-pointer transition flex items-center gap-2.5"
                  >
                    <VinylArtwork album={album} size="sm" />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-serif text-xs font-medium text-[#2D2D2A] truncate">
                        {album.title}
                      </h5>
                      <p className="text-[11px] text-[#726E65] truncate">{album.artist}</p>
                      <span className="text-[10px] text-[#8B8C7A] font-mono block mt-0.5">
                        {formatDate(album.addedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION B: LISTENING INTELLIGENCE ("What am I doing?")   */}
      {/* ========================================================= */}
      {(activeSection === 'all' || activeSection === 'listening') && (
        <section id="section-listening-intelligence" className="space-y-5 pt-4 border-t border-[#D9D4C7]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-[#5D614E]" />
              <h3 className="font-serif text-lg font-semibold text-[#2D2D2A]">
                Listening Intelligence
              </h3>
            </div>

            {/* Time-Range Filter Controls */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EFECE4] border border-[#D9D4C7] self-start sm:self-auto">
              <Filter className="w-3.5 h-3.5 text-[#726E65] ml-1.5 mr-0.5" />
              {(['all', '30d', '90d', 'year'] as AnalyticsTimeRange[]).map((range) => {
                const labelMap: Record<AnalyticsTimeRange, string> = {
                  all: 'All Time',
                  '30d': '30 Days',
                  '90d': '90 Days',
                  year: 'This Year',
                };
                return (
                  <button
                    key={range}
                    id={`time-range-btn-${range}`}
                    onClick={() => setTimeRange(range)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                      timeRange === range
                        ? 'bg-[#5D614E] text-[#FAF8F5] font-semibold shadow-xs'
                        : 'text-[#726E65] hover:text-[#2D2D2A]'
                    }`}
                  >
                    {labelMap[range]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLD-START ZERO LISTENS EMPTY STATE */}
          {!listeningOverview.hasListeningData ? (
            <div
              id="listening-cold-start-banner"
              className="p-8 rounded-2xl bg-white border border-dashed border-[#D9D4C7] text-center space-y-3"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[#EAE6DC] flex items-center justify-center text-[#5D614E]">
                <Headphones className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="font-serif text-base font-semibold text-[#2D2D2A]">
                  Your listening history will build here as you spin records
                </h4>
                <p className="text-xs text-[#726E65] leading-relaxed">
                  As you log spins from the Library or Discover tab, collection engagement rates,
                  most/least played rankings, artist listening trends, and time-of-day listening habits
                  will calculate dynamically here.
                </p>
              </div>
              <p className="text-[11px] font-mono text-[#8B8C7A]">
                0 spins recorded in selected time range • No sample data fabricated
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Listening Overview KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total Listens */}
                <div className="p-4 rounded-2xl bg-white border border-[#D9D4C7] space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-[#726E65]">
                    <span className="text-xs font-medium">Total Spins</span>
                    <Headphones className="w-4 h-4 text-[#5D614E]" />
                  </div>
                  <p className="text-2xl font-bold text-[#2D2D2A] font-mono">
                    {listeningOverview.totalListens}
                  </p>
                  <p className="text-[11px] text-[#726E65]">
                    {listeningOverview.uniqueRecordsPlayed} unique records spun
                  </p>
                </div>

                {/* Collection Engagement Rate */}
                <div className="p-4 rounded-2xl bg-white border border-[#D9D4C7] space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-[#726E65]">
                    <span className="text-xs font-medium">Engagement Rate</span>
                    <TrendingUp className="w-4 h-4 text-[#5D614E]" />
                  </div>
                  <p className="text-2xl font-bold text-[#2D2D2A] font-mono">
                    {listeningOverview.collectionEngagementRate}%
                  </p>
                  <p className="text-[11px] text-[#726E65]">
                    of collection played at least once
                  </p>
                </div>

                {/* Avg Listens per Played Record */}
                <div className="p-4 rounded-2xl bg-white border border-[#D9D4C7] space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-[#726E65]">
                    <span className="text-xs font-medium">Rotation Depth</span>
                    <RotateCcw className="w-4 h-4 text-[#5D614E]" />
                  </div>
                  <p className="text-2xl font-bold text-[#2D2D2A] font-mono">
                    {listeningOverview.averageListensPerPlayedRecord ?? '0'}
                  </p>
                  <p className="text-[11px] text-[#726E65]">
                    avg spins per played record
                  </p>
                </div>

                {/* Session Average Rating */}
                <div className="p-4 rounded-2xl bg-white border border-[#D9D4C7] space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-[#726E65]">
                    <span className="text-xs font-medium">Session Mood</span>
                    <Star className="w-4 h-4 text-[#5D614E]" />
                  </div>
                  <p className="text-2xl font-bold text-[#2D2D2A] font-mono">
                    {listeningOverview.averageSessionRating ? `★ ${listeningOverview.averageSessionRating}` : 'Unrated'}
                  </p>
                  <p className="text-[11px] text-[#726E65]">
                    avg listen log session rating
                  </p>
                </div>
              </div>

              {/* Played vs Never Played Dual Bar (Reconciled directly with Library filter) */}
              <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <h4 className="font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                    <Disc className="w-3.5 h-3.5 text-[#5D614E]" />
                    <span>Collection Engagement: Played vs Never Played</span>
                  </h4>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="flex items-center gap-1 text-[#5D614E] font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5D614E]" />
                      Played: {listeningOverview.uniqueRecordsPlayed} ({listeningOverview.collectionEngagementRate}%)
                    </span>
                    <span className="flex items-center gap-1 text-[#8B8C7A] font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D9D4C7]" />
                      Unplayed: {listeningOverview.recordsNeverPlayed} (
                      {100 - listeningOverview.collectionEngagementRate}%)
                    </span>
                  </div>
                </div>

                {/* Visual dual bar */}
                <div className="w-full h-3 rounded-full bg-[#EFECE4] overflow-hidden flex">
                  <div
                    className="h-full bg-[#5D614E] transition-all duration-500"
                    style={{ width: `${listeningOverview.collectionEngagementRate}%` }}
                    title={`Played: ${listeningOverview.uniqueRecordsPlayed} records`}
                  />
                  <div
                    className="h-full bg-[#D9D4C7] transition-all duration-500"
                    style={{ width: `${100 - listeningOverview.collectionEngagementRate}%` }}
                    title={`Never Played: ${listeningOverview.recordsNeverPlayed} records`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#726E65] pt-1">
                  <span>
                    First recorded spin:{' '}
                    <strong>
                      {listeningOverview.firstRecordedListen
                        ? formatDate(listeningOverview.firstRecordedListen.log.listenedAt)
                        : 'None'}
                    </strong>
                  </span>
                  <span>
                    Most recent spin:{' '}
                    <strong>
                      {listeningOverview.mostRecentListen
                        ? formatDate(listeningOverview.mostRecentListen.log.listenedAt)
                        : 'None'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* History-Aware Insights (Analytical Classifications) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Neglected Records */}
                <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#8A5A53]" />
                      <span>Neglected Records</span>
                    </h4>
                    <span className="text-[11px] font-mono text-[#726E65]">Played &gt;30d ago</span>
                  </div>

                  {insights.neglectedRecords.length === 0 ? (
                    <p className="text-xs text-[#726E65] italic py-2">
                      No neglected records. Either all records were played recently or not yet spun.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {insights.neglectedRecords.slice(0, 4).map((item) => (
                        <div
                          key={item.album.id}
                          className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] flex items-center justify-between gap-3 text-xs"
                        >
                          <div
                            onClick={() => onSelectAlbum(item.album)}
                            className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                          >
                            <VinylArtwork album={item.album} size="sm" />
                            <div className="min-w-0">
                              <h5 className="font-serif font-medium text-[#2D2D2A] truncate">
                                {item.album.title}
                              </h5>
                              <p className="text-[11px] text-[#726E65] truncate">
                                {item.album.artist} • Last played {item.daysSinceLastListen}d ago
                              </p>
                            </div>
                          </div>
                          {onLogListen && (
                            <button
                              onClick={() => onLogListen(item.album)}
                              className="px-2 py-1 rounded-lg bg-[#5D614E] text-[#FAF8F5] text-[11px] font-medium hover:bg-[#4E5240] transition flex-shrink-0 flex items-center gap-1"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>Spin</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Highly Rated Underplayed */}
                <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-[#5D614E]" />
                      <span>Highly Rated but Underplayed</span>
                    </h4>
                    <span className="text-[11px] font-mono text-[#726E65]">★ 4.0+ & ≤1 spin</span>
                  </div>

                  {insights.highlyRatedUnderplayed.length === 0 ? (
                    <p className="text-xs text-[#726E65] italic py-2">
                      No highly rated underplayed records found.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {insights.highlyRatedUnderplayed.slice(0, 4).map((item) => (
                        <div
                          key={item.album.id}
                          className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] flex items-center justify-between gap-3 text-xs"
                        >
                          <div
                            onClick={() => onSelectAlbum(item.album)}
                            className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                          >
                            <VinylArtwork album={item.album} size="sm" />
                            <div className="min-w-0">
                              <h5 className="font-serif font-medium text-[#2D2D2A] truncate">
                                {item.album.title}
                              </h5>
                              <p className="text-[11px] text-[#726E65] truncate">
                                {item.album.artist} • ★ {item.rating} ({item.playCount} {item.playCount === 1 ? 'spin' : 'spins'})
                              </p>
                            </div>
                          </div>
                          {onLogListen && (
                            <button
                              onClick={() => onLogListen(item.album)}
                              className="px-2 py-1 rounded-lg bg-[#5D614E] text-[#FAF8F5] text-[11px] font-medium hover:bg-[#4E5240] transition flex-shrink-0 flex items-center gap-1"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>Spin</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Listening Rankings (Most, Least, Recently, Never Played) */}
              <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#5D614E]" />
                    <span>Record Rankings</span>
                  </h4>

                  {/* Ranking Sub-tabs */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EFECE4] border border-[#D9D4C7] text-xs">
                    <button
                      id="btn-ranking-most"
                      onClick={() => setRankingTab('most')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        rankingTab === 'most'
                          ? 'bg-white text-[#2D2D2A] font-semibold shadow-xs'
                          : 'text-[#726E65]'
                      }`}
                    >
                      Most Played ({listeningRankings.mostPlayed.length})
                    </button>
                    <button
                      id="btn-ranking-least"
                      onClick={() => setRankingTab('least')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        rankingTab === 'least'
                          ? 'bg-white text-[#2D2D2A] font-semibold shadow-xs'
                          : 'text-[#726E65]'
                      }`}
                    >
                      Least Played ({listeningRankings.leastPlayed.length})
                    </button>
                    <button
                      id="btn-ranking-recent"
                      onClick={() => setRankingTab('recent')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        rankingTab === 'recent'
                          ? 'bg-white text-[#2D2D2A] font-semibold shadow-xs'
                          : 'text-[#726E65]'
                      }`}
                    >
                      Recently Spun
                    </button>
                    <button
                      id="btn-ranking-never"
                      onClick={() => setRankingTab('never')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        rankingTab === 'never'
                          ? 'bg-white text-[#2D2D2A] font-semibold shadow-xs'
                          : 'text-[#726E65]'
                      }`}
                    >
                      Never Played ({listeningOverview.recordsNeverPlayed})
                    </button>
                  </div>
                </div>

                {/* Ranking Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {rankingTab === 'most' &&
                    listeningRankings.mostPlayed.map((item, idx) => (
                      <div
                        key={item.album.id}
                        id={`ranking-item-most-${item.album.id}`}
                        onClick={() => onSelectAlbum(item.album)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] hover:border-[#8B8C7A] hover:bg-[#FAF8F5] cursor-pointer transition"
                      >
                        <span className="text-xs font-mono text-[#5D614E] font-bold w-4">
                          #{idx + 1}
                        </span>
                        <VinylArtwork album={item.album} size="sm" />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-serif text-xs font-medium text-[#2D2D2A] truncate">
                            {item.album.title}
                          </h5>
                          <p className="text-[11px] text-[#726E65] truncate">{item.album.artist}</p>
                          <span className="text-[10px] font-mono text-[#5D614E] block mt-0.5 font-semibold">
                            {item.playCount} {item.playCount === 1 ? 'play' : 'plays'}
                          </span>
                        </div>
                      </div>
                    ))}

                  {rankingTab === 'least' &&
                    listeningRankings.leastPlayed.map((item, idx) => (
                      <div
                        key={item.album.id}
                        id={`ranking-item-least-${item.album.id}`}
                        onClick={() => onSelectAlbum(item.album)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] hover:border-[#8B8C7A] hover:bg-[#FAF8F5] cursor-pointer transition"
                      >
                        <span className="text-xs font-mono text-[#726E65] font-bold w-4">
                          #{idx + 1}
                        </span>
                        <VinylArtwork album={item.album} size="sm" />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-serif text-xs font-medium text-[#2D2D2A] truncate">
                            {item.album.title}
                          </h5>
                          <p className="text-[11px] text-[#726E65] truncate">{item.album.artist}</p>
                          <span className="text-[10px] font-mono text-[#726E65] block mt-0.5">
                            {item.playCount} {item.playCount === 1 ? 'spin' : 'spins'}
                          </span>
                        </div>
                      </div>
                    ))}

                  {rankingTab === 'recent' &&
                    listeningRankings.recentlyPlayed.map((item) => (
                      <div
                        key={item.album.id}
                        id={`ranking-item-recent-${item.album.id}`}
                        onClick={() => onSelectAlbum(item.album)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] hover:border-[#8B8C7A] hover:bg-[#FAF8F5] cursor-pointer transition"
                      >
                        <VinylArtwork album={item.album} size="sm" />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-serif text-xs font-medium text-[#2D2D2A] truncate">
                            {item.album.title}
                          </h5>
                          <p className="text-[11px] text-[#726E65] truncate">{item.album.artist}</p>
                          <span className="text-[10px] font-mono text-[#5D614E] block mt-0.5">
                            Last: {formatDate(item.lastPlayed)}
                          </span>
                        </div>
                      </div>
                    ))}

                  {rankingTab === 'never' && (
                    <>
                      {listeningRankings.neverPlayed.slice(0, 18).map((album) => (
                        <div
                          key={album.id}
                          id={`ranking-item-never-${album.id}`}
                          onClick={() => onSelectAlbum(album)}
                          className="flex items-center gap-3 p-3 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] hover:border-[#8B8C7A] hover:bg-[#FAF8F5] cursor-pointer transition"
                        >
                          <VinylArtwork album={album} size="sm" />
                          <div className="min-w-0 flex-1">
                            <h5 className="font-serif text-xs font-medium text-[#2D2D2A] truncate">
                              {album.title}
                            </h5>
                            <p className="text-[11px] text-[#726E65] truncate">{album.artist}</p>
                            <span className="text-[10px] font-mono text-[#8A5A53] block mt-0.5">
                              0 spins logged
                            </span>
                          </div>
                        </div>
                      ))}
                      {listeningRankings.neverPlayed.length > 18 && (
                        <div className="col-span-full text-center py-2 text-xs text-[#726E65] font-mono">
                          Showing first 18 of {listeningOverview.recordsNeverPlayed} unplayed records. Use the Library filter to view all.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Artist & Genre Listening Aggregations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Most Listened Artists */}
                <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#5D614E]" />
                      <span>Most Listened Artists</span>
                    </h4>
                    <span className="text-[10px] font-mono text-[#726E65]">
                      Spins vs Unique Records
                    </span>
                  </div>

                  {artistListening.topArtists.length === 0 ? (
                    <p className="text-xs text-[#726E65] italic">No artist listening data yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {artistListening.topArtists.slice(0, 5).map((a, idx) => (
                        <div
                          key={a.artist}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="w-5 h-5 rounded-full bg-[#EAE6DC] text-[#474A3D] font-mono text-[10px] flex items-center justify-center flex-shrink-0">
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <span className="text-[#2D2D2A] font-medium block truncate">
                                {a.artist}
                              </span>
                              <span className="text-[10px] text-[#726E65]">
                                {a.uniqueRecordsPlayed} of {a.totalRecordsOwned} records spun
                              </span>
                            </div>
                          </div>
                          <span className="font-mono text-[#5D614E] font-semibold flex-shrink-0">
                            {a.totalListens} {a.totalListens === 1 ? 'spin' : 'spins'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Genre Listening Activity */}
                <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#5D614E]" />
                      <span>Listening by Genre</span>
                    </h4>
                    <span className="text-[10px] font-mono text-[#726E65]">
                      Active genres in rotation
                    </span>
                  </div>

                  {genreListening.topGenres.length === 0 ? (
                    <p className="text-xs text-[#726E65] italic">No genre listening data yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {genreListening.topGenres.slice(0, 5).map((g) => (
                        <div
                          key={g.genre}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-xs"
                        >
                          <div>
                            <span className="text-[#2D2D2A] font-medium block">{g.genre}</span>
                            <span className="text-[10px] text-[#726E65]">
                              {g.uniqueRecordsPlayed} unique records spun
                            </span>
                          </div>
                          <span className="font-mono text-[#5D614E] font-semibold">
                            {g.totalListens} {g.totalListens === 1 ? 'spin' : 'spins'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Temporal Patterns (Weekday & Time of Day) */}
              <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#5D614E]" />
                    <span>Listening Habits & Temporal Patterns</span>
                  </h4>
                  <span className="text-xs font-mono text-[#726E65]">
                    {temporalListening.listensByWeekday.reduce((acc, c) => acc + c.count, 0)} sessions
                  </span>
                </div>

                {!listeningOverview.hasSufficientData ? (
                  <div className="p-4 rounded-xl bg-[#FCFAF6] border border-dashed border-[#D9D4C7] text-center space-y-1">
                    <p className="text-xs text-[#726E65]">
                      Insufficient temporal data for pattern charts.
                    </p>
                    <p className="text-[11px] text-[#8B8C7A]">
                      At least 3 logged spins are required to reveal time-of-day and weekday distribution habits.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Weekday Distribution Bar Chart */}
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-[#726E65] block uppercase">
                        Spins by Day of Week
                      </span>
                      <div className="space-y-1.5">
                        {temporalListening.listensByWeekday.map((item) => {
                          const maxDay = Math.max(
                            ...temporalListening.listensByWeekday.map((w) => w.count),
                            1
                          );
                          const relativeWidth = Math.round((item.count / maxDay) * 100);
                          return (
                            <div key={item.day} className="space-y-0.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-[#2D2D2A] w-8">{item.day}</span>
                                <span className="font-mono text-[#726E65]">
                                  {item.count} {item.count === 1 ? 'spin' : 'spins'}
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-[#EFECE4] overflow-hidden">
                                <div
                                  className="h-full bg-[#5D614E] rounded-full"
                                  style={{ width: `${Math.min(100, Math.max(item.count > 0 ? 6 : 0, relativeWidth))}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time of Day Slots */}
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-[#726E65] block uppercase">
                        Time of Day Preferences
                      </span>
                      <div className="space-y-2">
                        {temporalListening.listensByTimeOfDay.map((slot) => (
                          <div
                            key={slot.timeSlot}
                            className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] space-y-1"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <span className="font-medium text-[#2D2D2A] block">{slot.label}</span>
                                <span className="text-[10px] text-[#726E65] font-mono">{slot.hours}</span>
                              </div>
                              <span className="font-mono font-semibold text-[#5D614E]">
                                {slot.count} ({slot.percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#EFECE4] overflow-hidden">
                              <div
                                className="h-full bg-[#8B8C7A] rounded-full"
                                style={{ width: `${Math.min(100, Math.max(slot.count > 0 ? 6 : 0, slot.percentage))}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Listening Journal Timeline */}
              <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-[#5D614E]" />
                    <span>Recent Listening Activity Timeline</span>
                  </h4>
                  <span className="text-xs font-mono text-[#726E65]">
                    {listenLogs.length} total entries
                  </span>
                </div>

                <div className="space-y-2">
                  {[...listenLogs]
                    .sort((a, b) => new Date(b.listenedAt).getTime() - new Date(a.listenedAt).getTime())
                    .slice(0, 10)
                    .map((log) => {
                      const alb = albumMap.get(log.recordId);
                      return (
                        <div
                          key={log.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {alb && <VinylArtwork album={alb} size="sm" />}
                            <div className="min-w-0">
                              <h5
                                onClick={() => alb && onSelectAlbum(alb)}
                                className="font-serif text-xs font-medium text-[#2D2D2A] hover:text-[#5D614E] cursor-pointer truncate"
                              >
                                {alb ? alb.title : 'Record removed'}
                              </h5>
                              <p className="text-[11px] text-[#726E65] truncate">
                                {alb?.artist || ''} • {formatDate(log.listenedAt)}
                                {log.context && ` • ${log.context}`}
                              </p>
                              {log.note && (
                                <p className="text-[11px] text-[#726E65] italic mt-0.5 truncate">
                                  "{log.note}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {log.rating && <RatingStars value={log.rating} size="sm" />}
                            <button
                              onClick={() => onDeleteListenLog(log.id)}
                              className="p-1.5 text-[#A6A295] hover:text-[#8A5A53] hover:bg-[#EAE6DC] rounded-lg transition"
                              title="Delete log entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION C: REGISTRY COMPLETENESS & HEALTH                 */}
      {/* ========================================================= */}
      {(activeSection === 'all' || activeSection === 'completeness') && (
        <section id="section-registry-completeness" className="space-y-5 pt-4 border-t border-[#D9D4C7]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#5D614E]" />
              <h3 className="font-serif text-lg font-semibold text-[#2D2D2A]">
                Registry Completeness & Health
              </h3>
            </div>
            <span className="text-xs font-mono text-[#5D614E] font-semibold">
              {registryCompleteness.overallPercentage}% Complete
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall Completeness Card */}
            <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
              <span className="text-xs font-mono uppercase tracking-wider text-[#726E65] block">
                Catalog Health Score
              </span>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-mono text-[#2D2D2A]">
                    {registryCompleteness.overallPercentage}%
                  </span>
                  <span className="text-xs text-[#726E65]">metadata fidelity</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#EFECE4] overflow-hidden">
                  <div
                    className="h-full bg-[#5D614E] rounded-full transition-all duration-500"
                    style={{ width: `${registryCompleteness.overallPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#726E65] leading-relaxed pt-1">
                  Weighted assessment across identity (artist, title), catalog metadata (year, genre, label, format),
                  and physical pressing details (edition, variant, catalog #).
                </p>
              </div>
            </div>

            {/* Field-by-Field Completeness */}
            <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs md:col-span-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#726E65] block">
                Metadata Field Coverage
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {registryCompleteness.fieldCompleteness.map((f) => (
                  <div key={f.field} className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#2D2D2A] font-medium">{f.label}</span>
                      <span className="font-mono text-[#726E65]">
                        {f.filledCount}/{collectionOverview.totalRecords} ({f.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#EFECE4] overflow-hidden">
                      <div
                        className="h-full bg-[#5D614E] rounded-full"
                        style={{ width: `${f.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Records with Opportunities for Improvement */}
          {registryCompleteness.incompleteAlbums.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#8A5A53]" />
                  <span>Records with Incomplete Information</span>
                </span>
                <span className="text-xs text-[#726E65] font-mono">
                  Tap any record to inspect and edit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {registryCompleteness.incompleteAlbums.slice(0, 6).map((item) => (
                  <div
                    key={item.album.id}
                    onClick={() => onSelectAlbum(item.album)}
                    className="p-3 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] hover:border-[#8B8C7A] hover:bg-[#FAF8F5] cursor-pointer transition flex items-start gap-3"
                  >
                    <VinylArtwork album={item.album} size="sm" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <h5 className="font-serif text-xs font-medium text-[#2D2D2A] truncate">
                        {item.album.title}
                      </h5>
                      <p className="text-[11px] text-[#726E65] truncate">{item.album.artist}</p>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {item.missingFields.map((m) => (
                          <span
                            key={m}
                            className="px-1.5 py-0.2 rounded text-[9px] bg-[#EAE6DC] text-[#474A3D] font-mono"
                          >
                            Missing {m}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#726E65] font-semibold flex-shrink-0">
                      {item.completenessPercentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
