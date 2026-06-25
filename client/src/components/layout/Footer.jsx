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

  const socialLinks = [
    {
      label: 'Instagram',
      href: '#',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: '#',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
      ),
    },
    {
      label: 'Twitter',
      href: '#',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-neutral-950 text-white" id="footer">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6 gap-8 lg:gap-12">

          {/* Brand Column — spans 2 cols on desktop */}
          <div className="col-span-2 md:col-span-6 lg:col-span-2 mb-4 lg:mb-0">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-sky-500/30 transition-shadow">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold font-[family-name:var(--font-display)]">
                Farm<span className="text-sky-400">2</span>Door
              </span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6 max-w-xs">
              Connecting local farmers directly to your doorstep. Fresh, organic, and sustainable produce delivered within hours.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ svg, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center transition-all duration-300 hover:bg-sky-500 hover:border-sky-500 hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/20"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns — 4 cols on desktop, 2x2 on tablet */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="col-span-1 md:col-span-3 lg:col-span-1">
              <h4 className="font-semibold text-xs uppercase tracking-widest mb-5 text-neutral-400">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-neutral-500 hover:text-sky-400 transition-colors duration-200 leading-none"
                    >
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
      <div className="border-t border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-6 md:gap-8">
            <a
              href="mailto:hello@farm2door.in"
              className="flex items-center gap-2.5 text-sm text-neutral-500 hover:text-sky-400 transition-colors duration-200"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>hello@farm2door.in</span>
            </a>
            <a
              href="tel:+911234567890"
              className="flex items-center gap-2.5 text-sm text-neutral-500 hover:text-sky-400 transition-colors duration-200"
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>+91 123 456 7890</span>
            </a>
            <span className="flex items-center gap-2.5 text-sm text-neutral-500">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>Bangalore, India</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-600">
            <p>© {currentYear} Farm2Door. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Made with
              <span className="text-emerald-500 text-base">💚</span>
              for Indian Farmers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
