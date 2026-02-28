import React from 'react';
import { useConsentStore } from '../store/useConsentStore';
import { Link } from 'react-router-dom';

/**
 * A persistent footer component that provides quick access to privacy-related features.
 * Contains a trigger to reopen the GDPR consent modal and a link to the full Privacy Policy page.
 * Positioned fixed at the bottom-left of the viewport to remain accessible across different game screens.
 * @component
 * @category Components
 * @returns {JSX.Element} The rendered privacy footer with action buttons and links.
 */
const PrivacyFooter = () => {
  /** * Action from the consent store to toggle the visibility of the CookieConsent modal.
   */
  const { openModal } = useConsentStore();

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3">
      {/* Button to reopen the privacy configuration modal */}
      <button
        onClick={openModal}
        className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-sm border border-slate-700 text-white text-xs font-semibold py-2 px-3 rounded-full flex items-center gap-2 transition-all shadow-lg"
        title="Privacy Settings"
      >
        <span>🛡️</span> GDPR Settings
      </button>

      {/* Internal link to the full Privacy Policy route */}
      <Link 
        to="/privacy-policy" 
        className="text-white/60 hover:text-white text-xs underline underline-offset-2 transition-colors drop-shadow-md"
      >
        Privacy Policy
      </Link>
    </div>
  );
};

export default PrivacyFooter;