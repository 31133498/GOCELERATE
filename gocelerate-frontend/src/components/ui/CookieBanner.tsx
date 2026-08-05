import { useState, useEffect } from 'react';

const STORAGE_KEY = 'gocelerate_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-[#1B1D2F] rounded-2xl shadow-modal border border-white/10 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-9 h-9 bg-[#06B6D4]/20 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5">
            <i className="ri-cookie-line text-[#06B6D4] text-base" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold mb-0.5">We use cookies</p>
            <p className="text-white/50 text-sm leading-relaxed">
              Gocelerate uses essential cookies to keep you signed in and improve your experience.
              By continuing, you agree to our use of cookies.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none text-white/50 hover:text-white text-sm font-medium px-4 py-2.5 rounded-full border border-white/10 hover:border-white/30 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
