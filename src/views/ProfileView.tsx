import React, { useState, useEffect } from 'react';
import {
  User,
  Edit3,
  Bookmark,
  Heart,
  Video,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  X,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VideoItem } from '../types';
import { VideoCard } from '../components/VideoCard';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { getUserContributions, deleteUserVideo } from '../firebase/firestore';

interface ProfileViewProps {
  videos: VideoItem[];
  savedVideoIds: string[];
  likedVideoIds: string[];
  onSelectVideo: (video: VideoItem) => void;
  onToggleSave: (videoId: string, e: React.MouseEvent) => void;
  onOpenShareModal: () => void;
  onOpenAuthModal: () => void;
  onShowToast: (msg: string) => void;
  onVideoDeleted?: (videoId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  videos,
  savedVideoIds,
  likedVideoIds,
  onSelectVideo,
  onToggleSave,
  onOpenShareModal,
  onOpenAuthModal,
  onShowToast,
  onVideoDeleted
}) => {
  const { user, updateUserProfile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'contributions' | 'saved' | 'liked'>('contributions');
  const [userContributions, setUserContributions] = useState<VideoItem[]>([]);
  const [loadingContributions, setLoadingContributions] = useState(false);

  // Edit Profile Modal state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [country, setCountry] = useState(user?.country || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [videoPendingDelete, setVideoPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // User Video Delete Option
  const handleDeleteMyVideo = (videoId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoPendingDelete({ id: videoId, title });
  };

  const handleConfirmDelete = async () => {
    if (!user || !videoPendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteUserVideo(videoPendingDelete.id, user.id, isAdmin);
      setUserContributions(prev => prev.filter(v => v.id !== videoPendingDelete.id));
      if (onVideoDeleted) {
        onVideoDeleted(videoPendingDelete.id);
      }
      onShowToast(`Deleted "${videoPendingDelete.title}" and all related data.`);
      setVideoPendingDelete(null);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete video.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setBio(user.bio || '');
      setCountry(user.country || '');
      setPhotoUrl(user.photoUrl || '');

      setLoadingContributions(true);
      getUserContributions(user.id)
        .then((items) => {
          // Merge with any globally approved video authored by this user
          const globalAuthored = videos.filter(v => v.contributorId === user.id);
          const combinedMap = new Map<string, VideoItem>();
          items.forEach(v => combinedMap.set(v.id, v));
          globalAuthored.forEach(v => combinedMap.set(v.id, v));
          setUserContributions(Array.from(combinedMap.values()));
        })
        .catch(() => {
          // Fallback to globally approved items
          setUserContributions(videos.filter(v => v.contributorId === user.id));
        })
        .finally(() => setLoadingContributions(false));
    }
  }, [user, videos]);

  if (!user) {
    return (
      <div className="text-center py-24 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-slate-800 text-amber-400 mx-auto flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-serif">Sign in to view Profile</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Sign in or create an account to view your cultural contributions, saved traditions, liked videos, and community followings.
        </p>
        <button
          onClick={onOpenAuthModal}
          className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  // Saved videos
  const savedVideos = videos.filter(v => savedVideoIds.includes(v.id));
  // Liked videos
  const likedVideos = videos.filter(v => likedVideoIds.includes(v.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUserProfile({
        displayName: name.trim(),
        bio: bio.trim(),
        country: country.trim(),
        photoUrl: photoUrl.trim() || undefined
      });
      setIsEditing(false);
      onShowToast('Cultural profile updated successfully!');
    } catch (err: any) {
      onShowToast(err.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* Profile Header Card */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-amber-500/50 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-800 border-2 border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-4xl shadow-xl">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                  {user.displayName}
                </h1>
                {user.role === 'admin' && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md">
                    Admin Curator
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{user.country || 'Global Citizen'}</span>
              </p>

              <p className="text-xs text-slate-300 max-w-xl leading-relaxed pt-1">
                {user.bio || 'Sharing and discovering authentic traditions worldwide on GoGlobal.'}
              </p>
            </div>
          </div>

          {/* Edit Profile Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Contribute</span>
            </button>
          </div>

        </div>

        {/* Statistics Bar (Item #18: Videos, Followers, Following, Likes) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800 text-center">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Uploaded URLs</span>
            <span className="text-xl sm:text-2xl font-bold text-white mt-1 block">
              {userContributions.length} <span className="text-xs text-slate-400 font-normal">/ 100 max</span>
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Saved</span>
            <span className="text-xl sm:text-2xl font-bold text-amber-400 mt-1 block">{savedVideoIds.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Likes Given</span>
            <span className="text-xl sm:text-2xl font-bold text-rose-400 mt-1 block">{likedVideoIds.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">Followers</span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 block">12</span>
          </div>
        </div>

        {/* 100 Video URL Limit Alert Banner */}
        {userContributions.length >= 100 && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-500/50 flex items-start gap-3 text-xs text-rose-200 leading-relaxed animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-bold text-white block">You have reached your 100 video URL limit.</strong>
              <p className="mt-1 text-slate-300">
                Each user can upload/add a maximum of 100 video URLs. To contribute additional videos, please delete some of your existing videos below.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Tabs: My Contributions, Saved Videos, Liked Videos (Item #18) */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('contributions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'contributions'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>My Cultural Contributions ({userContributions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'saved'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Cultural Videos ({savedVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('liked')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'liked'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Liked Traditions ({likedVideos.length})</span>
          </button>
        </div>

        {/* Tab Content: Contributions */}
        {activeTab === 'contributions' && (
          <div>
            {userContributions.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3 p-6">
                <Video className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-200">No cultural contributions yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Have an authentic cultural video, dance, ritual, or festival to share? Submit a YouTube link to contribute!
                </p>
                <button
                  onClick={onOpenShareModal}
                  className="mt-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Share Your Culture</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userContributions.map((video) => (
                  <div key={video.id} className="flex flex-col space-y-2">
                    <VideoCard
                      video={video}
                      onSelect={onSelectVideo}
                      isSaved={savedVideoIds.includes(video.id)}
                      onToggleSave={onToggleSave}
                      showStatus={true}
                      canDelete={true}
                      onDelete={(vid, e) => handleDeleteMyVideo(vid, video.title, e)}
                    />
                    <button
                      onClick={(e) => handleDeleteMyVideo(video.id, video.title, e)}
                      className="w-full py-1.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Uploaded Video</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Saved */}
        {activeTab === 'saved' && (
          <div>
            {savedVideos.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3 p-6">
                <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-200">No saved cultural videos</h3>
                <p className="text-xs text-slate-500">
                  Tap the bookmark icon on any cultural video to save it here for later viewing.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onSelect={onSelectVideo}
                    isSaved={true}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Liked */}
        {activeTab === 'liked' && (
          <div>
            {likedVideos.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3 p-6">
                <Heart className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-200">No liked cultural videos</h3>
                <p className="text-xs text-slate-500">
                  Tap the heart icon when watching cultural videos to express your appreciation.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {likedVideos.map((video) => (
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
        )}

      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Edit Cultural Profile
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Home Country / Heritage</label>
                <input
                  type="text"
                  placeholder="e.g. Japan, India, Brazil..."
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  maxLength={80}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Cultural Bio</label>
                <textarea
                  rows={3}
                  placeholder="Tell the community what traditions and cultures inspire you..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={400}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Profile Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (In-UI, no window.confirm) */}
      <DeleteConfirmModal
        isOpen={!!videoPendingDelete}
        videoTitle={videoPendingDelete?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setVideoPendingDelete(null)}
      />

    </div>
  );
};
