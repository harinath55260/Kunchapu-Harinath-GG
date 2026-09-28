import React, { useState } from 'react';
import { MapPin, Globe, Compass, ArrowRight } from 'lucide-react';
import { CULTURAL_COUNTRIES } from '../data/seedData';
import { VideoItem } from '../types';

interface CountriesViewProps {
  onSelectCountry: (countryId: string) => void;
  videos: VideoItem[];
}

export const CountriesView: React.FC<CountriesViewProps> = ({ onSelectCountry, videos }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const regions = ['all', 'East Asia', 'South Asia', 'Western Europe', 'Southern Europe', 'North America', 'South America', 'North Africa & Middle East', 'Southeast Asia', 'West Africa'];

  const filteredCountries = CULTURAL_COUNTRIES.filter((c) => {
    if (selectedRegion === 'all') return true;
    return c.region.toLowerCase().includes(selectedRegion.toLowerCase());
  });

  // Calculate live video counts per country
  const getCountryVideoCount = (countryId: string) => {
    return videos.filter(v => v.countryId === countryId).length;
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Global Cultural Atlas</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
          Explore Sovereign Cultures
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Select any country to view its cultural dossier, authentic culinary rituals, seasonal festivals, sacred ceremonies, and member contributions.
        </p>
      </div>

      {/* Region Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedRegion === r
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {r === 'all' ? 'All World Regions' : r}
          </button>
        ))}
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCountries.map((country) => {
          const videoCount = getCountryVideoCount(country.id);
          return (
            <div
              key={country.id}
              onClick={() => onSelectCountry(country.id)}
              className="group bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-amber-500/50 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                <img
                  src={country.bannerImage}
                  alt={country.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-200">
                  {country.region}
                </div>

                <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                  <span className="text-3xl filter drop-shadow">{country.flag}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white font-serif group-hover:text-amber-300 transition-colors">
                      {country.name}
                    </h3>
                  </div>
                </div>

                <div className="absolute bottom-3 right-4 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold backdrop-blur-md">
                  {videoCount} {videoCount === 1 ? 'Video' : 'Videos'}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {country.description}
                </p>

                {/* Cultural Highlights preview */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cultural Traditions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {country.culturalHighlights.slice(0, 3).map((h, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 text-[11px]"
                      >
                        {h.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                  <span>Explore Cultural Dossier</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
