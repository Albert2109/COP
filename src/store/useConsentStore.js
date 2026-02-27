import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Zustand store dedicated to managing user privacy and GDPR consent settings.
 * It tracks whether a user has accepted, declined, or customized their data storage 
 * preferences (Cookies/Local Storage). This store acts as a gatekeeper for features 
 * like online matchmaking (requires session storage) and nickname persistence.
 * * [Image of a state machine diagram for user consent status]
 * * @module useConsentStore
 * @returns {Object} Privacy state and consent management actions.
 */
export const useConsentStore = create(
  devtools(
    persist(
      (set) => ({
        /**
         * Current consent status.
         * Values: 'undecided' (show banner), 'customized', 'accepted_all', 'declined_all'.
         * @type {string}
         */
        status: 'undecided',

        /**
         * Granular user preferences for different data categories.
         * @type {Object}
         * @property {boolean} preferences.session - Permission to store technical IDs for SignalR/Online play.
         * @property {boolean} preferences.nickname - Permission to persist the user's nickname across sessions.
         */
        preferences: {
          session: true,
          nickname: false,
        },
        
        /** @type {boolean} Visibility state of the consent configuration modal */
        isModalOpen: false,

        /** Opens the privacy settings modal */
        openModal: () => set({ isModalOpen: true }, false, 'consent/open'),

        /** Closes the privacy settings modal */
        closeModal: () => set({ isModalOpen: false }, false, 'consent/close'),

        /**
         * Updates granular preferences and sets the status to 'customized'.
         * @param {Object} newPrefs - Partial preferences object to merge.
         */
        setPreferences: (newPrefs) => {
          set((state) => ({
            preferences: { ...state.preferences, ...newPrefs },
            status: 'customized',
            isModalOpen: false, 
          }), false, 'consent/set_custom');
        },

        /**
         * Grants full consent to all data processing categories.
         */
        acceptAll: () => {
          set({
            status: 'accepted_all',
            preferences: { session: true, nickname: true },
            isModalOpen: false, 
          }, false, 'consent/accept_all');
        },

        /**
         * Revokes consent for all optional data processing.
         */
        declineAll: () => {
          set({
            status: 'declined_all',
            preferences: { session: false, nickname: false },
            isModalOpen: false, 
          }, false, 'consent/decline_all');
        },

        /**
         * Resets the consent state to 'undecided', effectively re-triggering the privacy banner.
         */
        resetConsent: () => {
          set({ status: 'undecided', isModalOpen: false }, false, 'consent/reset');
        },
      }),
      { 
        /** Configuration for persistent storage in 'AppConsentStore' local storage key */
        name: 'AppConsentStore' 
      }
    )
  )
);