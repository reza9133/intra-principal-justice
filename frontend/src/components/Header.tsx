import { CourtLogo } from './CourtLogo';
import { AccountPanel } from './AccountPanel';

export function Header() {
  return (
    <header className="bg-court-dark text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CourtLogo className="w-8 h-8" />
          <span className="text-xl font-bold">
            Intra-Principal <span className="text-court-gold">Justice</span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.dispatchEvent(new Event('open-how-it-works'))}
            className="text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center space-x-1.5"
          >
            <span>❔</span>
            <span className="hidden sm:inline">How it works</span>
          </button>
          <AccountPanel />
        </div>
      </div>
    </header>
  );
}
