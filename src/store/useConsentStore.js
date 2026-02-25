import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useConsentStore = create(
  devtools(
    persist(
      (set) => ({
        status: 'undecided',
        preferences: {
          session: true,
          nickname: false,
        },
        
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