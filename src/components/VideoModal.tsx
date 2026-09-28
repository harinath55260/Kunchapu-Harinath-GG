import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Bookmark,
  Share2,
  AlertTriangle,
  UserPlus,
  UserCheck,
  Send,
  Trash2,
  Compass,
  Tag,
  Clock,
  ExternalLink,
  MessageSquare,
  Youtube,
  RotateCcw,
  Play
} from 'lucide-react';
import { VideoItem, CommentItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  getComments,
  addComment,
  deleteComment,
  toggleLike,
  toggleSave,
  toggleFollow,
  deleteUserVideo,
  extractYouTubeId
} from '../firebase/firestore';

interface VideoModalProps {
  video: VideoItem;
  onClose: () => void;
  onOpenReport: (video: VideoItem) => void;
  onOpenAuth: () => void;
  allVideos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;
  onLikeChanged: (videoId: string, newLiked: boolean) => void;
  onSaveChanged: (videoId: string, newSaved: boolean) => void;
  onFollowChanged: (contributorId: string, newFollowing: boolean) => void;
  onShowToast: (msg: string) => void;
  onDeleteSuccess?: (videoId: string) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  video,
  onClose,
  onOpenReport,
  onOpenAuth,
  allVideos,
  onSelectVideo,
  isLiked,
  isSaved,
  isFollowing,
  onLikeChanged,
  onSaveChanged,
  onFollowChanged,
  onShowToast,
  onDeleteSuccess
}) => {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likesCount || 0);
  const [loadingComments, setLoadingComments] = useState(true);
  const [playerKey, setPlayerKey] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);

  // Compute reliable video ID from either metadata or full URL
  const effectiveVideoId = video.youtubeVideoId || extractYouTubeId(video.youtubeUrl) || '';
  const directYouTubeUrl = video.youtubeUrl?.startsWith('http')
    ? video.youtubeUrl
    : `https://www.youtube.com/watch?v=${effectiveVideoId}`;

  const currentUserId = user?.id || auth.currentUser?.uid;
  const currentUserEmail = user?.email || auth.currentUser?.email;
  const isAuthorOrAdmin = Boolean(
    currentUserId && (
      currentUserId === video.contributorId ||
      isAdmin ||
      (currentUserEmail && currentUserEmail.toLowerCase() === 'hariharinath55260@gmail.com') ||
      !video.contributorId
    )
  );

  const handleConfirmDelete = async () => {
    if (!currentUserId || !isAuthorOrAdmin) return;
    setIsDeletingVideo(true);
    try {
      await deleteUserVideo(video.id, currentUserId, isAdmin);
      onShowToast('Video and all associated records deleted completely.');
      if (onDeleteSuccess) {
        onDeleteSuccess(video.id);
      }
      setShowDeleteConfirm(false);
      onClose();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete video.');
    } finally {
      setIsDeletingVideo(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoadingComments(true);
    getComments(video.id).then((fetched) => {
      if (isMounted) {
        setComments(fetched);
        setLoadingComments(false);
      }
    });
    setLikesCount(video.likesCount || 0);

    // Escape key listener to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [video.id]);

  const handleLike = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const nextState = !isLiked;
    setLikesCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));
    onLikeChanged(video.id, nextState);
    try {
      await toggleLike(video.id, user.id, isLiked);
    } catch (err) {
      // Revert if error
      setLikesCount(video.likesCount || 0);
      onLikeChanged(video.id, isLiked);
    }
  };

  const handleSave = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const nextState = !isSaved;
    onSaveChanged(video.id, nextState);
    try {
      await toggleSave(video.id, user.id, isSaved);
      onShowToast(nextState ? 'Saved to your cultural collection!' : 'Removed from saved videos.');
    } catch (err) {
      onSaveChanged(video.id, isSaved);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (user.id === video.contributorId) {
      onShowToast('You cannot follow yourself.');
      return;
    }
    const nextState = !isFollowing;
    onFollowChanged(video.contributorId, nextState);
    try {
      await toggleFollow(user.id, video.contributorId, isFollowing);
      onShowToast(nextState ? `Following ${video.contributorName}` : `Unfollowed ${video.contributorName}`);
    } catch (err: any) {
      onFollowChanged(video.contributorId, isFollowing);
      onShowToast(err.message || 'Follow action failed');
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/#watch-${video.youtubeVideoId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      onShowToast('Cultural video link copied to clipboard!');
    } else {
      onShowToast(`Share this link: ${shareUrl}`);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const created = await addComment(
        video.id,
        user.id,
        user.displayName || 'Culture Explorer',
        commentText,
        user.photoUrl
      );
      setComments(prev => [created, ...prev]);
      setCommentText('');
      onShowToast('Comment posted!');
    } catch (err: any) {
      onShowToast('Could not post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId, video.id);
      setComments(prev => prev.filter(c => c.id !== commentId));
      onShowToast('Comment removed.');
    } catch (err) {
      onShowToast('Failed to delete comment.');
    }
  };

  // Related cultural videos from same country or category
  const relatedVideos = allVideos
    .filter(v => v.id !== video.id && (v.countryId === video.countryId || v.categoryId === video.categoryId))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <span>{video.countryName}</span>
            <span>•</span>
            <span className="text-slate-300">{video.categoryName}</span>
            {video.region && (
              <>
                <span>•</span>
                <span className="text-slate-400">{video.region}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={directYouTubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-500/30 transition-colors"
              title="Open video directly on YouTube"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </a>

            <button
              onClick={() => setPlayerKey(k => k + 1)}
              className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
              title="Reload Video Player"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          
          {/* YouTube Embedded Video Player with Fallback & Direct Play Support */}
          <div className="space-y-2">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800">
              {effectiveVideoId ? (
                <iframe
                  key={playerKey}
                  src={`https://www.youtube.com/embed/${effectiveVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950">
                  <Play className="w-12 h-12 text-amber-500 opacity-60" />
                  <p className="text-slate-300 font-medium">Unable to load embedded video stream</p>
                  <a
                    href={directYouTubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                    Watch on YouTube
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Quick Player Help / Alternative Link Bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-500 inline" />
                <span>Playing cultural video via official YouTube stream</span>
              </span>
              <a
                href={directYouTubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 inline-flex items-center gap-1 transition-colors"
              >
                <span>Direct YouTube link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Video Metadata & Actions Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-serif">
                {video.title}
              </h2>
              {video.topic && (
                <p className="text-xs font-medium text-amber-300">
                  Cultural Focus: {video.topic}
                </p>
              )}
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  isLiked
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
                <span>{likesCount} Likes</span>
              </button>

              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-amber-400' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              {isAuthorOrAdmin && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  title="Delete your uploaded video"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Video</span>
                </button>
              )}

              <button
                onClick={() => onOpenReport(video)}
                title="Report inappropriate or inaccurate cultural content"
                className="p-2 rounded-full text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contributor Card & Cultural Context */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Description, Tags, YouTube Link */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  About this Cultural Heritage
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {video.description}
                </p>

                {video.tags && video.tags.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap gap-1.5 items-center">
                    <Tag className="w-3.5 h-3.5 text-slate-500 mr-1" />
                    {video.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-900 text-slate-400 border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* YouTube Compliance Attribution */}
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <span>Original video hosted on YouTube</span>
                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium"
                >
                  Watch on YouTube <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right 1 Col: Contributor Card */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cultural Contributor
                </div>

                <div className="flex items-center gap-3">
                  {video.contributorPhoto ? (
                    <img
                      src={video.contributorPhoto}
                      alt={video.contributorName}
                      className="w-12 h-12 rounded-full object-cover border border-amber-500/40"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-base border border-slate-700">
                      {video.contributorName?.charAt(0) || 'C'}
                    </div>
                  )}
                  <div>
                    <h5 className="font-bold text-sm text-white">{video.contributorName}</h5>
                    <p className="text-xs text-slate-400">GoGlobal Cultural Storyteller</p>
                  </div>
                </div>

                {user?.id !== video.contributorId && (
                  <button
                    onClick={handleFollow}
                    className={`w-full py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      isFollowing
                        ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow Contributor</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Related Cultural Videos */}
              {relatedVideos.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Related Traditions
                  </h4>
                  <div className="space-y-2">
                    {relatedVideos.map((rv) => (
                      <div
                        key={rv.id}
                        onClick={() => onSelectVideo(rv)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer group"
                      >
                        <img
                          src={rv.thumbnail}
                          alt={rv.title}
                          className="w-16 h-10 object-cover rounded-lg shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-amber-300">
                            {rv.title}
                          </p>
                          <span className="text-[10px] text-slate-500">{rv.countryName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Community Discussion / Comments */}
          <div className="pt-6 border-t border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Community Cultural Insights ({comments.length})
              </h3>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={user ? "Share your experience or respect for this culture..." : "Sign in to join the cultural conversation..."}
                disabled={submittingComment}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              {loadingComments ? (
                <div className="py-6 text-center text-xs text-slate-500">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No comments yet. Be the first to share cultural thoughts!
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      {comment.userPhoto ? (
                        <img
                          src={comment.userPhoto}
                          alt={comment.userName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {comment.userName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-200">{comment.userName}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </div>

                    {(user?.id === comment.userId || isAdmin) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* In-UI Delete Confirmation Modal (no window.confirm) */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        videoTitle={video.title}
        isDeleting={isDeletingVideo}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
