import React, { useState } from 'react';
import {
  X,
  Youtube,
  Upload,
  Info,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { VideoItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import { extractYouTubeId, submitCulturalVideo, getUserVideoCount } from '../firebase/firestore';
import { CULTURAL_COUNTRIES, CULTURAL_CATEGORIES } from '../data/seedData';

interface ShareCultureModalProps {
  onClose: () => void;
  onSuccess: (video: VideoItem) => void;
  preselectedCountry?: string;
}

export const ShareCultureModal: React.FC<ShareCultureModalProps> = ({
  onClose,
  onSuccess,
  preselectedCountry
}) => {
  const { user, firebaseUser } = useAuth();
  const effectiveUser = user || (firebaseUser ? {
    id: firebaseUser.uid,
    displayName: firebaseUser.displayName || 'Culture Explorer',
    email: firebaseUser.email || '',
    photoUrl: firebaseUser.photoURL || undefined
  } : null) || (auth.currentUser ? {
    id: auth.currentUser.uid,
    displayName: auth.currentUser.displayName || 'Culture Explorer',
    email: auth.currentUser.email || '',
    photoUrl: auth.currentUser.photoURL || undefined
  } : null);

  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [countryId, setCountryId] = useState(preselectedCountry || 'india');
  const [categoryId, setCategoryId] = useState('traditions');
  const [region, setRegion] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userVideoCount, setUserVideoCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState<boolean>(true);

  React.useEffect(() => {
    const uid = effectiveUser?.id || auth.currentUser?.uid;
    if (uid) {
      getUserVideoCount(uid)
        .then(count => setUserVideoCount(count))
        .catch(() => {})
        .finally(() => setLoadingCount(false));
    } else {
      setLoadingCount(false);
    }
  }, [effectiveUser]);

  const isLimitReached = userVideoCount >= 100;

  const videoId = extractYouTubeId(youtubeUrl);
  const selectedCountry = CULTURAL_COUNTRIES.find(c => c.id === countryId) || CULTURAL_COUNTRIES[0];
  const selectedCategory = CULTURAL_CATEGORIES.find(c => c.id === categoryId) || CULTURAL_CATEGORIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeUid = effectiveUser?.id || auth.currentUser?.uid;
    if (!activeUid) {
      setError('You must be signed in to contribute cultural content.');
      return;
    }
    if (isLimitReached) {
      setError('You have reached your 100 video URL limit.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a cultural video title.');
      return;
    }
    if (!videoId) {
      setError('Please provide a valid YouTube URL (e.g., https://youtube.com/watch?v=... or https://youtu.be/...)');
      return;
    }
    if (!description.trim() || description.length < 20) {
      setError('Please provide a thorough cultural description (at least 20 characters) explaining the heritage.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(t => t.length > 0);

    // Default tag with country and category
    if (!tags.includes(selectedCountry.name.toLowerCase())) {
      tags.push(selectedCountry.name.toLowerCase());
    }

    try {
      const createdVideo = await submitCulturalVideo({
        title: title.trim(),
        description: description.trim(),
        youtubeUrl: youtubeUrl.trim(),
        youtubeVideoId: videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        countryId: selectedCountry.id,
        countryName: selectedCountry.name,
        countryFlag: selectedCountry.flag,
        countryImage: selectedCountry.bannerImage,
        region: region.trim() || selectedCountry.name,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        topic: topic.trim() || selectedCategory.name,
        tags,
        contributorId: activeUid,
        contributorName: effectiveUser?.displayName || auth.currentUser?.displayName || 'Culture Explorer',
        contributorPhoto: effectiveUser?.photoUrl || auth.currentUser?.photoURL || ''
      });

      onSuccess(createdVideo);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit cultural video. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Share Your Culture</h2>
              <p className="text-xs text-slate-400">Contribute authentic cultural heritage to GoGlobal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          
          {/* Instant Publication Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-200/90 leading-relaxed">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-300">Instant Home Feed Publishing: </span>
              Your submitted video will be linked directly to <strong>{selectedCountry.name} {selectedCountry.flag}</strong> and will automatically appear on the GoGlobal Home page in the YouTube-style video feed with its dedicated Country Profile!
            </div>
          </div>

          {/* 100 Video URL Limit Per User Enforcement Banner */}
          {isLimitReached ? (
            <div className="p-4 rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 flex items-start gap-3 text-xs text-rose-200 leading-relaxed">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold text-white block">You have reached your 100 video URL limit.</strong>
                <p className="mt-1 text-slate-300">
                  Each user can upload/add a maximum of 100 video URLs. To contribute new cultural videos, please delete some of your existing videos from your User Dashboard.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Your Video Uploads: <strong className="text-amber-400">{userVideoCount}</strong> / 100 allowed
              </span>
              <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(userVideoCount, 100)}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* YouTube URL Field with Live Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-rose-500" />
              <span>YouTube Video URL <span className="text-rose-400">*</span></span>
            </label>
            <input
              type="url"
              placeholder="e.g. https://www.youtube.com/watch?v=1p7zK5Xq4xM or https://youtu.be/..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-slate-500">
              Supports standard YouTube links, youtu.be shortlinks, and YouTube Shorts. Videos remain hosted on YouTube.
            </p>

            {/* Thumbnail Live Preview */}
            {videoId && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <img
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt="YouTube thumbnail preview"
                  className="w-24 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                  }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Valid YouTube Video Detected</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">ID: {videoId}</span>
                </div>
              </div>
            )}
          </div>

          {/* Video Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Cultural Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Traditional Japanese Tea Ceremony in Kyoto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Country & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Country <span className="text-rose-400">*</span>
              </label>
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {CULTURAL_COUNTRIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name} ({c.region})
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Cultural Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {CULTURAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Region & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Region / City / Village
              </label>
              <input
                type="text"
                placeholder="e.g. Kyoto, Oaxaca, Varanasi, Bahia"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                maxLength={100}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Topic / Specific Tradition
              </label>
              <input
                type="text"
                placeholder="e.g. Chado, Flamenco, Hand-rolled Pasta"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                maxLength={150}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Cultural Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Cultural Description & Context <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Describe the cultural significance, history, customs, or techniques shown in this video. What makes this tradition meaningful?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={20}
              maxLength={2000}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. tea, ceremony, kyoto, zen, matcha"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !videoId || !title || isLimitReached}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 disabled:opacity-40 disabled:hover:from-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Submit for Cultural Review</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
