import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-300">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-semibold bg-blue-900/20 px-4 py-2 rounded-xl"
          >
            <span>←</span> Back to Game
          </Link>
        </div>

        <div className="bg-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-700 space-y-8">
          
          <div className="border-b border-slate-700 pb-8">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              Privacy Policy & User Instructions
            </h1>
            <div className="text-sm text-slate-400 space-y-1">
              <p><strong className="text-slate-300">Effective Date:</strong> February 24, 2026</p>
              <p><strong className="text-slate-300">Project:</strong> Connect Four (Four-in-row) — University Laboratory Works</p>
              <p><strong className="text-slate-300">Developer:</strong> Albert Renkas</p>
            </div>
          </div>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-500">1.</span> Overview
            </h2>
            <p className="leading-relaxed">
              This Privacy Policy explains how this educational project handles user data. This application is a digital implementation of the "Connect Four" board game, designed for real-time multiplayer interaction via WebSockets (SignalR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-500">2.</span> Granular Consent Model
            </h2>
            <p className="leading-relaxed mb-3">
              To comply with GDPR principles (Data Minimization & Purpose Limitation) and ensure maximum transparency, this application uses a tiered consent model:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-slate-200">Strictly Necessary (Game Session):</strong> Essential for technical functionality. It stores your temporary Room ID and connection state in Local Storage to maintain your game session via SignalR. Without this, multiplayer online features are unavailable.</li>
              <li><strong className="text-slate-200">Optional (Personalization):</strong> You can choose whether to store your nickname in your browser's persistent storage. If declined, you can still play, but your nickname will not be remembered, and you will appear as an anonymous player.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-500">3.</span> Data Processing Details
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-slate-200">Nicknames:</strong> We process user-defined nicknames solely for identification within a specific game room during gameplay.</li>
              <li><strong className="text-slate-200">Real-time Logic:</strong> Moves and game states are processed in-memory and transmitted via SignalR during active sessions.</li>
              <li><strong className="text-slate-200">No Server-Side Database:</strong> This project does <strong className="text-red-400">not</strong> use a permanent server-side database to store personal user information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-500">4.</span> Storage & Persistence
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-slate-200">Client-Side Storage:</strong> All saved data resides strictly within the user's browser via the <code className="bg-slate-900 px-2 py-1 rounded text-pink-400">AppConsentStore</code> (managed by Zustand).</li>
              <li><strong className="text-slate-200">Individual Choice:</strong> The application respects your individual settings for each category of data (Technical vs. Personalization).</li>
              <li><strong className="text-slate-200">Data Retention:</strong> Consent status and session info are kept until the user manually clears their browser cache or revokes consent via the application settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-500">5.</span> User Rights (GDPR)
            </h2>
            <p className="leading-relaxed mb-3">Users retain full control over their digital footprint:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-slate-200">Erasure:</strong> You can exercise your "Right to be Forgotten" at any time by clearing your browser's site data, which immediately deletes all nicknames, history, and session data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-500">6.</span> Disclaimers & Limitations (EULA)
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-slate-200">Educational Purpose:</strong> This software is provided "as-is" for university grading and evaluation only.</li>
              <li><strong className="text-slate-200">Trademark Notice:</strong> "Connect Four" is a registered trademark of Hasbro, Inc. This project is an independent educational work and is not affiliated with, or endorsed by, Hasbro.</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;