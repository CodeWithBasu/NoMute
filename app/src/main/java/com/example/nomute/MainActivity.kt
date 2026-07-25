package com.example.nomute

import android.content.Context
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Bundle
import android.view.KeyEvent
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.nomute.theme.NoMuteTheme
import com.example.nomute.ui.main.PrankScreen

class MainActivity : ComponentActivity() {

    private var mediaPlayer: MediaPlayer? = null
    private var isPlaying = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            NoMuteTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    PrankScreen(onPlayClicked = {
                        startAudio()
                    })
                }
            }
        }
    }

    private fun startAudio() {
        if (mediaPlayer == null) {
            mediaPlayer = MediaPlayer.create(this, R.raw.waves)
            mediaPlayer?.isLooping = true
        }
        mediaPlayer?.start()
        isPlaying = true
        Toast.makeText(this, "Audio started! Auto-Compensator ACTIVE! 💥", Toast.LENGTH_SHORT).show()
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        // Hijack the Volume Down button!
        if (isPlaying && keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
            val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC)
            val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
            
            // Programmatically INCREASE the volume instead of decreasing!
            val newVolume = if (currentVolume < maxVolume) currentVolume + 1 else maxVolume
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, newVolume, 0)

            Toast.makeText(this, "Volume Down detected! Amplifying Gain to 500%! 🔊", Toast.LENGTH_SHORT).show()
            
            // Return true to consume the event and prevent the system from lowering the volume
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onDestroy() {
        super.onDestroy()
        mediaPlayer?.release()
        mediaPlayer = null
    }
}
