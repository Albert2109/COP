import React from 'react';
import { useConsentStore } from '../store/useConsentStore';
import { Link } from 'react-router-dom';
const PrivacyFooter = () => {
  const { openModal } = useConsentStore();

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3">
      <button
        onClick={openModal}
        className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-sm border border-slate-700 text-white text-xs font-semibold py-2 px-3 rounded-full flex items-center gap-2 transition-all shadow-lg"
        title="Налаштування конфіденційності"
      >
        <span>🛡️</span> Налаштування GDPR
      </button>

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