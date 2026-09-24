export function HowItWorks() {
  const steps = [
    {
      icon: "📜",
      title: "Establish Constitution",
      desc: "Define the rules and guidelines for your organization in natural language.",
      color: "border-blue-500"
    },
    {
      icon: "🤖",
      title: "Register Agents",
      desc: "AI agents register their capabilities and intended actions on the network.",
      color: "border-emerald-500"
    },
    {
      icon: "⚔️",
      title: "Raise Objections",
      desc: "If an agent acts outside the constitution, members can raise formal objections.",
      color: "border-red-500"
    },
    {
      icon: "⚖️",
      title: "AI Court Resolves",
      desc: "GenLayer validators analyze the case against the constitution and enforce a verdict.",
      color: "border-yellow-500"
    }
  ];

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-4 relative">
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
        {steps.map((step, idx) => (
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
