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

        setPreferences: (newPrefs) => {
          set((state) => ({
            preferences: { ...state.preferences, ...newPrefs },
            status: 'customized',
          }), false, 'consent/set_custom');
        },

        acceptAll: () => {
          set({
            status: 'accepted_all',
            preferences: { session: true, nickname: true },
          }, false, 'consent/accept_all');
        },

        declineAll: () => {
          set({
            status: 'declined_all',
            preferences: { session: false, nickname: false },
          }, false, 'consent/decline_all');
        },

        resetConsent: () => {
          set({ status: 'undecided' }, false, 'consent/reset');
        },
      }),
      {
        name: 'AppConsentStore', 
      }
    )
  )
);