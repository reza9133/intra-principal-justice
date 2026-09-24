import { GenLayerLogo } from './GenLayerLogo';

export function Footer() {
  return (
    <footer className="bg-court-dark text-gray-400 py-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 border border-court-gold/40 rounded-full px-4 py-2 bg-gray-900/80 shadow-sm">
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-300">Powered by</span>
          <a
            href="https://genlayer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:opacity-90 transition-opacity"
            title="GenLayer"
          >
            <GenLayerLogo className="h-6 w-auto text-court-gold" />
          </a>
        </div>
        <div className="flex space-x-6 text-sm">
          <a
            href="https://docs.genlayer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-white transition-colors"
          >
            Documentation
          </a>
          <a
            href="https://github.com/reza9133/intra-principal-justice"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://discord.gg/8Jm4v89VAu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-white transition-colors"
          >
            Discord
          </a>
        </div>
      </div>
    </footer>
  );
}
