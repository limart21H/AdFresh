import React, { useState } from "react";
import { X, Search, MapPin, Globe, Sparkles, ExternalLink, Check, RefreshCw } from "lucide-react";
import { BrandKit } from "../types/banner.ts";

interface GroundingStudioModalProps {
  brandKit: BrandKit;
  onApplyCopy: (updated: Partial<BrandKit>) => void;
  onClose: () => void;
}

export const GroundingStudioModal: React.FC<GroundingStudioModalProps> = ({
  brandKit,
  onApplyCopy,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"search" | "maps">("search");

  // Search Grounding State
  const [searchQuery, setSearchQuery] = useState(
    `${brandKit.productTitle || "Wireless Noise Canceling Headphones"} trending market`
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    insights: string;
    sources: { title: string; url: string }[];
    suggestedHooks: string[];
  } | null>(null);

  // Maps Grounding State
  const [storeQuery, setStoreQuery] = useState(brandKit.brandName || "Apple");
  const [storeLocation, setStoreLocation] = useState("Fifth Avenue NYC");
  const [isLocating, setIsLocating] = useState(false);
  const [mapsResult, setMapsResult] = useState<{
    placeName: string;
    address: string;
    rating?: string;
    hours?: string;
    localAdCopy: {
      headline: string;
      subtext: string;
      cta: string;
    };
    sources: { title: string; uri: string }[];
  } | null>(null);

  const handleRunSearchGrounding = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch("/api/search-grounding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setSearchResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRunMapsGrounding = async () => {
    if (!storeQuery.trim()) return;
    setIsLocating(true);
    try {
      const res = await fetch("/api/maps-grounding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: storeQuery,
          location: storeLocation,
        }),
      });
      const data = await res.json();
      setMapsResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Real-World Grounding Intelligence
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ground ad campaigns with live Google Search market buzz & Google Maps locations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "search"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Google Search Grounding (Live Market Buzz)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("maps")}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "maps"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Google Maps Grounding (Local Store Banners)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === "search" ? (
            /* SEARCH GROUNDING TAB */
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                  Search Query for Live Market & Competitor Grounding
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. noise cancelling headphones trending features 2026"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleRunSearchGrounding}
                    disabled={isSearching}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
                  >
                    {isSearching ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Search Google</span>
                  </button>
                </div>
              </div>

              {searchResult && (
                <div className="space-y-4 pt-2">
                  {/* Grounded Insights */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                      Live Market Analysis
                    </span>
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      {searchResult.insights}
                    </p>
                  </div>

                  {/* High CTR Suggested Hooks */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Trending Ad Headline Hooks (Click to apply)
                    </span>
                    <div className="space-y-1.5">
                      {searchResult.suggestedHooks.map((hook, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            onApplyCopy({ productTitle: hook.replace(/^"|"$/g, "") });
                          }}
                          className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/60 flex items-center justify-between cursor-pointer transition-all group"
                        >
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
                            {hook}
                          </span>
                          <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 font-bold transition-opacity">
                            Use in Banners →
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Web Sources & Grounding Citations */}
                  {searchResult.sources.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Verified Web Sources:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {searchResult.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-blue-400" />
                            <span className="truncate max-w-[200px]">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* MAPS GROUNDING TAB */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                    Brand or Store Name
                  </label>
                  <input
                    type="text"
                    value={storeQuery}
                    onChange={(e) => setStoreQuery(e.target.value)}
                    placeholder="e.g. Apple Store, Nike, Sephora"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                    City / Neighborhood
                  </label>
                  <input
                    type="text"
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    placeholder="e.g. Soho New York, Downtown Austin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunMapsGrounding}
                disabled={isLocating}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isLocating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MapPin className="w-3.5 h-3.5" />
                )}
                <span>Retrieve Location Data with Google Maps</span>
              </button>

              {mapsResult && (
                <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-4 pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">
                        {mapsResult.placeName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {mapsResult.address}
                      </p>
                    </div>
                    {mapsResult.rating && (
                      <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                        {mapsResult.rating}
                      </span>
                    )}
                  </div>

                  {mapsResult.hours && (
                    <div className="text-xs text-emerald-300 font-medium">
                      🕒 {mapsResult.hours}
                    </div>
                  )}

                  {/* Local Ad Copy Generated */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Generated Local Banner Copy:
                    </span>
                    <div className="font-bold text-xs text-white">
                      Headline: {mapsResult.localAdCopy.headline}
                    </div>
                    <div className="text-xs text-slate-300">
                      Subtext: {mapsResult.localAdCopy.subtext}
                    </div>
                    <div className="text-xs text-amber-300 font-semibold">
                      CTA: {mapsResult.localAdCopy.cta}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onApplyCopy({
                        productTitle: mapsResult.localAdCopy.headline,
                        primaryBenefit: mapsResult.localAdCopy.subtext,
                        ctaText: mapsResult.localAdCopy.cta,
                      });
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Local Store Copy to All Banners</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
