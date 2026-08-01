import { Shield, Key, Timer, ShieldCheck, FileText, Users } from 'lucide-react';

const Features = (): React.JSX.Element => {
    const features = [
      {
        title: "End-to-End Encryption",
        description: "Files are encrypted before leaving your device with AES-256 and only the recipient can decrypt them.",
        icon: Shield,
        color: "primary",
      },
      {
        title: "Secure Key Exchange",
        description: "RSA-2048 ensures safe transmission of encryption keys between parties.",
        icon: Key,
        color: "accent",
      },
      {
        title: "Controlled Sharing",
        description: "Set expiration dates, download limits, and revoke access anytime.",
        icon: Timer,
        color: "warning",
      },
      {
        title: "Tamper Detection",
        description: "SHA-256 hashes verify file integrity and detect unauthorized changes.",
        icon: ShieldCheck,
        color: "success",
      },
      {
        title: "Activity Logs",
        description: "Comprehensive audit trails of all file access and sharing activities.",
        icon: FileText,
        color: "info",
      },
      {
        title: "Role-Based Access",
        description: "Granular permissions for admins, users, and guests with different privilege levels.",
        icon: Users,
        color: "primary",
      },
    ];

  const colorMap: Record<string, string> = {
    primary: 'from-primary/20 to-primary/5 text-primary-light border-primary/20',
    accent: 'from-accent/20 to-accent/5 text-accent-light border-accent/20',
    warning: 'from-warning/20 to-warning/5 text-warning border-warning/20',
    success: 'from-success/20 to-success/5 text-success-light border-success/20',
    info: 'from-info/20 to-info/5 text-info border-info/20',
  };

  return (
    <section className="py-20" id="features">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 badge badge-primary mb-4">
          <Shield className="w-3.5 h-3.5" />
          Features
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
          Enterprise-Grade Security Features
        </h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Every layer of SecureShare is designed with security-first principles to protect your most sensitive data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          const colors = colorMap[feature.color] || colorMap.primary;
          return (
            <div
              key={index}
              className="card-interactive p-6 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 border`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;