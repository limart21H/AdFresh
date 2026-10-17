import React, { useState } from "react";
import { Link2, Sparkles, RefreshCw, Globe, ArrowRight, Wand2 } from "lucide-react";
import { SAMPLE_PRODUCTS } from "../constants/bannerSizes.ts";

interface ProductFormProps {
  url: string;
  onChangeUrl: (url: string) => void;
  description: string;
  onChangeDescription: (desc: string) => void;
  onGenerateCampaign: () => void;
  onSelectSample: (sample: typeof SAMPLE_PRODUCTS[0]) => void;
  isGenerating: boolean;
  statusMessage?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  url,
  onChangeUrl,
  description,
  onChangeDescription,
  onGenerateCampaign,
  onSelectSample,
  isGenerating,
  statusMessage,
}) => {
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [scrapeNotification, setScrapeNotification] = useState<string | null>(null);

  const handleFetchUrl = async () => {
    if (!url.trim()) return;
    setIsFetchingUrl(true);
    setScrapeNotification(null);

    try {
      const res = await fetch("/api/scrape-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (data.title || data.description) {
        const combined = [
          data.title ? `Product: ${data.title}` : "",
          data.description ? `Overview: ${data.description}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        if (!description.trim() || description.length < 30) {
          onChangeDescription(combined);
        }
        setScrapeNotification(`Extracted metadata from ${data.title ? `"${data.title.slice(0, 40)}..."` : "webpage"}`);
      } else {
        setScrapeNotification("Connected to URL! Enter key highlights below for best results.");
      }
    } catch {
      setScrapeNotification("Could not reach website directly. You can paste description directly.");
    } finally {
      setIsFetchingUrl(false);
      setTimeout(() => setScrapeNotification(null), 5000);
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white tracking-wide">
              Product & Offer Source
            </h2>
            <p className="text-xs text-slate-400">
              Provide your website URL and product description
            </p>
          </div>
        </div>
      </div>

      {/* Preset Samples */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-medium text-slate-300 flex items-center gap-1">
            <Wand2 className="w-3 h-3 text-indigo-400" />
            Quick Example Presets:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PRODUCTS.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => onSelectSample(sample)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all font-medium"
            >
              {sample.name.split(" ")[0]} ({sample.name.split(" ").slice(1, 3).join(" ")})
            </button>
          ))}
        </div>
      </div>

      {/* URL Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-blue-400" />
          Product or Store URL (Optional)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => onChangeUrl(e.target.value)}
              placeholder="https://example.com/products/pro-headphones"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={handleFetchUrl}
            disabled={isFetchingUrl || !url.trim()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
          >
            {isFetchingUrl ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Fetch Info</span>
          </button>
        </div>

        {scrapeNotification && (
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 animate-fadeIn">
            ✓ {scrapeNotification}
          </p>
        )}
      </div>

      {/* Description Textarea */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>Product Description & Selling Points *</span>
          <span className="text-[11px] font-normal text-slate-500">
            {description.length} chars
          </span>
        </label>
        <textarea
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          rows={4}
          placeholder="Describe your product, main features, discount offer (e.g. 40% OFF this week), target audience, and guarantee..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGenerateCampaign}
          disabled={isGenerating || (!description.trim() && !url.trim())}
          className="w-full relative group overflow-hidden py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 hover:from-blue-500 hover:via-indigo-500 hover:to-amber-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2">
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{statusMessage || "Generating Banner Ads Across Standard Sizes..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate High-Quality Banner Ads</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
