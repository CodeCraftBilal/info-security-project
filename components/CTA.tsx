import { Zap } from 'lucide-react';

const CTA = (): React.JSX.Element => {
  return (
    <section className="py-20 mt-8 rounded-2xl text-center px-6 relative overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
          Ready to share securely?
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
          Join users who trust SecureShare for their confidential file transfers with military-grade encryption.
        </p>
        <button
          onClick={() => { window.location.href = '/api/auth/signin' }}
          className="btn btn-lg cursor-pointer bg-white text-primary-hover font-bold hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          <Zap className="w-5 h-5" />
          Get Started for Free
        </button>
      </div>
    </section>
  );
};

export default CTA;