import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Shield, Award, Clock } from 'lucide-react'

const links = {
  Company: ['About Us', 'Careers', 'Press', 'Blog', 'Contact'],
  Services: ['Medicine Delivery', 'Lab Tests', 'Doctor Consultation', 'Health Records', 'Insurance'],
  Support: ['Help Center', 'Track Order', 'Return Policy', 'Privacy Policy', 'Terms of Service'],
  Partners: ['Become a Driver', 'Partner Pharmacy', 'Corporate Plans', 'API Access'],
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white text-xl font-black">M</span>
              </div>
              <span className="text-2xl font-black text-white">MB-Medicos</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Delivering trusted medicines to your doorstep in minutes. Available 24/7 across 50+ cities in India.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-400" /> Bangalore, India</span>
              <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-400" /> 1800-MB-MEDICOS</span>
              <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-400" /> support@mb-medicos.in</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-white font-bold mb-4 text-sm tracking-wider uppercase">{section}</h4>
              <ul className="flex flex-col gap-2">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-8 border-y border-slate-800 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-900/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">100% Authentic</p>
              <p className="text-xs text-slate-400">Licensed pharmacy partners</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900/50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">10-Min Delivery</p>
              <p className="text-xs text-slate-400">Express delivery guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-900/50 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">FSSAI Certified</p>
              <p className="text-xs text-slate-400">Govt. approved medicines</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© 2024 MB-Medicos. All rights reserved. Made with ❤️ in India.</p>
          <div className="flex items-center gap-4">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ scale: 1.15, y: -2 }}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
              >
                <Icon className="w-4 h-4 text-slate-400 hover:text-white" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
