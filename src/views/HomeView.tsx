import React, { useState, useMemo } from 'react';
import {
  Globe2,
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  Eye,
  MapPin,
  PlusCircle,
  Youtube
} from 'lucide-react';
import { VideoItem } from '../types';
import { YouTubeVideoCard } from '../components/YouTubeVideoCard';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { CULTURAL_COUNTRIES, CULTURAL_CATEGORIES } from '../data/seedData';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { deleteUserVideo } from '../firebase/firestore';

interface HomeViewProps {
  videos: VideoItem[];
  savedVideoIds: string[];
  likedVideoIds?: string[];
  searchQuery?: string;
  onSelectVideo: (video: VideoItem) => void;
  onToggleSave: (videoId: string, e: React.MouseEvent) => void;
  onToggleLike?: (videoId: string, e: React.MouseEvent) => void;
  onNavigate: (view: string, param?: string) => void;
  onOpenShareModal: (preselectedCountry?: string) => void;
  onSearch: (term: string) => void;
  onShowToast?: (msg: string) => void;
  onVideoDeleted?: (deletedId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  videos,
  savedVideoIds,
  likedVideoIds = [],
  searchQuery = '',
  onSelectVideo,
  onToggleSave,
  onToggleLike,
  onNavigate,
  onOpenShareModal,
  onSearch,
  onShowToast,
  onVideoDeleted
}) => {
  const { user, isAdmin } = useAuth();
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest');
  
  // Single active video player state: ONLY ONE video plays at a time on the Home page
  const [activePlayingVideoId, setActivePlayingVideoId] = useState<string | null>(null);

  // In-UI Delete Confirmation state (no window.confirm)
  const [videoPendingDelete, setVideoPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);

  const handleDeleteVideo = (videoId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoPendingDelete({ id: videoId, title });
  };

  const handleConfirmDelete = async () => {
    if (!videoPendingDelete) return;
    const currentUid = user?.id || auth.currentUser?.uid;
    if (!currentUid) {
      if (onShowToast) onShowToast('Sign in required to delete videos.');
      return;
    }

    setIsDeletingVideo(true);
    try {
      await deleteUserVideo(videoPendingDelete.id, currentUid, isAdmin);
      if (activePlayingVideoId === videoPendingDelete.id) {
        setActivePlayingVideoId(null);
      }
      if (onVideoDeleted) {
        onVideoDeleted(videoPendingDelete.id);
      }
      if (onShowToast) {
        onShowToast(`Deleted "${videoPendingDelete.title}" completely.`);
      }
      setVideoPendingDelete(null);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(err.message || 'Failed to delete video.');
      }
    } finally {
      setIsDeletingVideo(false);
    }
  };

  // Filter and sort videos for the YouTube-style feed
  const feedVideos = useMemo(() => {
    let result = [...videos];

    // Country filter
    if (selectedCountryFilter !== 'all') {
      result = result.filter(
        (v) => v.countryId?.toLowerCase() === selectedCountryFilter.toLowerCase()
      );
    }

    // Category filter
    if (selectedCategoryFilter !== 'all') {
      result = result.filter(
        (v) => v.categoryId?.toLowerCase() === selectedCategoryFilter.toLowerCase()
      );
    }

    // Search query filter (searches title, country, category, contributor, description)
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.title?.toLowerCase().includes(q) ||
          v.countryName?.toLowerCase().includes(q) ||
          v.categoryName?.toLowerCase().includes(q) ||
          v.contributorName?.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q)
      );
    }

    // Sort order
    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (sortBy === 'views') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return result;
  }, [videos, selectedCountryFilter, selectedCategoryFilter, searchQuery, sortBy]);

  const handleOpenCountryProfile = (countryId: string) => {
    onNavigate('country-detail', countryId);
  };

  const handleTogglePlay = (videoId: string) => {
    // Only one video plays at a time: if already playing, stop; otherwise switch to this video
    setActivePlayingVideoId((prev) => (prev === videoId ? null : videoId));
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Cultural Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-slate-800/80 shadow-2xl p-6 sm:p-10 lg:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-rose-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider">
            <Globe2 className="w-3.5 h-3.5 text-amber-400" />
            <span>GoGlobal Cultural Community</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-serif leading-[1.15]">
            Explore the World. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-200">
              Share Your Culture.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Immerse yourself in authentic cultural YouTube videos from countries around the globe. Discover ancient traditions, handmade cuisine, vibrant carnivals, traditional dance, and sacred heritage.
          </p>

          {/* Quick Cultural Search Chips */}
          <div className="pt-1 flex flex-wrap gap-2 items-center text-xs">
            <span className="text-slate-400 font-medium">Trending Nations:</span>
            {CULTURAL_COUNTRIES.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => handleOpenCountryProfile(c.id)}
                className="px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-400/50 transition-all font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="pt-3 flex flex-wrap gap-3">
            <a
              href="#youtube-cultural-feed"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-xl shadow-red-600/20 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <Youtube className="w-4 h-4 fill-current" />
              <span>Watch Video Feed ↓</span>
            </a>

            <button
              onClick={() => handleOpenCountryProfile('india')}
              className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Explore India Dossier 🇮🇳</span>
            </button>

            <button
              onClick={() => onOpenShareModal()}
              className="px-6 py-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-100 hover:text-white border border-slate-700/80 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Share YouTube Video</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Sovereign Country Profiles Carousel */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-400" />
            Sovereign Country Profiles
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Click any country to view its dedicated profile page, flag, heritage description & videos
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CULTURAL_COUNTRIES.slice(0, 6).map((country) => (
            <div
              key={country.id}
              onClick={() => handleOpenCountryProfile(country.id)}
              className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/5] w-full overflow-hidden relative">
                <img
                  src={country.bannerImage}
                  alt={country.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                <div className="absolute top-2.5 right-2.5 text-2xl filter drop-shadow">
                  {country.flag}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                    {country.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">
                    {country.region}
                  </p>
                  <span className="inline-block mt-1 text-[10px] text-amber-400 font-semibold">
                    View Country Profile →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Civilizational Spotlight: India */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Top Civilizational Dossier
              </span>
              <span className="text-xs text-slate-400">5,000+ Years Living History</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-serif flex items-center gap-3">
              <span>Explore India's Sacred Heritage</span>
              <span className="text-3xl">🇮🇳</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Dive into the sacred Ganga Aarti of Varanasi, Natya Shastra classical dances, 42 UNESCO World Heritage sites, Ayurvedic gastronomy, and the eternal spirit of <em className="text-amber-300 font-serif">Vasudhaiva Kutumbakam</em>.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                🏮 Varanasi Ganga Aarti
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                💃 Bharatanatyam & Kathak
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                🎉 Diwali & Holi
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                🍲 Ayurvedic Shad-Rasa
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => handleOpenCountryProfile('india')}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View India Dossier 🇮🇳</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenShareModal('india')}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Contribute India Video</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Cultural Categories */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Cultural Categories
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Click any category to filter the video feed below by tradition, cuisine, or music
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {CULTURAL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategoryFilter === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategoryFilter(isSelected ? 'all' : cat.id);
                  document.getElementById('youtube-cultural-feed')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group p-4 rounded-2xl border cursor-pointer transition-all shadow-sm flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-amber-500/10'
                    : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80'
                }`}
              >
                <div className="text-3xl mb-2.5 transform group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <div>
                  <h3 className={`font-bold text-xs sm:text-sm transition-colors ${isSelected ? 'text-amber-300' : 'text-slate-100 group-hover:text-amber-300'}`}>
                    {cat.name} {isSelected && '✓'}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PRIMARY GLOBAL VIDEO FEED (DOWN IN HOME PAGE - ONLY ONE VIDEO PLAYING) */}
      {/* ========================================================================= */}
      <section id="youtube-cultural-feed" className="space-y-6 pt-4 border-t border-slate-800/80">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
                <Youtube className="w-4 h-4 fill-current" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                Global Cultural Video Feed
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              YouTube cultural stories categorized by country. Click to play in-feed or open full discussion.
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                sortBy === 'latest'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Latest Uploads</span>
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                sortBy === 'popular'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Popular</span>
            </button>
            <button
              onClick={() => setSortBy('views')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                sortBy === 'views'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Most Viewed</span>
            </button>
          </div>
        </div>

        {/* YouTube Topic Filter Bar (Country Filter Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
          <button
            onClick={() => setSelectedCountryFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCountryFilter === 'all'
                ? 'bg-white text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 hover:text-white'
            }`}
          >
            <span>🌍</span>
            <span>All Countries ({videos.length})</span>
          </button>

          {CULTURAL_COUNTRIES.map((c) => {
            const count = videos.filter((v) => v.countryId?.toLowerCase() === c.id.toLowerCase()).length;
            const isSelected = selectedCountryFilter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCountryFilter(c.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800 hover:text-white'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* YouTube Feed Grid with Single Playing Video Control */}
        {feedVideos.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Youtube className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-white">No Videos in this Country Feed Yet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Be the first to upload an authentic YouTube video link and celebrate this nation's cultural heritage!
              </p>
            </div>
            <button
              onClick={() => onOpenShareModal(selectedCountryFilter !== 'all' ? selectedCountryFilter : undefined)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-extrabold text-xs shadow-lg inline-flex items-center gap-2 cursor-pointer transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Upload YouTube Video Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {feedVideos.map((video) => {
              const currentUid = user?.id || auth.currentUser?.uid;
              const currentUserEmail = user?.email || auth.currentUser?.email;
              const canDeleteThisVideo = Boolean(
                currentUid && (
                  video.contributorId === currentUid ||
                  isAdmin ||
                  (currentUserEmail && currentUserEmail.toLowerCase() === 'hariharinath55260@gmail.com') ||
                  !video.contributorId
                )
              );

              return (
                <YouTubeVideoCard
                  key={video.id}
                  video={video}
                  onSelect={onSelectVideo}
                  onOpenCountryProfile={handleOpenCountryProfile}
                  isPlayingInline={activePlayingVideoId === video.id}
                  onTogglePlayInline={() => handleTogglePlay(video.id)}
                  isLiked={likedVideoIds.includes(video.id)}
                  onToggleLike={onToggleLike}
                  isSaved={savedVideoIds.includes(video.id)}
                  onToggleSave={onToggleSave}
                  canDelete={canDeleteThisVideo}
                  onDelete={(_vid, e) => handleDeleteVideo(video.id, video.title, e)}
                  onShowToast={onShowToast}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* In-UI Delete Confirmation Modal (no window.confirm) */}
      <DeleteConfirmModal
        isOpen={!!videoPendingDelete}
        videoTitle={videoPendingDelete?.title || ''}
        isDeleting={isDeletingVideo}
        onConfirm={handleConfirmDelete}
        onCancel={() => setVideoPendingDelete(null)}
      />

    </div>
  );
};
