import React from 'react';
import { Play, Heart, Bookmark, Eye, Trash2 } from 'lucide-react';
import { VideoItem } from '../types';
import { extractYouTubeId } from '../firebase/firestore';

interface VideoCardProps {
  video: VideoItem;
  onSelect: (video: VideoItem) => void;
  isSaved?: boolean;
  onToggleSave?: (videoId: string, e: React.MouseEvent) => void;
  showStatus?: boolean;
  canDelete?: boolean;
  onDelete?: (videoId: string, e: React.MouseEvent) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  isSaved = false,
  onToggleSave,
  showStatus = false,
  canDelete = false,
  onDelete
}) => {
  const effectiveVideoId = video.youtubeVideoId || extractYouTubeId(video.youtubeUrl) || '';
  const thumbnailSrc = video.thumbnail || (effectiveVideoId ? `https://img.youtube.com/vi/${effectiveVideoId}/hqdefault.jpg` : '');

  return (
    <div
      onClick={() => onSelect(video)}
      className="group bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer flex flex-col relative"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        <img
          src={thumbnailSrc}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback thumbnail if YouTube high-res is blocked or unavailable
            if (effectiveVideoId) {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${effectiveVideoId}/0.jpg`;
            }
          }}
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40 transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>

        {/* Category & Region Pills */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 rounded-md">
            {video.categoryName}
          </span>
          {video.region && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-medium bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-700/60 rounded-md">
              {video.region}
            </span>
          )}
        </div>

        {/* Action Buttons: Save & User Delete Option */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {canDelete && onDelete && (
            <button
              onClick={(e) => onDelete(video.id, e)}
              title="Delete your uploaded video"
              className="p-2 rounded-full bg-slate-950/80 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition-all shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleSave && (
            <button
              onClick={(e) => onToggleSave(video.id, e)}
              title={isSaved ? 'Remove from saved' : 'Save cultural video'}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                isSaved
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900/90'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Status Indicator (for user profile & admin) */}
        {showStatus && video.status && (
          <div className="absolute bottom-2.5 left-2.5">
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border backdrop-blur-md ${
                video.status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : video.status === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              {video.status === 'pending' ? '⏳ Pending Approval' : video.status === 'approved' ? '✓ Approved' : '✕ Rejected'}
            </span>
          </div>
        )}

        {/* Country Badge */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 text-[11px] font-semibold bg-slate-950/85 backdrop-blur-md text-slate-200 border border-slate-700/50 rounded-md flex items-center gap-1">
          <span>{video.countryName}</span>
        </div>
      </div>

      {/* Content Meta */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-100 text-sm leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
            {video.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        </div>

        {/* Footer info: contributor, likes, views */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate pr-2">
            {video.contributorPhoto ? (
              <img
                src={video.contributorPhoto}
                alt={video.contributorName}
                className="w-5 h-5 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] shrink-0">
                {video.contributorName?.charAt(0) || 'C'}
              </div>
            )}
            <span className="truncate text-slate-300">{video.contributorName}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1 hover:text-rose-400 transition-colors">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{video.likesCount || 0}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Eye className="w-3.5 h-3.5" />
              <span>{video.views || 0}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
