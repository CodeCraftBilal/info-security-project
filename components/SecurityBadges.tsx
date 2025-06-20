const SecurityBadges = () => {
  return (
    <section className="py-8 mb-12">
      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
        <div className="flex items-center">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-2">AES-256</div>
          <span className="text-gray-600 text-sm">File Encryption</span>
        </div>
        
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2">RSA-2048</div>
          <span className="text-gray-600 text-sm">Key Exchange</span>
        </div>
        
        <div className="flex items-center">
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mr-2">SHA-256</div>
          <span className="text-gray-600 text-sm">Integrity Checks</span>
        </div>
        
        <div className="flex items-center">
          <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium mr-2">TLS 1.3</div>
          <span className="text-gray-600 text-sm">Secure Transport</span>
        </div>
      </div>
    </section>
  );
};

export default SecurityBadges;