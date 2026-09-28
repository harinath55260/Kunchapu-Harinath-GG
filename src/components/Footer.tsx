import React from 'react';
import { Globe, Heart, ShieldCheck, Youtube, Smartphone } from 'lucide-react';
import { CULTURAL_CATEGORIES } from '../data/seedData';
import { PWAInstallButton } from './PWAInstallButton';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenAndroidModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAndroidModal }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md">
                <Globe className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white font-serif tracking-tight">
                Go<span className="text-amber-400">Global</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Explore the World. Share Your Culture.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              GoGlobal is a cultural discovery and community platform connecting people worldwide through authentic heritage, culinary arts, festivals, music, and traditions.
            </p>
            <div className="pt-2 text-xs">
              <span className="text-slate-500">Platform Founder & Architect: </span>
              <span className="text-amber-400 font-semibold">Kunchapu Harinath</span>
            </div>
          </div>

          {/* Cultural Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Cultural Discovery
            </h4>
            <ul className="space-y-1.5 text-xs">
              {CULTURAL_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate('home')}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Global Countries */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Explore Countries
            </h4>
            <ul className="space-y-1.5 text-xs">
              {[
                { id: 'japan', name: 'Japan 🇯🇵' },
                { id: 'india', name: 'India 🇮🇳' },
                { id: 'south-korea', name: 'South Korea 🇰🇷' },
                { id: 'brazil', name: 'Brazil 🇧🇷' },
                { id: 'italy', name: 'Italy 🇮🇹' },
                { id: 'mexico', name: 'Mexico 🇲🇽' }
              ].map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onNavigate('country-detail', c.id)}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance & Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Cultural Integrity
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Videos remain hosted on YouTube. GoGlobal stores metadata and cultural curation notes to celebrate global traditions respectfully without unauthorized reproduction.
            </p>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-tier RBAC & Community Moderation Queue enforced.</span>
            </div>
            {onOpenAndroidModal && (
              <button
                onClick={onOpenAndroidModal}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>GoGlobal Android App (APK / AAB)</span>
              </button>
            )}
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} GoGlobal Platform. All cultural rights reserved. Built by Kunchapu Harinath.</p>
          <div className="flex items-center gap-4">
            {onOpenAndroidModal && (
              <button
                onClick={onOpenAndroidModal}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" /> Native Android APK
              </button>
            )}
            <PWAInstallButton variant="footer" onOpenAndroidModal={onOpenAndroidModal} />
            <span className="flex items-center gap-1 text-slate-400">
              <Youtube className="w-3.5 h-3.5 text-rose-500" /> YouTube Compliant
            </span>
            <span>•</span>
            <span>Shared Firebase Cloud Services</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
