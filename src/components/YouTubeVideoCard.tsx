import React, { useState } from 'react';
import {
  Play,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Trash2,
  Youtube,
  Check,
  Maximize2,
  X
} from 'lucide-react';
import { VideoItem } from '../types';
import { extractYouTubeId } from '../firebase/firestore';
import { CULTURAL_COUNTRIES } from '../data/seedData';

interface YouTubeVideoCardProps {
  video: VideoItem;
  onSelect: (video: VideoItem) => void;
  onOpenCountryProfile: (countryId: string) => void;
  isPlayingInline?: boolean;
  onTogglePlayInline?: () => void;
  isLiked?: boolean;
  onToggleLike?: (videoId: string, e: React.MouseEvent) => void;
  isSaved?: boolean;
  onToggleSave?: (videoId: string, e: React.MouseEvent) => void;
  canDelete?: boolean;
  onDelete?: (videoId: string, e: React.MouseEvent) => void;
  onShowToast?: (msg: string) => void;
}

export const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({
  video,
  onSelect,
  onOpenCountryProfile,
  isPlayingInline = false,
  onTogglePlayInline,
  isLiked = false,
  onToggleLike,
  isSaved = false,
  onToggleSave,
  canDelete = false,
  onDelete,
  onShowToast
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  // Match country from curated database or video fallback
  const resolvedCountry = CULTURAL_COUNTRIES.find(
    (c) => c.id.toLowerCase() === video.countryId?.toLowerCase()
  ) || {
    id: video.countryId || 'global',
    name: video.countryName || 'Global Culture',
    flag: video.countryFlag || '🌍',
    bannerImage: video.countryImage || 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
    description: video.description
  };

  const effectiveVideoId = video.youtubeVideoId || extractYouTubeId(video.youtubeUrl) || '';
  const thumbnailSrc = video.thumbnail || (effectiveVideoId ? `https://img.youtube.com/vi/${effectiveVideoId}/hqdefault.jpg` : '');

  // Format views
  const formatViews = (views: number = 0) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return `${views}`;
  };

  // Format upload time
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Just now';
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}#watch-${effectiveVideoId || video.id}`
      : video.youtubeUrl;

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Watch "${video.title}" from ${resolvedCountry.name} on GoGlobal!`,
          url: shareUrl
        });
        return;
      } catch (_) {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      if (onShowToast) onShowToast('Video link copied to clipboard!');
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleThumbnailClick = () => {
    if (onTogglePlayInline) {
      onTogglePlayInline();
    } else {
      onSelect(video);
    }
  };

  return (
    <div className="flex flex-col group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl p-3 sm:p-3.5 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-amber-500/5">
      
      {/* 1. Video Thumbnail / Inline Player (Only one video plays at a time on home) */}
      {isPlayingInline && effectiveVideoId ? (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl ring-1 ring-amber-500/40">
          <iframe
            src={`https://www.youtube.com/embed/${effectiveVideoId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10 bg-slate-950/85 backdrop-blur-md p-1 rounded-lg border border-slate-700 shadow-lg">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(video);
              }}
              title="Open full video modal with comments"
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onTogglePlayInline) onTogglePlayInline();
              }}
              title="Stop playing video"
              className="p-1 rounded text-slate-300 hover:text-rose-400 hover:bg-slate-800 text-xs cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleThumbnailClick}
          className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 cursor-pointer shadow-inner"
        >
          <img
            src={thumbnailSrc}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              if (effectiveVideoId) {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${effectiveVideoId}/0.jpg`;
              }
            }}
          />

          {/* Dark Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

          {/* Center Play Button (Always visible on mobile, elevated on hover) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-slate-950/75 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 border border-white/20 group-hover:border-transparent flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover:scale-115">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
          </div>

          {/* Cultural Category Pill (Top-Left) */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-500/30 rounded-md shadow-sm">
              {video.categoryName}
            </span>
            {video.region && (
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-700/60 rounded-md">
                {video.region}
              </span>
            )}
          </div>

          {/* Action Controls (Top-Right: User Delete & Save) */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
            {canDelete && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(video.id, e);
                }}
                title="Delete your uploaded video"
                className="p-1.5 rounded-full bg-slate-950/85 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 transition-all shadow-md cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {onToggleSave && (
              <button
                onClick={(e) => onToggleSave(video.id, e)}
                title={isSaved ? 'Remove from saved' : 'Save cultural video'}
                className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                  isSaved
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          {/* YouTube Brand & Quality Pill (Bottom-Right) */}
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-bold text-white tracking-wider flex items-center gap-1 shadow-sm">
            <Youtube className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>YouTube HD</span>
          </div>
        </div>
      )}

      {/* 2. YouTube-Style Meta Layout (Country Avatar + Video Title & Channel Info) */}
      <div className="flex items-start gap-3 pt-3 flex-1">
        
        {/* Country Profile Avatar (Opens dedicated country profile page on click) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenCountryProfile(resolvedCountry.id);
          }}
          title={`View ${resolvedCountry.name}'s Cultural Profile`}
          className="relative shrink-0 w-11 h-11 rounded-full ring-2 ring-amber-500/40 hover:ring-amber-400 transition-all transform hover:scale-105 overflow-hidden bg-slate-950 shadow-md cursor-pointer group/avatar mt-0.5"
        >
          <img
            src={resolvedCountry.bannerImage}
            alt={resolvedCountry.name}
            className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform"
          />
          {/* Country Flag Overlay */}
          <span className="absolute -bottom-1 -right-1 text-sm filter drop-shadow">
            {resolvedCountry.flag}
          </span>
        </button>

        {/* Video Information */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Video Title */}
          <h3
            onClick={() => onSelect(video)}
            title={video.title}
            className="font-bold text-sm sm:text-base text-slate-100 line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors cursor-pointer"
          >
            {video.title}
          </h3>

          {/* Dedicated Country Profile & Uploader Line */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-400">
            {/* Clickable Country Name & Flag */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCountryProfile(resolvedCountry.id);
              }}
              title={`View ${resolvedCountry.name} profile`}
              className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{resolvedCountry.name}</span>
              <span>{resolvedCountry.flag}</span>
            </button>

            <span className="text-slate-600">•</span>

            {/* Uploader Name */}
            <span className="text-slate-300 font-medium truncate max-w-[140px]" title={video.contributorName}>
              by {video.contributorName}
            </span>
          </div>

          {/* Views & Time Ago */}
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
            <span className="font-semibold text-slate-300">{formatViews(video.views || 0)} views</span>
            <span className="text-slate-600">•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>

          {/* YouTube Interactive Action Row: Play, Like, Comment, Share */}
          <div className="pt-2.5 flex items-center gap-2 text-xs flex-wrap">
            {/* Play/Stop Option */}
            {onTogglePlayInline && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlayInline();
                }}
                title={isPlayingInline ? "Stop playing" : "Play video in feed (only one plays at a time)"}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all cursor-pointer font-bold ${
                  isPlayingInline
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600 hover:text-white'
                }`}
              >
                {isPlayingInline ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play</span>
                  </>
                )}
              </button>
            )}

            {/* Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleLike) onToggleLike(video.id, e);
              }}
              title={isLiked ? 'Unlike' : 'Like'}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                isLiked
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold'
                  : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:text-rose-400 hover:border-slate-700'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
              <span>{video.likesCount || 0}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(video); // opens video watch modal with discussion
              }}
              title="Join Cultural Discussion"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 text-slate-300 border border-slate-800 hover:text-amber-300 hover:border-slate-700 transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{video.commentsCount || 0}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              title="Share Video"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 text-slate-300 border border-slate-800 hover:text-cyan-400 hover:border-slate-700 transition-all cursor-pointer"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* Author or Admin Delete Action */}
            {canDelete && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(video.id, e);
                }}
                title="Delete this uploaded video"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-500/30 transition-all cursor-pointer font-medium ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
