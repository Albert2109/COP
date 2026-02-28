/** @module Components/GameSettingsForm.stories */
import React, { useEffect, useState } from 'react';
import GameSettingsForm from './GameSettingsForm';
import { useConsentStore } from '../../store/useConsentStore';

export default {
  title: 'Components/GameSettingsForm',
  component: GameSettingsForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onSubmit: { action: '🚀 Дані форми відправлено' },
  },
  decorators: [
    (Story, { args }) => {
      const [isReady, setIsReady] = useState(false);

      useEffect(() => {
        if (args.mockConsent) {
          useConsentStore.setState(args.mockConsent);
          setIsReady(true);
        } else {
          setIsReady(true);
        }
      }, [args.mockConsent]);

      const consent = useConsentStore();

      if (!isReady) return null;

      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-8 flex flex-col items-center justify-center gap-4 text-center">
          <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30 text-white text-sm font-bold shadow-xl">
            🔒 Режим конфіденційності: {
              consent.status === 'accepted' ? '✅ ПРИЙНЯТО' : 
              consent.status === 'declined' ? '❌ ВІДХИЛЕНО' : '⏳ ОЧІКУВАННЯ'
            }
          </div>
          
          <div className="w-full max-w-4xl" key={JSON.stringify(args.mockConsent)}>
            <Story />
          </div>

          <p className="text-white/70 text-xs mt-4 italic">
            Підказка: заповніть форму та натисніть кнопку, щоб побачити результат у вкладці "Actions"
          </p>
        </div>
      );
    },
  ],
};

export const AllAccepted = {
  args: {
    mockConsent: {
      status: 'accepted',
      preferences: { session: true, nickname: true }
    },
    currentSettings: { mode: 'online', nickname: 'Albert_Pro_Dev' }
  }
};


export const AllDeclined = {
  args: {
    mockConsent: {
      status: 'declined',
      preferences: { session: false, nickname: false }
    },
    currentSettings: { mode: '' }
  }
};


export const PartialConsent = {
  args: {
    mockConsent: {
      status: 'accepted',
      preferences: { session: true, nickname: false } 
    },
    currentSettings: { mode: 'bot', nickname: 'PrivacyFan' }
  }
};