import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Granular user preferences for different data categories.
 * @typedef {Object} ConsentPreferences
 * @property {boolean} session - Permission for SignalR/Online play.
 * @property {boolean} nickname - Permission to persist the nickname.
 */

/**
 * The state and actions provided by the Consent Store.
 * @typedef {Object} ConsentStore
 * @property {string} status - Current consent status ('undecided', 'customized', etc.).
 * @property {ConsentPreferences} preferences - User data categories settings.
 * @property {boolean} isModalOpen - Visibility state of the modal.
 * @property {Function} openModal - Opens the settings modal.
 * @property {Function} closeModal - Closes the settings modal.
 * @property {Function} setPreferences - Updates granular preferences.
 * @property {Function} acceptAll - Grants full consent.
 * @property {Function} declineAll - Revokes optional consent.
 * @property {Function} resetConsent - Triggers the privacy banner again.
 */

/**
 * Zustand store dedicated to managing user privacy and GDPR consent settings.
 * Acts as a gatekeeper for features like online matchmaking and persistence.
 * * @category Stores
 * @returns {ConsentStore} Privacy state and consent management actions.
 */
export const useConsentStore = create(
  devtools(
    persist(
      (set) => ({
        /** @type {string} */
        status: 'undecided',

        /** @type {ConsentPreferences} */
        preferences: {
          session: true,
          nickname: false,
        },
        
        /** @type {boolean} */
        isModalOpen: false,

        openModal: () => set({ isModalOpen: true }, false, 'consent/open'),

        closeModal: () => set({ isModalOpen: false }, false, 'consent/close'),

        setPreferences: (newPrefs) => {
          set((state) => ({
            preferences: { ...state.preferences, ...newPrefs },
            status: 'customized',
            isModalOpen: false, 
          }), false, 'consent/set_custom');
        },

        acceptAll: () => {
          set({
            status: 'accepted_all',
            preferences: { session: true, nickname: true },
            isModalOpen: false, 
          }, false, 'consent/accept_all');
        },

        declineAll: () => {
          set({
            status: 'declined_all',
            preferences: { session: false, nickname: false },
            isModalOpen: false, 
          }, false, 'consent/decline_all');
        },

        resetConsent: () => {
          set({ status: 'undecided', isModalOpen: false }, false, 'consent/reset');
        },
      }),
      { name: 'AppConsentStore' }
    )
  )
);