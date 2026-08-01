const SecurityBadges = () => {
  const badges = [
    { label: 'AES-256', description: 'File Encryption', variant: 'badge-success' },
    { label: 'RSA-2048', description: 'Key Exchange', variant: 'badge-info' },
    { label: 'SHA-256', description: 'Integrity Checks', variant: 'badge-primary' },
    { label: 'TLS 1.3', description: 'Secure Transport', variant: 'badge-accent' },
  ];

  return (
    <section className="py-10 mb-8">
      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
        {badges.map((badge) => (
          <div key={badge.label} className="flex items-center gap-2.5 group">
            <span className={`badge ${badge.variant} transition-all duration-300 group-hover:scale-105`}>
              {badge.label}
            </span>
            <span className="text-text-secondary text-sm font-medium">{badge.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SecurityBadges;