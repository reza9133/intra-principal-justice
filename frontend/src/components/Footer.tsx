import { GenLayerLogo } from './GenLayerLogo';

export function Footer() {
  return (
    <footer className="bg-court-dark text-gray-400 py-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 mb-4 md:mb-0 border border-court-gold/30 rounded-full px-4 py-1.5 bg-gray-900/50">
          <span className="text-sm">Powered by</span>
          <GenLayerLogo className="h-5 text-court-gold" />
        </div>
        <div className="flex space-x-6 text-sm">
          <a href="#" className="text-blue-300 hover:text-white transition-colors">Documentation</a>
          <a href="#" className="text-blue-300 hover:text-white transition-colors">GitHub</a>
          <a href="#" className="text-blue-300 hover:text-white transition-colors">Discord</a>
        </div>
      </div>
    </footer>
  );
}
