import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { VideoItem, CommentItem, ReportItem, NotificationItem, CountryItem, CategoryItem } from '../types';
import { INITIAL_VIDEOS, CULTURAL_COUNTRIES, CULTURAL_CATEGORIES } from '../data/seedData';

// Extract YouTube Video ID from any standard, short, embed, shorts, live, or shared URLs
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  let raw = url.trim();

  // If already a clean 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
    return raw;
  }

  // Handle URL embedded in text (e.g. mobile share sheet "Check out: https://youtu.be/...")
  const urlMatch = raw.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    raw = urlMatch[0];
  } else if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = 'https://' + raw;
  }

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();

    // youtu.be/ID
    if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
      const id = parsed.pathname.replace(/^\/+/, '').split('/')[0].split('?')[0];
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    // youtube.com, m.youtube.com, music.youtube.com, www.youtube-nocookie.com
    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      // 1. Check v query parameter (?v=ID or &v=ID)
      const v = parsed.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }

      // 2. Check path: /shorts/ID, /embed/ID, /live/ID, /v/ID
      const parts = parsed.pathname.split('/').filter(Boolean);
      const actionIdx = parts.findIndex(p => ['shorts', 'embed', 'live', 'v'].includes(p.toLowerCase()));
      if (actionIdx !== -1 && parts[actionIdx + 1]) {
        const id = parts[actionIdx + 1].split('?')[0].split('&')[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }
    }
  } catch (_) {
    // Ignore URL parse error and fall back to regex
  }

  // Universal regex fallback
  const regex = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|live|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = raw.match(regex);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

// Fetch all approved public cultural videos (Starts fresh with 0 videos if empty)
export async function getApprovedVideos(): Promise<VideoItem[]> {
  try {
    const q = query(
      collection(db, 'videos'),
      where('status', '==', 'approved'),
      limit(100)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as VideoItem));
    }
  } catch (err) {
    console.warn('Could not query Firestore approved videos:', err);
  }
  return [];
}

// Subscribe to approved videos with real-time updates
export function subscribeToApprovedVideos(
  callback: (videos: VideoItem[]) => void
): () => void {
  try {
    const q = query(
      collection(db, 'videos'),
      where('status', '==', 'approved'),
      limit(100)
    );
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VideoItem));
        callback(items);
      } else {
        callback([]);
      }
    }, (error) => {
      console.warn('Real-time approved videos listener fallback:', error);
      callback([]);
    });
  } catch (err) {
    console.warn('Real-time listener initialization failed:', err);
    callback([]);
    return () => {};
  }
}

// Delete all videos from Firestore (Admin / Fresh Start wipe)
export async function deleteAllVideosFromFirestore(): Promise<number> {
  try {
    const q = query(collection(db, 'videos'));
    const snap = await getDocs(q);
    let count = 0;
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'videos', d.id));
      count++;
    }
    // Clean up auxiliary engagement records
    try {
      const likesSnap = await getDocs(collection(db, 'likes'));
      for (const d of likesSnap.docs) {
        await deleteDoc(doc(db, 'likes', d.id));
      }
      const savesSnap = await getDocs(collection(db, 'bookmarks'));
      for (const d of savesSnap.docs) {
        await deleteDoc(doc(db, 'bookmarks', d.id));
      }
      const commentsSnap = await getDocs(collection(db, 'comments'));
      for (const d of commentsSnap.docs) {
        await deleteDoc(doc(db, 'comments', d.id));
      }
    } catch (_) {}
    return count;
  } catch (err) {
    console.warn('Error clearing videos from firestore:', err);
    return 0;
  }
}

// Fetch pending videos for Admin moderation
export async function getPendingVideos(): Promise<VideoItem[]> {
  try {
    const q = query(
      collection(db, 'videos'),
      where('status', '==', 'pending'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as VideoItem));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'videos?status=pending');
  }
}

// Fetch user's own contributions
export async function getUserContributions(userId: string): Promise<VideoItem[]> {
  try {
    const q = query(
      collection(db, 'videos'),
      where('contributorId', '==', userId),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as VideoItem));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `videos?contributorId=${userId}`);
  }
}

// Get total count of videos contributed by a user
export async function getUserVideoCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'videos'),
      where('contributorId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.size;
  } catch (err) {
    console.warn('Could not fetch user video count:', err);
    return 0;
  }
}

