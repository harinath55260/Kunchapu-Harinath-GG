package com.goglobal.app.data.model

import com.google.firebase.firestore.DocumentId

/**
 * Shared Cultural Data Models for GoGlobal Native Android
 * Synced with shared Firestore database
 */

data class VideoItem(
    @DocumentId val id: String = "",
    val title: String = "",
    val description: String = "",
    val youtubeUrl: String = "",
    val youtubeVideoId: String = "",
    val thumbnail: String = "",
    val countryId: String = "",
    val countryName: String = "",
    val region: String = "",
    val categoryId: String = "",
    val categoryName: String = "",
    val topic: String = "",
    val tags: List<String> = emptyList(),
    val contributorId: String = "",
    val contributorName: String = "",
    val contributorPhoto: String? = null,
    val views: Long = 0,
    val likesCount: Long = 0,
    val savesCount: Long = 0,
    val commentsCount: Long = 0,
    val status: String = "approved", // 'approved' | 'pending' | 'rejected'
    val createdAt: String = ""
)

data class CountryItem(
    @DocumentId val id: String = "",
    val name: String = "",
    val code: String = "",
    val flag: String = "",
    val bannerImage: String = "",
    val description: String = "",
    val region: String = "",
    val culturalHighlights: List<CulturalHighlight> = emptyList()
)

data class CulturalHighlight(
    val title: String = "",
    val description: String = "",
    val category: String = ""
)

data class UserProfile(
    @DocumentId val id: String = "",
    val email: String = "",
    val displayName: String = "",
    val photoUrl: String? = null,
    val bio: String = "",
    val country: String = "",
    val role: String = "user", // 'user' | 'admin'
    val createdAt: String = ""
)

data class CommentItem(
    @DocumentId val id: String = "",
    val videoId: String = "",
    val userId: String = "",
    val userName: String = "",
    val userPhoto: String? = null,
    val text: String = "",
    val createdAt: String = ""
)
