# Music Player App

A music streaming application built with React Native and Expo. This app allows users to search, play, and manage their music queue with features like offline downloads, shuffle/repeat modes, and background playback.

## Built With

- **React Native** (Expo SDK 54)
- **TypeScript**
- **React Navigation v6** - For navigation between screens
- **Zustand** - State management (chose this over Redux for simplicity)
- **MMKV** - Fast local storage for queue persistence
- **Expo AV** - Audio playback with background support

## Features

### Core Functionality
- Search songs using JioSaavn API
- Play songs with full player controls (play, pause, next, previous)
- Seek bar to jump to any position in the track
- Persistent mini player at the bottom that stays visible while browsing
- Queue management - add, remove, and reorder songs
- Background playback continues even when app is minimized

### Bonus Features
- **Play Modes**: Normal, Repeat All, Repeat One, Shuffle
- **Offline Downloads**: Download songs for offline listening (Android/iOS only)
- **Queue Persistence**: Your queue is saved locally and restored when you reopen the app

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- For Android: Android Studio with emulator, or a physical Android device

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd MusicPlayer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - **Android**: Press `a` in the terminal or use `npm run android`
   - **Physical Device**: Install Expo Go app and scan the QR code

### Building APK

To build an APK for Android:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview
```

The APK will be available for download after the build completes.

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── MiniPlayer.tsx
│   └── SongItem.tsx
├── navigation/       # Navigation setup
│   └── AppNavigator.tsx
├── screens/          # Main screens
│   ├── HomeScreen.tsx
│   ├── PlayerScreen.tsx
│   └── QueueScreen.tsx
├── services/         # API and storage services
│   ├── api.ts
│   └── storage.ts
├── store/            # Zustand store for state management
│   └── playerStore.ts
└── types/            # TypeScript type definitions
    └── index.ts
```

## Architecture Decisions

### Why Zustand?
I went with Zustand instead of Redux Toolkit because:
- Less boilerplate code
- Simpler API that's easier to understand
- Still powerful enough for this app's needs
- Great performance for this use case

### Why MMKV?
Chose MMKV over AsyncStorage because:
- Faster read/write operations (important for queue persistence)
- Synchronous API which makes state management easier
- Better performance overall

### Why React Navigation instead of Expo Router?
As per requirements, used React Navigation v6 (not Expo Router). This gave me more flexibility with:
- Bottom tabs for Home and Queue
- Stack navigator for the full player modal
- Easy integration with the mini player overlay

## Key Implementation Details

### State Synchronization
Both the Mini Player and Full Player use the same Zustand store. This ensures they're always in sync - when you play/pause from the mini player, the full player updates automatically and vice versa.

### Background Playback
Implemented using Expo AV's `setAudioModeAsync` with `staysActiveInBackground: true`. The audio continues playing when you switch apps or lock your phone.

### Queue Persistence
The queue is saved to MMKV storage whenever it changes. When you reopen the app, your previous queue is restored along with the current song position.

### Offline Downloads
Songs can be downloaded using Expo File System and stored locally. The app checks for downloaded versions before streaming - if a downloaded file exists, it uses that instead.

## API

The app uses the JioSaavn API:
- Base URL: `https://saavn.sumit.co/`
- No API key required
- Endpoints used:
  - `/api/search/songs` - Search for songs
  - `/api/songs/{id}` - Get song details
  - `/api/artists/{id}/songs` - Get artist songs

## Known Limitations

- Download progress indicator not implemented yet
- No playlist support (working on individual songs only)
- Web version has limited functionality (designed for mobile)
- Some features like downloads don't work on web platform

## Future Improvements

If I were to continue working on this, I'd add:
- Playlist creation and management
- Favorite songs
- Recently played history
- Song recommendations
- Sleep timer
- Better download progress UI

## Notes

This project was built as part of a React Native assignment. All features are functional and tested on Android devices. The codebase is clean and follows React Native best practices.

## License

This project is for educational purposes.
