import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Compass,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  PlusCircle
} from 'lucide-react';
import { VideoItem } from '../types';
import { VideoCard } from '../components/VideoCard';
import { CULTURAL_COUNTRIES, CULTURAL_CATEGORIES } from '../data/seedData';

interface ExploreViewProps {
  videos: VideoItem[];
  savedVideoIds: string[];
  onSelectVideo: (video: VideoItem) => void;
  onToggleSave: (videoId: string, e: React.MouseEvent) => void;
  initialCategory?: string;
  initialSearch?: string;
  onClearInitial?: () => void;
  onOpenShareModal?: () => void;
  onSelectCountry?: (countryId: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  videos,
  savedVideoIds,
  onSelectVideo,
  onToggleSave,
  initialCategory,
  initialSearch = '',
  onClearInitial,
  onOpenShareModal,
  onSelectCountry
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'views'>('popular');

  // Filter & sort logic
  const filteredVideos = useMemo(() => {
    return videos
      .filter((video) => {
        // Country filter
        if (selectedCountry !== 'all' && video.countryId !== selectedCountry) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && video.categoryId !== selectedCategory) {
          return false;
        }

        // Text search (search in title, description, countryName, categoryName, topic, tags)
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchTitle = video.title.toLowerCase().includes(query);
          const matchDesc = video.description.toLowerCase().includes(query);
          const matchCountry = video.countryName.toLowerCase().includes(query);
          const matchCat = video.categoryName.toLowerCase().includes(query);
          const matchTopic = (video.topic || '').toLowerCase().includes(query);
          const matchTags = (video.tags || []).some(t => t.toLowerCase().includes(query));

          if (!matchTitle && !matchDesc && !matchCountry && !matchCat && !matchTopic && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return (b.likesCount || 0) - (a.likesCount || 0);
        }
        if (sortBy === 'views') {
          return (b.views || 0) - (a.views || 0);
        }
        // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [videos, selectedCountry, selectedCategory, searchTerm, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCountry('all');
    setSelectedCategory('all');
    setSortBy('popular');
    if (onClearInitial) onClearInitial();
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title & Introduction */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Cultural Exploration Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
          Explore World Traditions
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Filter by sovereign nation, traditional category, or search across rituals, festive celebrations, and artisanal recipes.
        </p>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        
        {/* Top bar: search input and sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by culture, country, ritual, dance, food (e.g. Japan, Chado, Samba)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="popular" className="bg-slate-900 text-white">Most Loved</option>
                <option value="newest" className="bg-slate-900 text-white">Recently Added</option>
                <option value="views" className="bg-slate-900 text-white">Most Viewed</option>
              </select>
            </div>

            {(selectedCountry !== 'all' || selectedCategory !== 'all' || searchTerm) && (
              <button
                onClick={handleResetFilters}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs shrink-0"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Country Filter dropdown and Cultural Dossier button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Country:</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium cursor-pointer"
            >
              <option value="all">🌍 All Countries</option>
              {CULTURAL_COUNTRIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name} {c.id === 'india' ? '★ (Top)' : ''}
                </option>
              ))}
            </select>

            {/* Quick button to jump to India dossier */}
            {onSelectCountry && selectedCountry !== 'india' && (
              <button
                onClick={() => onSelectCountry('india')}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                title="Explore India Cultural Dossier"
              >
                <span>🇮🇳 India Dossier</span>
              </button>
            )}
          </div>

          {/* Direct link to view the dossier of the selected country */}
          {onSelectCountry && selectedCountry !== 'all' && (
            <button
              onClick={() => onSelectCountry(selectedCountry)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                View {CULTURAL_COUNTRIES.find(c => c.id === selectedCountry)?.name || 'Country'} Cultural Dossier
              </span>
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 block mb-2">Category:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Categories
            </button>
            {CULTURAL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Results Count & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Showing <strong className="text-white">{filteredVideos.length}</strong> cultural videos</span>
          {searchTerm && (
            <span>Matching: <span className="text-amber-400 font-semibold">"{searchTerm}"</span></span>
          )}
        </div>

        {filteredVideos.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4 p-8">
            <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              {videos.length === 0 ? (
                <Sparkles className="w-8 h-8 text-amber-500" />
              ) : (
                <Search className="w-8 h-8 text-amber-500" />
              )}
            </div>
            <h3 className="text-lg font-bold text-white">
              {videos.length === 0 ? 'Fresh Start • No Cultural Videos Yet' : 'No cultural videos found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {videos.length === 0
                ? 'All previous videos were cleared for a fresh start. You can be the first cultural explorer to add a verified YouTube video!'
                : "We couldn't find any approved cultural videos matching your current filter criteria. Try resetting your search or contribute a new video!"}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              {videos.length > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-colors"
                >
                  Reset All Filters
                </button>
              )}
              {onOpenShareModal && (
                <button
                  onClick={onOpenShareModal}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Share Cultural Video</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
                isSaved={savedVideoIds.includes(video.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
