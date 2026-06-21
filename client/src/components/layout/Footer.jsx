import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Shop': [
      { label: 'All Products', path: '/products' },
      { label: 'Vegetables', path: '/products?category=vegetables' },
      { label: 'Fruits', path: '/products?category=fruits' },
      { label: 'Dairy', path: '/products?category=dairy' },
      { label: 'Organic', path: '/products?category=organic' },
    ],
    'For Farmers': [
      { label: 'Sell on Farm2Door', path: '/signup?role=farmer' },
      { label: 'Farmer Dashboard', path: '/farmer/dashboard' },
      { label: 'Pricing', path: '#' },
      { label: 'Success Stories', path: '#' },
    ],
    'Company': [
      { label: 'About Us', path: '#' },
      { label: 'Careers', path: '#' },
      { label: 'Blog', path: '#' },
      { label: 'Contact', path: '#' },
    ],
    'Support': [
      { label: 'Help Center', path: '#' },
      { label: 'Delivery Info', path: '#' },
      { label: 'Returns', path: '#' },
      { label: 'Privacy Policy', path: '#' },
    ],
  };

  return (
    <footer className="bg-neutral-950 text-white" id="footer">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold font-[family-name:var(--font-display)]">
                Farm<span className="text-sky-400">2</span>Door
              </span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6 max-w-xs">
              Connecting local farmers directly to your doorstep. Fresh, organic, and sustainable produce delivered within hours.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-sky-600 flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                <span className="text-white text-xs font-bold">IG</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-sky-600 flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                <span className="text-white text-xs font-bold">FB</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-sky-600 flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                <span className="text-white text-xs font-bold">X</span>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-neutral-300">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-sm text-neutral-400 hover:text-sky-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Contact bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-400">
              <a href="mailto:hello@farm2door.in" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
                <Mail className="w-4 h-4" /> hello@farm2door.in
              </a>
              <a href="tel:+911234567890" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
                <Phone className="w-4 h-4" /> +91 123 456 7890
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Bangalore, India
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
            <p>© {currentYear} Farm2Door. All rights reserved.</p>
            <p>Made with 💚 for Indian Farmers</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
