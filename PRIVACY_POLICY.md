# Privacy Policy & User Instructions

**Effective Date:** February 24, 2026  
**Project:** Connect Four (Four-in-row) — University Laboratory Works  
**Developer:** Albert Renkas

---

## 1. Overview
This Privacy Policy explains how this educational project handles user data. This application is a digital implementation of the "Connect Four" board game, designed for real-time multiplayer interaction via WebSockets (SignalR).

## 2. Granular Consent Model
To comply with GDPR principles (Data Minimization & Purpose Limitation) and ensure maximum transparency, this application uses a tiered consent model:
* **Strictly Necessary (Game Session):** Essential for technical functionality. It stores your temporary Room ID and connection state in Local Storage to maintain your game session via SignalR. Without this, multiplayer online features are unavailable.
* **Optional (Personalization):** You can choose whether to store your nickname in your browser's persistent storage. If declined, you can still play, but your nickname will not be remembered, and you will appear as an anonymous player.

## 3. Data Processing Details
* **Nicknames:** We process user-defined nicknames solely for identification within a specific game room during gameplay.
* **Real-time Logic:** Moves and game states are processed in-memory and transmitted via SignalR during active sessions.
* **No Server-Side Database:** This project does **not** use a permanent server-side database to store personal user information.

## 4. Storage & Persistence
* **Client-Side Storage:** All saved data resides strictly within the user's browser via the `AppConsentStore` (managed by Zustand).
* **Individual Choice:** The application respects your individual settings for each category of data (Technical vs. Personalization).
* **Data Retention:** Consent status and session info are kept until the user manually clears their browser cache or revokes consent via the application settings.

## 5. User Rights (GDPR)
Users retain full control over their digital footprint:
* **Erasure:** You can exercise your "Right to be Forgotten" at any time by clearing your browser's site data, which immediately deletes all nicknames, history, and session data.

## 6. Disclaimers & Limitations (EULA)
* **Educational Purpose:** This software is provided "as-is" for university grading and evaluation only.
* **Trademark Notice:** "Connect Four" is a registered trademark of Hasbro, Inc. This project is an independent educational work and is not affiliated with, or endorsed by, Hasbro.