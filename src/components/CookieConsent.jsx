import React, { useState, useEffect } from 'react';
import { useConsentStore } from '../store/useConsentStore';
import { Link } from 'react-router-dom';

/**
 * A GDPR-compliant cookie and local storage consent banner.
 * Manages user privacy preferences for game sessions and personalization. 
 * The component integrates with a global `useConsentStore` to persist choices 
 * and controls the availability of features like SignalR online play and nickname saving.
 * * @component
 * @returns {JSX.Element|null} The rendered consent banner/modal or null if the user has already decided.
 */
const CookieConsent = () => {
  /** * Destructured state and actions from the global consent store.
   * Includes preferences for session storage and personalization.
   */
  const { status, preferences, setPreferences, acceptAll, declineAll, isModalOpen, closeModal } = useConsentStore();
  
/**
 * Internal state to toggle between the simple banner view and the granular configuration view.
 * @type {Array} 
 */
const [isConfiguring, setIsConfiguring] = useState(false);

  /**
   * Automatically opens the configuration view if the modal is triggered from the settings/footer.
   */
  useEffect(() => {
    if (isModalOpen) setIsConfiguring(true);
  }, [isModalOpen]);

  /** * Determines visibility logic: show if the user hasn't decided yet or if they explicitly opened the settings modal.
   */
  const shouldShow = status === 'undecided' || isModalOpen;

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl z-[100] animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="bg-slate-900 border border-blue-500/40 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative">

        {/* Close button - only visible if the user has already made an initial choice */}
        {status !== 'undecided' && (
          <button 
            onClick={closeModal}
            className="absolute top-4 right-5 text-slate-400 hover:text-white transition-colors text-xl font-bold"
          >
            ✕
          </button>
        )}

        <div className="flex items-start gap-4 mb-6">
          <div className="bg-blue-600/20 p-3 rounded-2xl text-3xl shrink-0">🍪</div>
          <div className="text-left">
            <h4 className="text-white font-bold text-lg tracking-tight">Privacy settings</h4>
            <p className="text-slate-300 text-sm leading-relaxed mt-1">
              This project uses local storage to run the game.
              Check out the <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 font-semibold">Privacy Policy</Link>
            </p>
          </div>
        </div>

        {/* Granular configuration view for specific categories */}
        {(isConfiguring || isModalOpen) && (
          <div className="space-y-4 mb-6 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-bold">Game session (Required)</p>
                <p className="text-slate-400 text-xs">Storing the room ID for connection via SignalR.</p>
              </div>
              <input 
                type="checkbox" 
                checked={preferences.session}
                onChange={(e) => setPreferences({ session: e.target.checked })}
                className="w-5 h-5 accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-bold">Personalization (Optional)</p>
                <p className="text-slate-400 text-xs">Saving your nickname for future games.</p>
              </div>
              <input 
                type="checkbox" 
                checked={preferences.nickname}
                onChange={(e) => setPreferences({ nickname: e.target.checked })}
                className="w-5 h-5 accent-blue-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Action buttons based on the current view (Banner vs Configuration) */}
        <div className="flex flex-col md:flex-row gap-3">
          {(!isConfiguring && status === 'undecided') ? (
            <>
              <button 
                onClick={declineAll}
                className="px-6 py-3 rounded-xl bg-slate-700 text-white text-sm font-bold hover:bg-slate-600 transition-all"
              >
                Reject all
              </button>
              <button 
                onClick={() => setIsConfiguring(true)}
                className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm font-bold hover:bg-slate-700 transition-all"
              >
                Configure
              </button>
              <button 
                onClick={acceptAll}
                className="flex-1 px-8 py-3 rounded-xl bg-blue-600 text-white text-sm font-black hover:bg-blue-500 shadow-lg shadow-blue-900/40 transition-all"
              >
                Accept everything and play
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                setIsConfiguring(false);
                closeModal(); 
              }}
              className="w-full px-8 py-3 rounded-xl bg-green-600 text-white text-sm font-black hover:bg-green-500 transition-all"
            >
              Save selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;