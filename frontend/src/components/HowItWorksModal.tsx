import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HOW_IT_WORKS_STEPS } from '../lib/howItWorksSteps';

// Listens for a global 'open-how-it-works' event (dispatched by the Header
// button) so it can be rendered once in App and stay reachable whether or
// not a wallet is connected -- unlike the landing-page HowItWorks section,
// which only shows before connecting.
export function HowItWorksModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-how-it-works', handleOpen);
    return () => window.removeEventListener('open-how-it-works', handleOpen);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-gray-100 max-h-[85vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {HOW_IT_WORKS_STEPS.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-4 p-4 rounded-xl bg-gray-50 border-l-4 ${step.color}`}
                  >
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{step.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-6 py-3 bg-court-primary hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
