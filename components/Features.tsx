

const Features = (): React.JSX.Element => {
    const features = [
  {
    title: "End-to-End Encryption",
    description: "Files are encrypted before leaving your device with AES-256 and only the recipient can decrypt them.",
    icon: "🔒"
  },
  {
    title: "Secure Key Exchange",
    description: "RSA-2048 ensures safe transmission of encryption keys between parties.",
    icon: "🔑"
  },
  {
    title: "Controlled Sharing",
    description: "Set expiration dates, download limits, and revoke access anytime.",
    icon: "⏱️"
  },
  {
    title: "Tamper Detection",
    description: "SHA-256 hashes verify file integrity and detect unauthorized changes.",
    icon: "🛡️"
  },
  {
    title: "Activity Logs",
    description: "Comprehensive audit trails of all file access and sharing activities.",
    icon: "📝"
  },
  {
    title: "Role-Based Access",
    description: "Granular permissions for admins, users, and guests with different privilege levels.",
    icon: "👥"
  }
];
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Enterprise-Grade Security Features</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300">
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;