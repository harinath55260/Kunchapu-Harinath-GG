package com.goglobal.app

import android.app.Application
import com.google.firebase.FirebaseApp

/**
 * GoGlobal Application Entry Point
 * Initializes shared Firebase services (Auth, Firestore, Cloud Storage)
 * Architected by Kunchapu Harinath
 */
class GoGlobalApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
    }
}
