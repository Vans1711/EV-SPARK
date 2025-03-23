
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Twitter, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-ev-dark-300 border-t border-white/5 pt-16 pb-8 px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 group">
              <Zap className="h-7 w-7 text-ev-green-400" />
              <span className="text-xl font-bold tracking-tight text-white">
                EV <span className="text-ev-green-400">Spark</span>
              </span>
            </Link>
            <p className="mt-4 text-white/60 max-w-md">
              Revolutionizing the way EV owners find and use charging stations with our
              smart network and advanced features.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-white/60 hover:text-ev-green-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-ev-green-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-ev-green-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-ev-green-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/stations" className="text-white/60 hover:text-ev-green-400 transition-colors">
                  Station Locator
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-white/60 hover:text-ev-green-400 transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link to="/rewards" className="text-white/60 hover:text-ev-green-400 transition-colors">
                  Spark Rewards
                </Link>
              </li>
              <li>
                <Link to="/payments" className="text-white/60 hover:text-ev-green-400 transition-colors">
                  Payment Options
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/support" className="text-white/60 hover:text-ev-green-400 transition-colors">
                  Emergency Support
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/60 hover:text-ev-green-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/60 hover:text-ev-green-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-white/60 hover:text-ev-green-400 transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-white/60 hover:text-ev-green-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-white/60 hover:text-ev-green-400 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/60 hover:text-ev-green-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/60 hover:text-ev-green-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} EV Spark. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
