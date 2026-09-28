package com.goglobal.app.data.repository

import com.goglobal.app.data.model.CommentItem
import com.goglobal.app.data.model.CountryItem
import com.goglobal.app.data.model.VideoItem
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class CultureRepository {
    private val firestore = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    val currentUserId: String?
        get() = auth.currentUser?.uid

    // Flow of approved cultural videos
    fun getApprovedVideosFlow(): Flow<List<VideoItem>> = callbackFlow {
        val listener = firestore.collection("videos")
            .whereEqualTo("status", "approved")
            .limit(100)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    trySend(emptyList())
                    return@addSnapshotListener
                }
                val videos = snapshot?.toObjects(VideoItem::class.java) ?: emptyList()
                trySend(videos)
            }
        awaitClose { listener.remove() }
    }

    // Flow of user's own contributions
    fun getUserContributionsFlow(userId: String): Flow<List<VideoItem>> = callbackFlow {
        val listener = firestore.collection("videos")
            .whereEqualTo("contributorId", userId)
            .limit(100)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    trySend(emptyList())
                    return@addSnapshotListener
                }
                val videos = snapshot?.toObjects(VideoItem::class.java) ?: emptyList()
                trySend(videos)
            }
        awaitClose { listener.remove() }
    }

    // Get current user video count
    suspend fun getUserVideoCount(userId: String): Int {
        val snap = firestore.collection("videos")
            .whereEqualTo("contributorId", userId)
            .get()
            .await()
        return snap.size()
    }

    // Submit cultural video with 100 URL limit enforcement
    suspend fun submitCulturalVideo(video: VideoItem) {
        val count = getUserVideoCount(video.contributorId)
        if (count >= 100) {
            throw IllegalStateException("You have reached your 100 video URL limit.")
        }

        val docRef = firestore.collection("videos").document()
        val toSave = video.copy(
            id = docRef.id,
            status = "pending",
            createdAt = java.time.Instant.now().toString()
        )
        docRef.set(toSave).await()
    }

    // User Video Delete Option (removes video and records completely)
    suspend fun deleteUserVideo(videoId: String, userId: String, isAdmin: Boolean = false) {
        val docRef = firestore.collection("videos").document(videoId)
        val snap = docRef.get().await()
        if (!snap.exists()) return

        val contributorId = snap.getString("contributorId")
        if (contributorId != userId && !isAdmin) {
            throw SecurityException("You can only delete videos you personally uploaded.")
        }

        // Delete video document
        docRef.delete().await()

        // Cleanup associated comments
        val commentsSnap = firestore.collection("comments")
            .whereEqualTo("videoId", videoId)
            .get()
            .await()
        for (c in commentsSnap.documents) {
            c.reference.delete()
        }
    }

    // Pending review queue for Administrators
    suspend fun getPendingVideos(): List<VideoItem> {
        val snap = firestore.collection("videos")
            .whereEqualTo("status", "pending")
            .limit(50)
            .get()
            .await()
        return snap.toObjects(VideoItem::class.java)
    }

    // Admin approve video
    suspend fun approveVideo(videoId: String) {
        firestore.collection("videos").document(videoId)
            .update("status", "approved")
            .await()
    }

    // Admin reject video
    suspend fun rejectVideo(videoId: String, reason: String) {
        firestore.collection("videos").document(videoId)
            .update(
                mapOf(
                    "status" to "rejected",
                    "rejectionReason" to reason
                )
            )
            .await()
    }

    // Fetch countries
    suspend fun getCountries(): List<CountryItem> {
        val snap = firestore.collection("countries").get().await()
        return snap.toObjects(CountryItem::class.java)
    }

    // Comments flow
    fun getCommentsFlow(videoId: String): Flow<List<CommentItem>> = callbackFlow {
        val listener = firestore.collection("comments")
            .whereEqualTo("videoId", videoId)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .limit(50)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    trySend(emptyList())
                    return@addSnapshotListener
                }
                val comments = snapshot?.toObjects(CommentItem::class.java) ?: emptyList()
                trySend(comments)
            }
        awaitClose { listener.remove() }
    }

    // Add comment
    suspend fun addComment(videoId: String, text: String, userName: String, photoUrl: String?) {
        val uid = currentUserId ?: return
        val docRef = firestore.collection("comments").document()
        val comment = CommentItem(
            id = docRef.id,
            videoId = videoId,
            userId = uid,
            userName = userName,
            userPhoto = photoUrl,
            text = text,
            createdAt = java.time.Instant.now().toString()
        )
        docRef.set(comment).await()
    }
}
