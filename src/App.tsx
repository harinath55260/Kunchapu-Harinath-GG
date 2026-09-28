import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VideoItem } from './types';
import {
  subscribeToApprovedVideos,
  getUserLikes,
  getUserSaves,
  getFollowedContributors,
  toggleLike
} from './firebase/firestore';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VideoModal } from './components/VideoModal';
import { ShareCultureModal } from './components/ShareCultureModal';
import { AuthModal } from './components/AuthModal';
import { ReportModal } from './components/ReportModal';
import { AndroidDownloadModal } from './components/AndroidDownloadModal';
import { InstallNotificationBanner } from './components/InstallNotificationBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileBottomNav } from './components/MobileBottomNav';

import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { CountriesView } from './views/CountriesView';
import { CountryDetailView } from './views/CountryDetailView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

function GoGlobalMain() {
  const { user, isAdmin } = useAuth();

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('japan');
  const [exploreCategory, setExploreCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Real-time videos and engagement data
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>([]);
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>([]);
  const [followedContributorIds, setFollowedContributorIds] = useState<string[]>([]);

  // Modals
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [preselectedShareCountry, setPreselectedShareCountry] = useState<string | undefined>(undefined);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [reportTargetVideo, setReportTargetVideo] = useState<VideoItem | null>(null);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Subscribe to public approved cultural videos
  useEffect(() => {
    const unsubscribe = subscribeToApprovedVideos((items) => {
      setVideos(items);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user specific likes & saves
  useEffect(() => {
    if (user) {
      getUserLikes(user.id).then(setLikedVideoIds);
      getUserSaves(user.id).then(setSavedVideoIds);
      getFollowedContributors(user.id).then(setFollowedContributorIds);
    } else {
      setLikedVideoIds([]);
      setSavedVideoIds([]);
      setFollowedContributorIds([]);
    }
  }, [user]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#watch-')) {
        const ytid = hash.replace('#watch-', '');
        const target = videos.find(v => v.youtubeVideoId === ytid);
        if (target) setSelectedVideo(target);
      } else if (hash.startsWith('#country-')) {
        const cid = hash.replace('#country-', '');
        setSelectedCountryId(cid);
        setCurrentView('country-detail');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [videos]);

  const handleNavigate = (view: string, param?: string) => {
    if (view === 'country-detail' && param) {
      setSelectedCountryId(param);
      setCurrentView('country-detail');
      window.location.hash = `#country-${param}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Direct explore, countries, admin to home (buttons removed per user requirement)
    if (view === 'explore' || view === 'countries' || view === 'admin') {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLike = async (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const isLiked = likedVideoIds.includes(videoId);
    // Optimistic UI update
    setLikedVideoIds(prev => isLiked ? prev.filter(id => id !== videoId) : [...prev, videoId]);
    setVideos(prev => prev.map(v => {
      if (v.id === videoId) {
        return {
          ...v,
          likesCount: Math.max(0, (v.likesCount || 0) + (isLiked ? -1 : 1))
        };
      }
      return v;
    }));
    try {
      await toggleLike(videoId, user.id, isLiked);
      showToast(isLiked ? 'Appreciation removed.' : 'Appreciated cultural video!');
    } catch (_) {
      // Rollback on error
      setLikedVideoIds(prev => isLiked ? [...prev, videoId] : prev.filter(id => id !== videoId));
    }
  };

  const handleToggleSave = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const isSaved = savedVideoIds.includes(videoId);
    if (isSaved) {
      setSavedVideoIds(prev => prev.filter(id => id !== videoId));
      showToast('Removed from saved collection.');
    } else {
      setSavedVideoIds(prev => [...prev, videoId]);
      showToast('Saved to your cultural collection!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenShareModal={() => {
          setPreselectedShareCountry(undefined);
          setIsShareModalOpen(true);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-28 lg:pb-12">
        
        {currentView === 'home' && (
          <HomeView
            videos={videos}
            savedVideoIds={savedVideoIds}
            likedVideoIds={likedVideoIds}
            searchQuery={searchQuery}
            onSelectVideo={setSelectedVideo}
            onToggleSave={handleToggleSave}
            onToggleLike={handleToggleLike}
            onNavigate={handleNavigate}
            onOpenShareModal={(countryId) => {
              setPreselectedShareCountry(countryId);
              if (!user) setIsAuthModalOpen(true);
              else setIsShareModalOpen(true);
            }}
            onSearch={(term) => {
              setSearchQuery(term);
              setCurrentView('home');
            }}
            onShowToast={showToast}
            onVideoDeleted={(delId) => setVideos(prev => prev.filter(v => v.id !== delId))}
          />
        )}

        {currentView === 'explore' && (
          <ExploreView
            videos={videos}
            savedVideoIds={savedVideoIds}
            onSelectVideo={setSelectedVideo}
            onToggleSave={handleToggleSave}
            initialCategory={exploreCategory}
            initialSearch={searchQuery}
            onClearInitial={() => {
              setExploreCategory(undefined);
              setSearchQuery('');
            }}
            onOpenShareModal={() => {
              if (!user) setIsAuthModalOpen(true);
              else setIsShareModalOpen(true);
            }}
            onSelectCountry={(countryId) => {
              setSelectedCountryId(countryId);
              setCurrentView('country-detail');
            }}
          />
        )}

        {currentView === 'countries' && (
          <CountriesView
            videos={videos}
            onSelectCountry={(cid) => handleNavigate('country-detail', cid)}
          />
        )}

        {currentView === 'country-detail' && (
          <CountryDetailView
            countryId={selectedCountryId}
            onBack={() => handleNavigate('home')}
            videos={videos}
            savedVideoIds={savedVideoIds}
            likedVideoIds={likedVideoIds}
            onSelectVideo={setSelectedVideo}
            onToggleSave={handleToggleSave}
            onToggleLike={handleToggleLike}
            onOpenShareModal={() => {
              if (!user) setIsAuthModalOpen(true);
              else setIsShareModalOpen(true);
            }}
            onVideoDeleted={(delId) => setVideos(prev => prev.filter(v => v.id !== delId))}
            onShowToast={showToast}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            videos={videos}
            savedVideoIds={savedVideoIds}
            likedVideoIds={likedVideoIds}
            onSelectVideo={setSelectedVideo}
            onToggleSave={handleToggleSave}
            onOpenShareModal={() => {
              if (!user) setIsAuthModalOpen(true);
              else setIsShareModalOpen(true);
            }}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onShowToast={showToast}
            onVideoDeleted={(id) => setVideos(prev => prev.filter(v => v.id !== id))}
          />
        )}

        {currentView === 'saved' && (
          <ProfileView
            videos={videos}
            savedVideoIds={savedVideoIds}
            likedVideoIds={likedVideoIds}
            onSelectVideo={setSelectedVideo}
            onToggleSave={handleToggleSave}
            onOpenShareModal={() => {
              if (!user) setIsAuthModalOpen(true);
              else setIsShareModalOpen(true);
            }}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onShowToast={showToast}
            onVideoDeleted={(id) => setVideos(prev => prev.filter(v => v.id !== id))}
          />
        )}

        {currentView === 'admin' && (
          isAdmin ? (
            <AdminView
              allVideos={videos}
              onRefreshVideos={() => {}}
              onPreviewVideo={setSelectedVideo}
              onShowToast={showToast}
            />
          ) : (
            <div className="text-center py-24 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-4 max-w-lg mx-auto">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
              <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
              <p className="text-xs text-slate-400">
                You do not have permissions to access the GoGlobal curation console. Please sign in with an administrator account.
              </p>
              <button
                onClick={() => setCurrentView('home')}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold"
              >
                Return to Home
              </button>
            </div>
          )
        )}

      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
      />

      {/* Video Watch & Comment Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => {
            setSelectedVideo(null);
            window.location.hash = '';
          }}
          onOpenReport={(v) => setReportTargetVideo(v)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          allVideos={videos}
          onSelectVideo={setSelectedVideo}
          isLiked={likedVideoIds.includes(selectedVideo.id)}
          isSaved={savedVideoIds.includes(selectedVideo.id)}
          isFollowing={followedContributorIds.includes(selectedVideo.contributorId)}
          onLikeChanged={(vid, liked) => {
            setLikedVideoIds(prev => liked ? [...prev, vid] : prev.filter(id => id !== vid));
          }}
          onSaveChanged={(vid, saved) => {
            setSavedVideoIds(prev => saved ? [...prev, vid] : prev.filter(id => id !== vid));
          }}
          onFollowChanged={(cid, following) => {
            setFollowedContributorIds(prev => following ? [...prev, cid] : prev.filter(id => id !== cid));
          }}
          onShowToast={showToast}
          onDeleteSuccess={(deletedId) => {
            setVideos(prev => prev.filter(v => v.id !== deletedId));
          }}
        />
      )}

      {/* Native Android App Download / Release Modal */}
      {isAndroidModalOpen && (
        <AndroidDownloadModal
          onClose={() => setIsAndroidModalOpen(false)}
          onShowToast={showToast}
        />
      )}

      {/* Share Your Culture Modal */}
      {isShareModalOpen && (
        <ShareCultureModal
          preselectedCountry={preselectedShareCountry}
          onClose={() => {
            setIsShareModalOpen(false);
            setPreselectedShareCountry(undefined);
          }}
          onSuccess={(createdVideo) => {
            // User-uploaded videos automatically appear on the Home feed after successful submission
            setVideos((prev) => [createdVideo, ...prev.filter(v => v.id !== createdVideo.id)]);
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast(`"${createdVideo.title}" uploaded! Now featured on GoGlobal Home feed.`);
          }}
        />
      )}

      {/* Authentication Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            showToast('Signed in successfully!');
          }}
        />
      )}

      {/* Content Report Modal */}
      {reportTargetVideo && (
        <ReportModal
          video={reportTargetVideo}
          onClose={() => setReportTargetVideo(null)}
          onSuccess={() => {
            showToast('Thank you. Your report has been submitted to the moderation desk.');
          }}
        />
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-amber-500/40 text-slate-100 text-xs shadow-2xl shadow-amber-500/10 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* In-App Web App Install Notification & Home Screen Prompt */}
      <InstallNotificationBanner
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar (Home, Share, More) */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenShareModal={() => {
          setPreselectedShareCountry(undefined);
          if (!user) setIsAuthModalOpen(true);
          else setIsShareModalOpen(true);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GoGlobalMain />
    </AuthProvider>
  );
}
