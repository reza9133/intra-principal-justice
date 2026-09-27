import { HOW_IT_WORKS_STEPS } from '../lib/howItWorksSteps';

export function HowItWorks() {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">How It Works</h2>
      <p className="text-center text-gray-500 max-w-2xl mx-auto mb-12 px-4">
        No sign-up, no admin approval. Connect any Web3 wallet and you can register, propose,
        and object within the same flow.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-7xl mx-auto px-4 relative">
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
        {HOW_IT_WORKS_STEPS.map((step, idx) => (
          <div key={idx} className={`glass-card p-6 border-l-4 ${step.color} relative bg-white`}>
            <div className="text-4xl mb-4 bg-white inline-block">{step.icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
