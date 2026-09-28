package com.goglobal.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.goglobal.app.data.model.VideoItem
import com.goglobal.app.data.repository.CultureRepository
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private val repository = CultureRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            GoGlobalApp(repository)
        }
    }
}

// Country Filter Option
data class CountryFilter(val id: String, val name: String, val flag: String)

val ANDROID_COUNTRIES = listOf(
    CountryFilter("all", "All Countries", "🌍"),
    CountryFilter("india", "India", "🇮🇳"),
    CountryFilter("japan", "Japan", "🇯🇵"),
    CountryFilter("brazil", "Brazil", "🇧🇷"),
    CountryFilter("south-korea", "South Korea", "🇰🇷"),
    CountryFilter("italy", "Italy", "🇮🇹"),
    CountryFilter("mexico", "Mexico", "🇲🇽"),
    CountryFilter("egypt", "Egypt", "🇪🇬"),
    CountryFilter("morocco", "Morocco", "🇲🇦")
)

val ANDROID_CATEGORIES = listOf(
    "All Categories",
    "Traditions & Rituals",
    "Culinary & Food",
    "Music & Dance",
    "Festivals",
    "Architecture",
    "Arts & Crafts"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GoGlobalApp(repository: CultureRepository) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var selectedTab by remember { mutableStateOf(0) }
    val videos by repository.getApprovedVideosFlow().collectAsState(initial = emptyList())
    val currentUserId = repository.currentUserId ?: "guest-contributor"
    val myVideos by repository.getUserContributionsFlow(currentUserId).collectAsState(initial = emptyList())

    // Explore filter state
    var exploreSearchQuery by remember { mutableStateOf("") }
    var selectedCountryFilter by remember { mutableStateOf("all") }
    var selectedCategoryFilter by remember { mutableStateOf("All Categories") }

    // Dialog state for video deletion and contribution
    var videoToDelete by remember { mutableStateOf<VideoItem?>(null) }
    var showAddDialog by remember { mutableStateOf(false) }

    val darkBackground = Color(0xFF020617)
    val cardBackground = Color(0xFF0F172A)
    val primaryAmber = Color(0xFFF59E0B)
    val roseAccent = Color(0xFFF43F5E)
    val emeraldAccent = Color(0xFF10B981)
    val textWhite = Color(0xFFF8FAFC)
    val textMuted = Color(0xFF94A3B8)

    val playVideoAction: (VideoItem) -> Unit = { video ->
        val playUrl = if (video.youtubeUrl.isNotBlank() && video.youtubeUrl.startsWith("http")) {
            video.youtubeUrl
        } else {
            "https://www.youtube.com/watch?v=${video.youtubeVideoId}"
        }
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(playUrl))
            context.startActivity(intent)
        } catch (_: Exception) {
            Toast.makeText(context, "Could not open video player", Toast.LENGTH_SHORT).show()
        }
    }

    MaterialTheme(
        colorScheme = darkColorScheme(
            background = darkBackground,
            surface = cardBackground,
            primary = primaryAmber,
            onBackground = textWhite,
            onSurface = textWhite
        )
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                "GoGlobal",
                                fontWeight = FontWeight.ExtraBold,
                                color = textWhite,
                                fontSize = 20.sp
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                color = primaryAmber.copy(alpha = 0.2f),
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    "CULTURE",
                                    fontSize = 10.sp,
                                    color = primaryAmber,
                                    fontWeight = FontWeight.Black,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    },
                    actions = {
                        IconButton(onClick = { showAddDialog = true }) {
                            Icon(
                                Icons.Default.AddCircle,
                                contentDescription = "Share Cultural Video",
                                tint = primaryAmber
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = darkBackground
                    )
                )
            },
            floatingActionButton = {
                ExtendedFloatingActionButton(
                    onClick = { showAddDialog = true },
                    containerColor = primaryAmber,
                    contentColor = Color(0xFF020617),
                    icon = { Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp)) },
                    text = { Text("Share Culture", fontWeight = FontWeight.ExtraBold, fontSize = 12.sp) }
                )
            },
            bottomBar = {
                NavigationBar(containerColor = cardBackground) {
                    NavigationBarItem(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                        label = { Text("Feed") }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        icon = { Icon(Icons.Default.Search, contentDescription = "Explore") },
                        label = { Text("Explore") }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        icon = { Icon(Icons.Default.Person, contentDescription = "User Hub") },
                        label = { Text("My Videos (${myVideos.size})") }
                    )
                }
            }
        ) { padding ->
            when (selectedTab) {
                0 -> {
                    // Cultural Feed - Focused purely on playing/viewing videos
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(darkBackground)
                            .padding(padding)
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(20.dp))
                                    .background(cardBackground)
                                    .padding(20.dp)
                            ) {
                                Text(
                                    text = "Explore the World. Share Your Culture.",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = primaryAmber
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Watch authentic cultural videos & traditions from countries worldwide.",
                                    fontSize = 13.sp,
                                    color = textMuted
                                )
                            }
                        }

                        // Featured India Civilizational Spotlight
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(20.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1528))
                            ) {
                                Column(modifier = Modifier.padding(18.dp)) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Surface(
                                            color = primaryAmber.copy(alpha = 0.2f),
                                            shape = RoundedCornerShape(6.dp)
                                        ) {
                                            Text(
                                                "TOP CIVILIZATION DOSSIER",
                                                color = primaryAmber,
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.ExtraBold,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                            )
                                        }
                                        Text("5,000+ Yrs History", fontSize = 11.sp, color = textMuted)
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "Explore India's Sacred Heritage 🇮🇳",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = textWhite
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "Ganga Aarti, 8 Classical Dances, 42 UNESCO sites, and Ayurvedic Shad-Rasa gastronomy.",
                                        fontSize = 12.sp,
                                        color = textMuted
                                    )
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Button(
                                        onClick = {
                                            selectedTab = 1
                                            selectedCountryFilter = "india"
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = primaryAmber),
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(12.dp)
                                    ) {
                                        Text("View India Culture Videos 🇮🇳", color = Color(0xFF020617), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    }
                                }
                            }
                        }

                        item {
                            Text(
                                text = "Curated Cultural Discoveries",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = textWhite
                            )
                        }

                        if (videos.isEmpty()) {
                            item {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(16.dp))
                                        .background(cardBackground)
                                        .padding(24.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        text = "Clean Slate • Fresh Start",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = primaryAmber
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = "Be the first cultural ambassador to contribute an authentic YouTube video link.",
                                        fontSize = 12.sp,
                                        color = textMuted,
                                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                    )
                                    Spacer(modifier = Modifier.height(14.dp))
                                    Button(
                                        onClick = { showAddDialog = true },
                                        colors = ButtonDefaults.buttonColors(containerColor = primaryAmber)
                                    ) {
                                        Text("Share Cultural Video", color = Color(0xFF020617), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    }
                                }
                            }
                        } else {
                            items(videos) { video ->
                                VideoCardCompose(
                                    video = video,
                                    cardBackground = cardBackground,
                                    textWhite = textWhite,
                                    textMuted = textMuted,
                                    primaryAmber = primaryAmber,
                                    onPlayClick = { playVideoAction(video) }
                                )
                            }
                        }
                    }
                }
                1 -> {
                    // Explore by Country & Category
                    val filteredVideos = videos.filter { v ->
                        val matchesSearch = exploreSearchQuery.isBlank() ||
                            v.title.contains(exploreSearchQuery, ignoreCase = true) ||
                            v.countryName.contains(exploreSearchQuery, ignoreCase = true) ||
                            v.categoryName.contains(exploreSearchQuery, ignoreCase = true) ||
                            v.description.contains(exploreSearchQuery, ignoreCase = true)

                        val matchesCountry = selectedCountryFilter == "all" ||
                            v.countryId.equals(selectedCountryFilter, ignoreCase = true)

                        val matchesCategory = selectedCategoryFilter == "All Categories" ||
                            v.categoryName.contains(selectedCategoryFilter, ignoreCase = true) ||
                            v.categoryId.contains(selectedCategoryFilter, ignoreCase = true)

                        matchesSearch && matchesCountry && matchesCategory
                    }

                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(darkBackground)
                            .padding(padding)
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        item {
                            Column(modifier = Modifier.padding(top = 8.dp)) {
                                Text(
                                    text = "Explore Global Heritage",
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = textWhite
                                )
                                Spacer(modifier = Modifier.height(10.dp))

                                // Search Field
                                OutlinedTextField(
                                    value = exploreSearchQuery,
                                    onValueChange = { exploreSearchQuery = it },
                                    placeholder = { Text("Search India, Japan, Samba, Diwali...", fontSize = 12.sp, color = textMuted) },
                                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = primaryAmber) },
                                    trailingIcon = {
                                        if (exploreSearchQuery.isNotEmpty()) {
                                            IconButton(onClick = { exploreSearchQuery = "" }) {
                                                Icon(Icons.Default.Close, contentDescription = "Clear", tint = textMuted)
                                            }
                                        }
                                    },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(14.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedContainerColor = cardBackground,
                                        unfocusedContainerColor = cardBackground,
                                        focusedBorderColor = primaryAmber,
                                        unfocusedBorderColor = Color(0xFF334155),
                                        focusedTextColor = textWhite,
                                        unfocusedTextColor = textWhite
                                    )
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                // Country Filter Chips (Horizontal Scroll)
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .horizontalScroll(rememberScrollState()),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    ANDROID_COUNTRIES.forEach { country ->
                                        val isSelected = selectedCountryFilter == country.id
                                        Surface(
                                            modifier = Modifier.clickable {
                                                selectedCountryFilter = country.id
                                            },
                                            shape = RoundedCornerShape(10.dp),
                                            color = if (isSelected) primaryAmber else cardBackground,
                                            border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155))
                                        ) {
                                            Row(
                                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text(country.flag, fontSize = 13.sp)
                                                Spacer(modifier = Modifier.width(5.dp))
                                                Text(
                                                    country.name,
                                                    fontSize = 12.sp,
                                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                                    color = if (isSelected) Color(0xFF020617) else textWhite
                                                )
                                            }
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                // Category Filter Chips
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .horizontalScroll(rememberScrollState()),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    ANDROID_CATEGORIES.forEach { category ->
                                        val isSelected = selectedCategoryFilter == category
                                        Surface(
                                            modifier = Modifier.clickable {
                                                selectedCategoryFilter = category
                                            },
                                            shape = RoundedCornerShape(10.dp),
                                            color = if (isSelected) emeraldAccent else cardBackground,
                                            border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155))
                                        ) {
                                            Text(
                                                category,
                                                fontSize = 11.sp,
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                                color = if (isSelected) Color(0xFF020617) else textWhite,
                                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                                            )
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Text(
                                    text = "Showing ${filteredVideos.size} cultural traditions",
                                    fontSize = 12.sp,
                                    color = textMuted,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }

                        if (filteredVideos.isEmpty()) {
                            item {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 40.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "No cultural videos match your filter.",
                                        color = textMuted,
                                        fontSize = 13.sp
                                    )
                                }
                            }
                        } else {
                            items(filteredVideos) { video ->
                                VideoCardCompose(
                                    video = video,
                                    cardBackground = cardBackground,
                                    textWhite = textWhite,
                                    textMuted = textMuted,
                                    primaryAmber = primaryAmber,
                                    onPlayClick = { playVideoAction(video) }
                                )
                            }
                        }
                    }
                }
                2 -> {
                    // User Hub: Manage uploaded URLs, delete own videos, enforce 100 limit
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(darkBackground)
                            .padding(padding)
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                                shape = RoundedCornerShape(20.dp),
                                colors = CardDefaults.cardColors(containerColor = cardBackground)
                            ) {
                                Column(modifier = Modifier.padding(20.dp)) {
                                    Text(
                                        text = "My Uploaded Cultural Videos",
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = textWhite
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = "Uploaded URLs: ${myVideos.size} / 100 max",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = primaryAmber
                                    )
                                    if (myVideos.size >= 100) {
                                        Spacer(modifier = Modifier.height(10.dp))
                                        Surface(
                                            color = roseAccent.copy(alpha = 0.2f),
                                            shape = RoundedCornerShape(12.dp)
                                        ) {
                                            Text(
                                                text = "You have reached your 100 video URL limit. Delete existing videos to contribute more.",
                                                color = roseAccent,
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                modifier = Modifier.padding(12.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        if (myVideos.isEmpty()) {
                            item {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 40.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "No videos contributed yet. Tap '+' to share your first cultural video!",
                                        color = textMuted,
                                        fontSize = 13.sp
                                    )
                                }
                            }
                        } else {
                            items(myVideos) { video ->
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = cardBackground)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        AsyncImage(
                                            model = video.thumbnail.ifEmpty { "https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg" },
                                            contentDescription = video.title,
                                            contentScale = ContentScale.Crop,
                                            modifier = Modifier
                                                .size(80.dp)
                                                .clip(RoundedCornerShape(10.dp))
                                                .clickable { playVideoAction(video) }
                                        )
                                        Spacer(modifier = Modifier.width(12.dp))
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = video.title,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp,
                                                color = textWhite,
                                                maxLines = 2,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text(
                                                text = video.countryName,
                                                fontSize = 12.sp,
                                                color = primaryAmber
                                            )
                                        }
                                        // Delete Video Button (Only for own uploaded videos)
                                        IconButton(
                                            onClick = { videoToDelete = video }
                                        ) {
                                            Icon(
                                                Icons.Default.Delete,
                                                contentDescription = "Delete video",
                                                tint = roseAccent
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Add Cultural Video Modal Dialog
        if (showAddDialog) {
            AddCulturalVideoDialog(
                repository = repository,
                currentUserId = currentUserId,
                onDismiss = { showAddDialog = false },
                onSuccess = { title ->
                    showAddDialog = false
                    Toast.makeText(context, "Cultural video \"$title\" submitted successfully!", Toast.LENGTH_LONG).show()
                }
            )
        }

        // Delete Confirmation Dialog
        videoToDelete?.let { video ->
            AlertDialog(
                onDismissRequest = { videoToDelete = null },
                title = { Text("Delete Video", fontWeight = FontWeight.Bold) },
                text = {
                    Text("Permanently delete \"${video.title}\"? This removes the URL, metadata, and database records completely.")
                },
                confirmButton = {
                    TextButton(
                        onClick = {
                            coroutineScope.launch {
                                try {
                                    repository.deleteUserVideo(video.id, currentUserId)
                                    Toast.makeText(context, "Video deleted completely", Toast.LENGTH_SHORT).show()
                                } catch (e: Exception) {
                                    Toast.makeText(context, e.message ?: "Delete failed", Toast.LENGTH_SHORT).show()
                                } finally {
                                    videoToDelete = null
                                }
                            }
                        }
                    ) {
                        Text("Delete", color = roseAccent, fontWeight = FontWeight.Bold)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { videoToDelete = null }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}

// Comprehensive Extractor function for YouTube video ID
fun extractYouTubeId(url: String): String {
    val clean = url.trim()
    if (clean.matches(Regex("^[a-zA-Z0-9_-]{11}$"))) {
        return clean
    }
    val regWatch = Regex("""(?:v=|youtu\.be/|embed/|shorts/|live/|v/)([a-zA-Z0-9_-]{11})""")
    val match = regWatch.find(clean)
    return match?.groupValues?.get(1) ?: ""
}

@Composable
fun AddCulturalVideoDialog(
    repository: CultureRepository,
    currentUserId: String,
    onDismiss: () -> Unit,
    onSuccess: (String) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var youtubeUrl by remember { mutableStateOf("") }
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var selectedCountry by remember { mutableStateOf(ANDROID_COUNTRIES[1]) } // India 🇮🇳 default
    var selectedCategory by remember { mutableStateOf(ANDROID_CATEGORIES[1]) }
    var contributorName by remember { mutableStateOf("Global Ambassador") }
    var isSubmitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val darkCard = Color(0xFF0F172A)
    val amber = Color(0xFFF59E0B)

    AlertDialog(
        onDismissRequest = { if (!isSubmitting) onDismiss() },
        title = {
            Text("Share Cultural Video", fontWeight = FontWeight.Bold, color = Color.White)
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 420.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    "Submit an authentic cultural YouTube video celebrating heritage, culinary arts, festivals, or traditions.",
                    fontSize = 12.sp,
                    color = Color(0xFF94A3B8)
                )

                if (errorMessage != null) {
                    Surface(
                        color = Color(0xFFF43F5E).copy(alpha = 0.2f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = errorMessage ?: "",
                            color = Color(0xFFF43F5E),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(8.dp)
                        )
                    }
                }

                // YouTube URL
                OutlinedTextField(
                    value = youtubeUrl,
                    onValueChange = {
                        youtubeUrl = it
                        errorMessage = null
                    },
                    label = { Text("YouTube URL (Required)") },
                    placeholder = { Text("https://www.youtube.com/watch?v=...") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                // Title
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Cultural Title (Required)") },
                    placeholder = { Text("e.g. Varanasi Ganga Aarti Sacred Rituals") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                // Description
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Cultural Essence / Description") },
                    maxLines = 3,
                    modifier = Modifier.fillMaxWidth()
                )

                // Contributor Name
                OutlinedTextField(
                    value = contributorName,
                    onValueChange = { contributorName = it },
                    label = { Text("Your Name / Ambassador Title") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                // Country Selector
                Text("Select Country:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    ANDROID_COUNTRIES.filter { it.id != "all" }.forEach { country ->
                        val isSelected = selectedCountry.id == country.id
                        Surface(
                            modifier = Modifier.clickable { selectedCountry = country },
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSelected) amber else darkCard,
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155))
                        ) {
                            Text(
                                text = "${country.flag} ${country.name}",
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color(0xFF020617) else Color.White,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                            )
                        }
                    }
                }

                // Category Selector
                Text("Select Category:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    ANDROID_CATEGORIES.filter { it != "All Categories" }.forEach { category ->
                        val isSelected = selectedCategory == category
                        Surface(
                            modifier = Modifier.clickable { selectedCategory = category },
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSelected) Color(0xFF10B981) else darkCard,
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155))
                        ) {
                            Text(
                                text = category,
                                fontSize = 10.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color(0xFF020617) else Color.White,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val ytid = extractYouTubeId(youtubeUrl)
                    if (ytid.isBlank()) {
                        errorMessage = "Please enter a valid YouTube URL (watch?v=, youtu.be, or shorts)"
                        return@Button
                    }
                    if (title.isBlank()) {
                        errorMessage = "Please enter a cultural title."
                        return@Button
                    }

                    isSubmitting = true
                    coroutineScope.launch {
                        try {
                            val newVideo = VideoItem(
                                title = title.trim(),
                                description = description.trim(),
                                youtubeUrl = youtubeUrl.trim(),
                                youtubeVideoId = ytid,
                                thumbnail = "https://img.youtube.com/vi/$ytid/hqdefault.jpg",
                                countryId = selectedCountry.id,
                                countryName = "${selectedCountry.name} ${selectedCountry.flag}",
                                region = "Global",
                                categoryId = selectedCategory.lowercase().replace(" ", "-"),
                                categoryName = selectedCategory,
                                contributorId = currentUserId,
                                contributorName = contributorName.ifBlank { "Cultural Ambassador" },
                                status = "approved"
                            )
                            repository.submitCulturalVideo(newVideo)
                            onSuccess(title)
                        } catch (e: Exception) {
                            errorMessage = e.message ?: "Failed to submit video"
                            isSubmitting = false
                        }
                    }
                },
                enabled = !isSubmitting,
                colors = ButtonDefaults.buttonColors(containerColor = amber)
            ) {
                Text(
                    if (isSubmitting) "Submitting..." else "Submit Video",
                    color = Color(0xFF020617),
                    fontWeight = FontWeight.Bold
                )
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                enabled = !isSubmitting
            ) {
                Text("Cancel", color = Color.White)
            }
        }
    )
}

@Composable
fun VideoCardCompose(
    video: VideoItem,
    cardBackground: Color,
    textWhite: Color,
    textMuted: Color,
    primaryAmber: Color,
    onPlayClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onPlayClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = cardBackground)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
            ) {
                AsyncImage(
                    model = video.thumbnail.ifEmpty { "https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg" },
                    contentDescription = video.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                // Play overlay
                Surface(
                    modifier = Modifier.align(Alignment.Center),
                    shape = RoundedCornerShape(30.dp),
                    color = primaryAmber.copy(alpha = 0.9f)
                ) {
                    Icon(
                        Icons.Default.PlayArrow,
                        contentDescription = "Play Cultural Video",
                        tint = Color.Black,
                        modifier = Modifier
                            .size(48.dp)
                            .padding(8.dp)
                    )
                }
                Surface(
                    modifier = Modifier
                        .padding(10.dp)
                        .align(Alignment.TopStart),
                    shape = RoundedCornerShape(8.dp),
                    color = Color.Black.copy(alpha = 0.75f)
                ) {
                    Text(
                        text = video.categoryName,
                        fontSize = 11.sp,
                        color = primaryAmber,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = video.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = textWhite,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = video.description,
                    fontSize = 12.sp,
                    color = textMuted,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = video.countryName,
                        fontSize = 12.sp,
                        color = primaryAmber,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "By ${video.contributorName}",
                        fontSize = 11.sp,
                        color = textMuted
                    )
                }
            }
        }
    }
}
