package com.goglobal.app.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Home : Screen("home", "Home")
    object Explore : Screen("explore", "Explore")
    object Countries : Screen("countries", "Countries")
    object CountryDetail : Screen("country/{countryId}", "Country") {
        fun createRoute(countryId: String) = "country/$countryId"
    }
    object VideoDetail : Screen("video/{videoId}", "Cultural Video") {
        fun createRoute(videoId: String) = "video/$videoId"
    }
    object Contribute : Screen("contribute", "Share Culture")
    object Profile : Screen("profile", "User Hub")
    object Admin : Screen("admin", "Admin Console")
}
