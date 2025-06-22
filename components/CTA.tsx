const CTA = (): React.JSX.Element => {
  return (
    <section className="py-16 bg-indigo-600 rounded-xl text-center text-white px-4">
      <h2 className="text-3xl font-bold mb-4">Ready to share securely?</h2>
      <p className="text-indigo-100 max-w-2xl mx-auto mb-8">
        Join thousands of businesses and individuals who trust SecureShare for their confidential file transfers.
      </p>
      <div className="flex justify-center gap-4">
        <button onClick={() => {window.location.href= '/register'}} className="bg-white text-indigo-600 hover:bg-gray-100 cursor-pointer font-medium py-3 px-6 rounded-lg transition duration-300">
          Get Started for Free
        </button>
        <button className="border border-white cursor-pointer text-white hover:bg-indigo-700 font-medium py-3 px-6 rounded-lg transition duration-300">
          Contact Sales
        </button>
      </div>
    </section>
  );
};

export default CTA;