// Submit a new cultural video (Defaults to status: 'approved' so it appears automatically on the Home feed)
// Enforces maximum limit of 100 video URLs per user
export async function submitCulturalVideo(data: Omit<VideoItem, 'id' | 'views' | 'likesCount' | 'savesCount' | 'commentsCount' | 'status' | 'createdAt'>): Promise<VideoItem> {
  // Ensure valid current auth context
  const currentUid = auth.currentUser?.uid || data.contributorId;
  if (!currentUid) {
    throw new Error('User authentication required to submit cultural videos.');
  }

  // Backend & Database Check: Enforce 100 Video URL Limit Per User
  const existingCount = await getUserVideoCount(currentUid);
  if (existingCount >= 100) {
    throw new Error('You have reached your 100 video URL limit.');
  }

  const id = `vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newVideo: VideoItem = {
    ...data,
    id,
    contributorId: currentUid,
    contributorName: data.contributorName || auth.currentUser?.displayName || 'Culture Explorer',
    contributorPhoto: data.contributorPhoto || auth.currentUser?.photoURL || '',
    region: data.region || data.countryName,
    topic: data.topic || data.categoryName,
    views: 0,
    likesCount: 0,
    savesCount: 0,
    commentsCount: 0,
    status: 'approved', // Immediately visible on Home feed!
    createdAt: new Date().toISOString()
  };

  // Strip any accidental undefined fields before sending to Firestore
  const sanitizedVideo = Object.fromEntries(
    Object.entries(newVideo).filter(([_, v]) => v !== undefined)
  ) as VideoItem;

  try {
    await setDoc(doc(db, 'videos', id), sanitizedVideo);
    // Update video count on user profile doc if it exists
    try {
      await updateDoc(doc(db, 'users', currentUid), {
        videoCount: increment(1),
        updatedAt: new Date().toISOString()
      });
    } catch (e) { /* ignore */ }
    return sanitizedVideo;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `videos/${id}`);
    throw err;
  }
}

// User Video Delete Option
// Users must be able to delete videos they personally uploaded.
// Platform administrators can also delete any cultural video.
// When a video is deleted, remove its related URL, metadata, thumbnail/reference, and database record completely.
export async function deleteUserVideo(videoId: string, userId: string, isAdminUser: boolean = false): Promise<void> {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoSnap = await getDoc(videoRef);

    if (!videoSnap.exists()) {
      return;
    }

    const videoData = videoSnap.data() as VideoItem;
    const currentUid = auth.currentUser?.uid || userId;
    const currentUserEmail = auth.currentUser?.email?.toLowerCase();
    const isPlatformAdmin = Boolean(isAdminUser || (currentUserEmail && currentUserEmail === 'hariharinath55260@gmail.com'));
    const isOwner = Boolean(!videoData.contributorId || videoData.contributorId === userId || videoData.contributorId === currentUid);

    // Ownership validation: author or platform admin
    if (!isOwner && !isPlatformAdmin) {
      throw new Error('Permission denied: You can only delete videos you personally uploaded.');
    }

    // 1. Delete main video document completely from Firestore
    await deleteDoc(videoRef);

    // 2. Decrement user's videoCount if contributor exists
    if (videoData.contributorId) {
      try {
        await updateDoc(doc(db, 'users', videoData.contributorId), {
          videoCount: increment(-1),
          updatedAt: new Date().toISOString()
        });
      } catch (e) { /* ignore */ }
    }

    // 3. Clean up associated engagement records (likes, saves, comments)
    try {
      const commentsQuery = query(collection(db, 'comments'), where('videoId', '==', videoId));
      const commentsSnap = await getDocs(commentsQuery);
      for (const d of commentsSnap.docs) {
        await deleteDoc(d.ref).catch(() => {});
      }
    } catch (cleanErr) {
      console.warn('Cascade cleanup error for video', videoId, cleanErr);
    }
  } catch (err: any) {
    console.error('Failed to delete video:', err);
    throw new Error(err.message || 'Failed to delete video from database.');
  }
}

// Admin: Approve a video submission
export async function approveVideo(videoId: string): Promise<void> {
  try {
    const ref = doc(db, 'videos', videoId);
    await updateDoc(ref, {
      status: 'approved',
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `videos/${videoId}`);
  }
}

// Admin: Reject a video submission with reason
export async function rejectVideo(videoId: string, reason: string): Promise<void> {
  try {
    const ref = doc(db, 'videos', videoId);
    await updateDoc(ref, {
      status: 'rejected',
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `videos/${videoId}`);
  }
}

// Admin / Legacy delete video alias
export async function deleteVideo(videoId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'videos', videoId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `videos/${videoId}`);
  }
}

// LIKES
export async function toggleLike(videoId: string, userId: string, isLiked: boolean): Promise<boolean> {
  const likeId = `${userId}_${videoId}`;
  const likeRef = doc(db, 'likes', likeId);
  const videoRef = doc(db, 'videos', videoId);

  try {
    if (isLiked) {
      // Remove like
      await deleteDoc(likeRef);
      try {
        await updateDoc(videoRef, {
          likesCount: increment(-1),
          updatedAt: new Date().toISOString()
        });
      } catch (e) { /* ignore counter if video doc is local/seed */ }
      return false;
    } else {
      // Add like
      await setDoc(likeRef, {
        userId,
        videoId,
        createdAt: new Date().toISOString()
      });
      try {
        await updateDoc(videoRef, {
          likesCount: increment(1),
          updatedAt: new Date().toISOString()
        });
      } catch (e) { /* ignore counter if video doc is local/seed */ }
      return true;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `likes/${likeId}`);
  }
}

export async function getUserLikes(userId: string): Promise<string[]> {
  try {
    const q = query(collection(db, 'likes'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().videoId as string);
  } catch (err) {
    console.warn('Could not fetch user likes:', err);
    return [];
  }
}

// SAVED VIDEOS (Bookmarks)
export async function toggleSave(videoId: string, userId: string, isSaved: boolean): Promise<boolean> {
  const saveId = `${userId}_${videoId}`;
  const saveRef = doc(db, 'savedVideos', saveId);
  const videoRef = doc(db, 'videos', videoId);

  try {
    if (isSaved) {
      await deleteDoc(saveRef);
      try {
        await updateDoc(videoRef, {
          savesCount: increment(-1),
          updatedAt: new Date().toISOString()
        });
      } catch (e) { /* ignore counter */ }
      return false;
    } else {
      await setDoc(saveRef, {
        userId,
        videoId,
        createdAt: new Date().toISOString()
      });
      try {
        await updateDoc(videoRef, {
          savesCount: increment(1),
          updatedAt: new Date().toISOString()
        });
      } catch (e) { /* ignore counter */ }
      return true;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `savedVideos/${saveId}`);
  }
}

export async function getUserSaves(userId: string): Promise<string[]> {
  try {
    const q = query(collection(db, 'savedVideos'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().videoId as string);
  } catch (err) {
    console.warn('Could not fetch user saves:', err);
    return [];
  }
}

// COMMENTS
export async function getComments(videoId: string): Promise<CommentItem[]> {
  try {
    const q = query(
      collection(db, 'comments'),
      where('videoId', '==', videoId),
      limit(50)
    );
    const snap = await getDocs(q);
    const comments = snap.docs.map(d => ({ id: d.id, ...d.data() } as CommentItem));
    return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Could not fetch comments:', err);
    return [];
  }
}

export async function addComment(videoId: string, userId: string, userName: string, text: string, userPhoto?: string): Promise<CommentItem> {
  const id = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newComment: CommentItem = {
    id,
    videoId,
    userId,
    userName,
    userPhoto,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'comments', id), newComment);
    try {
      await updateDoc(doc(db, 'videos', videoId), {
        commentsCount: increment(1),
        updatedAt: new Date().toISOString()
      });
    } catch (e) { /* ignore counter */ }
    return newComment;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `comments/${id}`);
  }
}

export async function deleteComment(commentId: string, videoId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'comments', commentId));
    try {
      await updateDoc(doc(db, 'videos', videoId), {
        commentsCount: increment(-1),
        updatedAt: new Date().toISOString()
      });
    } catch (e) { /* ignore counter */ }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `comments/${commentId}`);
  }
}

// FOLLOWS
export async function toggleFollow(currentUserId: string, targetUserId: string, isFollowing: boolean): Promise<boolean> {
  if (currentUserId === targetUserId) {
    throw new Error('You cannot follow yourself.');
  }
  const followId = `${currentUserId}_${targetUserId}`;
  const followRef = doc(db, 'follows', followId);

  try {
    if (isFollowing) {
      await deleteDoc(followRef);
      return false;
    } else {
      await setDoc(followRef, {
        followerId: currentUserId,
        followingId: targetUserId,
        createdAt: new Date().toISOString()
      });
      return true;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `follows/${followId}`);
  }
}

export async function getFollowedContributors(userId: string): Promise<string[]> {
  try {
    const q = query(collection(db, 'follows'), where('followerId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().followingId as string);
  } catch (err) {
    console.warn('Could not fetch following:', err);
    return [];
  }
}

// REPORTS
export async function submitReport(videoId: string, videoTitle: string, reportedBy: string, reporterName: string, reason: string, details?: string): Promise<void> {
  const id = `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const report: ReportItem = {
    id,
    videoId,
    videoTitle,
    reportedBy,
    reporterName,
    reason,
    details: details?.trim() || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'reports', id), report);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `reports/${id}`);
  }
}

export async function getReports(): Promise<ReportItem[]> {
  try {
    const snap = await getDocs(collection(db, 'reports'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReportItem));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'reports');
  }
}

// SEED INITIAL CULTURAL DATA (For Admin button or initial setup)
export async function seedInitialCulturalData(): Promise<number> {
  let count = 0;
  for (const v of INITIAL_VIDEOS) {
    try {
      const ref = doc(db, 'videos', v.id);
      await setDoc(ref, v, { merge: true });
      count++;
    } catch (err) {
      console.warn('Seed video write failed:', v.id, err);
    }
  }
  for (const c of CULTURAL_COUNTRIES) {
    try {
      const ref = doc(db, 'countries', c.id);
      await setDoc(ref, c, { merge: true });
    } catch (err) {
      console.warn('Seed country write failed:', c.id, err);
    }
  }
  for (const cat of CULTURAL_CATEGORIES) {
    try {
      const ref = doc(db, 'categories', cat.id);
      await setDoc(ref, cat, { merge: true });
    } catch (err) {
      console.warn('Seed category write failed:', cat.id, err);
    }
  }
  return count;
}
