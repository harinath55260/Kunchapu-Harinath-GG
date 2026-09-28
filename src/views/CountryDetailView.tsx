import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Sparkles,
  MapPin,
  Utensils,
  PartyPopper,
  Flame,
  Music,
  Footprints,
  Shirt,
  Landmark,
  PlusCircle,
  Play
} from 'lucide-react';
import { CountryItem, VideoItem } from '../types';
import { YouTubeVideoCard } from '../components/YouTubeVideoCard';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { CULTURAL_COUNTRIES, CULTURAL_CATEGORIES } from '../data/seedData';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { deleteUserVideo } from '../firebase/firestore';

interface CountryDetailViewProps {
  countryId: string;
  onBack: () => void;
  videos: VideoItem[];
  savedVideoIds: string[];
  likedVideoIds?: string[];
  onSelectVideo: (video: VideoItem) => void;
  onToggleSave: (videoId: string, e: React.MouseEvent) => void;
  onToggleLike?: (videoId: string, e: React.MouseEvent) => void;
  onOpenShareModal: (preselectedCountry?: string) => void;
  onVideoDeleted?: (deletedId: string) => void;
  onShowToast?: (msg: string) => void;
}

export const CountryDetailView: React.FC<CountryDetailViewProps> = ({
  countryId,
  onBack,
  videos,
  savedVideoIds,
  likedVideoIds = [],
  onSelectVideo,
  onToggleSave,
  onToggleLike,
  onOpenShareModal,
  onVideoDeleted,
  onShowToast
}) => {
  const { user, isAdmin } = useAuth();
  const country = CULTURAL_COUNTRIES.find(c => c.id === countryId) || CULTURAL_COUNTRIES[0];
  const [activeTab, setActiveTab] = useState<'all' | string>('all');
  const [activePlayingVideoId, setActivePlayingVideoId] = useState<string | null>(null);

  // In-UI Delete Confirmation state
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

  // Filter videos for this country
  const countryVideos = videos.filter(v => v.countryId === country.id);

  // Filtered by selected category tab
  const displayedVideos = activeTab === 'all'
    ? countryVideos
    : countryVideos.filter(v => v.categoryId === activeTab);

  // Group highlights by category
  const categoriesList = [
    { id: 'all', name: 'All Cultural Content', icon: '🌍' },
    { id: 'traditions', name: 'Traditions', icon: '🏮' },
    { id: 'food', name: 'Food & Cuisine', icon: '🍲' },
    { id: 'festivals', name: 'Festivals', icon: '🎉' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'dance', name: 'Dance', icon: '💃' },
    { id: 'clothing', name: 'Clothing', icon: '👘' },
    { id: 'history', name: 'History', icon: '🏛' }
  ];

  return (
    <div className="space-y-12 pb-20">
      
      {/* Top Navigation & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Feed</span>
        </button>

        <button
          onClick={() => onOpenShareModal(country.id)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Share {country.name} Culture</span>
        </button>
      </div>

      {/* Hero Country Dossier Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full min-h-[260px] overflow-hidden bg-slate-950">
          <img
            src={country.bannerImage}
            alt={country.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Country Meta Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-4xl sm:text-5xl filter drop-shadow">{country.flag}</span>
                <div>
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight">
                    {country.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-amber-300 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{country.region} • ISO Code: {country.code}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs text-slate-300 flex items-center gap-4">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Curated Videos</span>
                <span className="text-base font-bold text-white">{countryVideos.length}</span>
              </div>
              <div className="h-6 w-px bg-slate-700" />
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Highlights</span>
                <span className="text-base font-bold text-amber-400">{country.culturalHighlights.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Description & Quick Dossier Facts */}
        <div className="p-6 sm:p-8 bg-slate-900/90 border-t border-slate-800 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Cultural Essence & Civilizational Philosophy
              </h3>
              {country.greeting && (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300">
                  {country.greeting}
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-4xl">
              {country.description}
            </p>
          </div>

          {/* Dossier Vital Quick Facts */}
          {(country.civilizationAge || country.unescoSitesCount || country.officialLanguages || country.capital) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
              {country.civilizationAge && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Civilization History</span>
                  <span className="text-xs sm:text-sm font-extrabold text-amber-300">{country.civilizationAge}</span>
                </div>
              )}
              {country.unescoSitesCount && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">UNESCO World Heritage</span>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-400">{country.unescoSitesCount} Protected Sites</span>
                </div>
              )}
              {country.capital && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">National Capital</span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-200">{country.capital}</span>
                </div>
              )}
              {country.currency && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Currency</span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-200">{country.currency}</span>
                </div>
              )}
            </div>
          )}

          {country.officialLanguages && (
            <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <span className="font-semibold text-slate-300">Languages & Scripts:</span>
              <span>{country.officialLanguages}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cultural Highlights Grid (Food, Festivals, Traditions, History) */}
      <section className="space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-serif flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Cultural Pillars of {country.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Iconic traditions, ceremonies, and gastronomic arts defining {country.name}'s identity
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {country.culturalHighlights.map((hl, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all space-y-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {hl.category}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">{hl.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{hl.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cultural Videos Section with Category Filters */}
      <section className="space-y-6 pt-4 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">
              {country.name} Cultural Videos
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Watch authentic celebrations, ceremonies, and cuisine hosted on YouTube
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        {displayedVideos.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3 p-6">
            <p className="text-sm font-semibold text-slate-300">
              No cultural videos submitted for this specific category yet.
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first cultural ambassador to contribute a YouTube video from {country.name}!
            </p>
            <button
              onClick={() => onOpenShareModal(country.id)}
              className="mt-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Contribute to {country.name}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedVideos.map((video) => {
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
                  onOpenCountryProfile={() => {}}
                  isPlayingInline={activePlayingVideoId === video.id}
                  onTogglePlayInline={() => setActivePlayingVideoId(prev => prev === video.id ? null : video.id)}
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
