import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Filter,
  Check,
  Globe
} from 'lucide-react';
import { VideoItem, ReportItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import {
  getPendingVideos,
  approveVideo,
  rejectVideo,
  deleteVideo,
  getReports,
  seedInitialCulturalData,
  deleteAllVideosFromFirestore
} from '../firebase/firestore';

interface AdminViewProps {
  allVideos: VideoItem[];
  onRefreshVideos: () => void;
  onPreviewVideo: (video: VideoItem) => void;
  onShowToast: (msg: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  allVideos,
  onRefreshVideos,
  onPreviewVideo,
  onShowToast
}) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'reports'>('pending');
  const [pendingVideos, setPendingVideos] = useState<VideoItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Reject reason dialog state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Does not meet GoGlobal cultural context criteria.');

  // In-UI Delete confirmation state
  const [videoPendingDelete, setVideoPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);

  const fetchPending = async () => {
    setLoadingPending(true);
    try {
      const items = await getPendingVideos();
      setPendingVideos(items);
    } catch (err: any) {
      console.warn('Could not fetch pending videos:', err);
    } finally {
      setLoadingPending(false);
    }
  };

  const fetchReportsQueue = async () => {
    setLoadingReports(true);
    try {
      const items = await getReports();
      setReports(items);
    } catch (err) {
      console.warn('Could not fetch reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (video: VideoItem) => {
    setActionInProgress(video.id);
    try {
      await approveVideo(video.id);
      setPendingVideos(prev => prev.filter(v => v.id !== video.id));
      onRefreshVideos();
      onShowToast(`Approved "${video.title}"! It is now live in the GoGlobal public feed.`);
    } catch (err: any) {
      onShowToast(err.message || 'Approval failed.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (videoId: string) => {
    setActionInProgress(videoId);
    try {
      await rejectVideo(videoId, rejectReason);
      setPendingVideos(prev => prev.filter(v => v.id !== videoId));
      setRejectingId(null);
      onShowToast('Submission rejected and archived with reason.');
    } catch (err: any) {
      onShowToast(err.message || 'Rejection failed.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeletePublished = (videoId: string, title: string) => {
    setVideoPendingDelete({ id: videoId, title });
  };

  const handleConfirmDelete = async () => {
    if (!videoPendingDelete) return;
    setIsDeletingVideo(true);
    try {
      await deleteVideo(videoPendingDelete.id);
      onRefreshVideos();
      onShowToast(`Deleted "${videoPendingDelete.title}".`);
      setVideoPendingDelete(null);
    } catch (err: any) {
      onShowToast(err.message || 'Deletion failed.');
    } finally {
      setIsDeletingVideo(false);
    }
  };

  const handleDeleteAllVideos = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete ALL videos across the platform? This will wipe all published and pending videos for a completely fresh start.')) {
      return;
    }
    try {
      const count = await deleteAllVideosFromFirestore();
      onRefreshVideos();
      fetchPending();
      onShowToast(`Deleted all videos (${count} removed). The platform is now completely fresh!`);
    } catch (err: any) {
      onShowToast('Delete all error: ' + err.message);
    }
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm('Populate Firestore with initial curated sovereign country records?')) {
      return;
    }
    try {
      const count = await seedInitialCulturalData();
      onRefreshVideos();
      fetchPending();
      onShowToast(`Successfully seeded cultural knowledge base!`);
    } catch (err: any) {
      onShowToast('Seed error: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-semibold uppercase tracking-wider border border-rose-500/30">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>GoGlobal Cultural Moderation Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
            Admin Moderation Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Review community submissions, enforce cultural guidelines, and verify authentic traditions
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              fetchPending();
              onRefreshVideos();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1.5 transition-colors"
            title="Refresh queue"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleDeleteAllVideos}
            className="px-3.5 py-2 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Wipe all videos from the database for a 100% fresh start"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Delete All Videos (Fresh Start)</span>
          </button>

          <button
            onClick={handleSeedDatabase}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Seed Country Data</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-md">
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block">{pendingVideos.length}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Requires curator check</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-md">
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">Published Videos</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block">{allVideos.length}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Live in global feed</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 shadow-md">
          <span className="text-xs text-rose-400 font-bold uppercase tracking-wider block">Community Reports</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block">{reports.length}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Flags to inspect</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-md">
          <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider block">Countries Covered</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block">10</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Global cultural atlas</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Submissions ({pendingVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('published')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'published'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Published Global Feed ({allVideos.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('reports');
            fetchReportsQueue();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Reported Items ({reports.length})</span>
        </button>
      </div>

      {/* Tab 1: Pending Queue */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {loadingPending ? (
            <div className="py-16 text-center text-xs text-slate-500">
              Loading pending moderation submissions...
            </div>
          ) : pendingVideos.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 p-6 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-200">Moderation Queue Clear!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All submitted cultural videos have been reviewed and approved. When users submit new YouTube videos via "Share Your Culture", they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingVideos.map((video) => (
                <div
                  key={video.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col md:flex-row gap-5 items-start justify-between shadow-lg"
                >
                  {/* Thumbnail & Preview */}
                  <div className="relative aspect-video w-full md:w-56 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                    <img
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => onPreviewVideo(video)}
                      className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center transition-colors text-white"
                    >
                      <Play className="w-8 h-8 fill-current" />
                    </button>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded">
                      PENDING REVIEW
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-amber-400">{video.countryName}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">{video.categoryName}</span>
                      {video.region && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">{video.region}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-slate-500">{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-bold text-base text-white">{video.title}</h3>
                    {video.topic && (
                      <p className="text-xs text-amber-300">Topic: {video.topic}</p>
                    )}
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {video.description}
                    </p>

                    <div className="pt-1 flex items-center gap-4 text-xs text-slate-400">
                      <span>Contributor: <strong className="text-slate-200">{video.contributorName}</strong></span>
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:underline flex items-center gap-1"
                      >
                        YouTube Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons: Approve / Reject */}
                  <div className="flex md:flex-col items-center gap-2 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <button
                      onClick={() => handleApprove(video)}
                      disabled={actionInProgress === video.id}
                      className="flex-1 md:w-36 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Video</span>
                    </button>

                    <button
                      onClick={() => setRejectingId(video.id)}
                      disabled={actionInProgress === video.id}
                      className="flex-1 md:w-36 py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Published Videos Management */}
      {activeTab === 'published' && (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Video</th>
                  <th className="py-3 px-4">Country & Category</th>
                  <th className="py-3 px-4">Contributor</th>
                  <th className="py-3 px-4">Engagement</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-16 h-10 object-cover rounded-lg shrink-0"
                      />
                      <span className="font-semibold text-slate-200 line-clamp-1 max-w-xs">{video.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-300">{video.countryName}</span>
                      <span className="block text-[11px] text-slate-500">{video.categoryName}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{video.contributorName}</td>
                    <td className="py-3 px-4 text-slate-400">
                      ❤️ {video.likesCount || 0} • 👁️ {video.views || 0}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onPreviewVideo(video)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePublished(video.id, video.title)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                        title="Delete video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Reports Queue */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {loadingReports ? (
            <div className="py-16 text-center text-xs text-slate-500">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 p-6 space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-200">No Content Reports</h3>
              <p className="text-xs text-slate-500">
                Community members have not flagged any videos for inaccuracies or violations.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {report.reason}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Target: {report.videoTitle}</h4>
                    {report.details && (
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        "{report.details}"
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">Reported by: {report.reporterName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reject Reason Dialog */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              Reason for Cultural Rejection
            </h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-UI Delete Confirmation Modal */}
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
