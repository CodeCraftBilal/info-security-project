import { Link } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SecureShare</h3>
            <p className="text-gray-600">
              The most secure way to share files with end-to-end encryption and advanced access controls.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Features</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Pricing</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">API</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Integrations</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Documentation</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Guides</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-600 hover:text-indigo-600">About</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-indigo-600">Careers</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-indigo-600">Privacy</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-indigo-600">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500">
          <p>© 2023 SecureShare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;