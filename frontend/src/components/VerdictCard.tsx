import { Dispute } from '../types';

export function VerdictCard({ dispute }: { dispute: Dispute }) {
  const isAllow = dispute.verdict_decision === 'allow_action';
  const isBlock = dispute.verdict_decision === 'block_action';
  
  const getColors = () => {
    if (isAllow) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'bg-green-100 text-green-600', bar: 'bg-green-500' };
    if (isBlock) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'bg-red-100 text-red-600', bar: 'bg-red-500' };
    return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'bg-purple-100 text-purple-600', bar: 'bg-purple-500' };
  };
  
  const colors = getColors();
  const title = isAllow ? 'Objection Overruled' : isBlock ? 'Objection Sustained' : 'Escalated to Human';
  const subtitle = isAllow ? 'Action Approved' : isBlock ? 'Action Blocked' : 'Requires Review';

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-5`}>
      <div className="flex items-center space-x-4 mb-6">
        <div className={`w-12 h-12 rounded-full ${colors.icon} flex items-center justify-center text-2xl shadow-sm`}>
          {isAllow ? '✅' : isBlock ? '❌' : '⚠️'}
        </div>
        <div>
          <h3 className={`font-bold text-lg ${colors.text}`}>{title}</h3>
          <p className={`text-sm opacity-80 ${colors.text}`}>{subtitle}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-bold text-gray-700">Consensus Confidence</span>
          <span className="font-mono text-gray-600">{dispute.verdict_confidence}%</span>
        </div>
        <div className="w-full bg-white rounded-full h-2.5 shadow-inner">
          <div 
            className={`h-2.5 rounded-full ${colors.bar} transition-all duration-1000`} 
            style={{ width: `${dispute.verdict_confidence}%` }}
          ></div>
        </div>
      </div>
      
      <div>
        <span className="text-xs font-bold text-gray-500 uppercase mb-2 block">Court Reasoning</span>
        <div className="bg-white/60 p-4 rounded-lg text-sm text-gray-800 border border-white shadow-sm leading-relaxed relative">
          <span className="absolute top-2 left-2 text-3xl opacity-20 text-gray-400 font-serif">"</span>
          <span className="relative z-10">{dispute.verdict_reasoning}</span>
        </div>
      </div>
    </div>
  );
}
