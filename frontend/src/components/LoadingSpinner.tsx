import { TransactionStatus } from '../types';

export function LoadingSpinner({ status }: { status: TransactionStatus }) {
  if (status === 'idle') return null;

  return (
    <div className="flex items-center space-x-3 text-sm">
      {status === 'submitting' && (
        <>
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 border-2 border-court-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-court-primary rounded-full border-t-transparent animate-spin"></div>
          </div>
          <span className="text-court-primary font-medium">Submitting to GenLayer...</span>
        </>
      )}
      
      {status === 'deliberating' && (
        <>
          <div className="text-xl animate-bounce">⚖️</div>
          <span className="text-court-gold font-medium">Validators deliberating...</span>
        </>
      )}
      
      {status === 'success' && (
        <>
          <div className="w-5 h-5 rounded-full bg-court-emerald flex items-center justify-center text-white text-xs animate-[scale-in_0.2s_ease-out]">
            ✓
          </div>
          <span className="text-court-emerald font-medium">Transaction confirmed!</span>
        </>
      )}
      
      {status === 'error' && (
        <>
          <div className="w-5 h-5 rounded-full bg-court-danger flex items-center justify-center text-white text-xs animate-shake">
            ✕
          </div>
          <span className="text-court-danger font-medium">Transaction failed</span>
        </>
      )}
    </div>
  );
}
