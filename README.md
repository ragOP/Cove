# CoveApp

A modern chat application built with React Native.

## Overview
CoveApp is a feature-rich chat application supporting real-time messaging, media sharing, friend requests, and more. Designed for both Android and iOS, it offers a smooth, WhatsApp-like user experience.

## Features
- Real-time one-to-one chat
- Media (image, video, file) sharing
- Friend requests and contact management
- Typing indicators and read receipts
- Custom notifications
- WhatsApp-like sound effects for sending and receiving messages
- Modern, responsive UI

## Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Link native modules (if not using autolinking):**
   ```bash
   npx react-native link
   ```
3. **Run on Android:**
   ```bash
   npm run android
   ```
   **Run on iOS:**
   ```bash
   npm run ios
   ```

## Sound Effects
- Sound assets are located in `src/assets/sounds/`.
- Currently supported:
  - `send.mp3` — played when sending a message
  - `receive.mp3` — played when receiving a message
- To add or update sounds, replace or add files in `src/assets/sounds/` and update the code if you add new types.

## Contribution & Maintenance
- Please keep the README and codebase up to date with any new features or changes.
- For new sound effects, document them in the Sound Effects section.
- Use clear commit messages and follow best practices for React Native development.

## License
MIT
