import React from "react";
import { Palette, Tag, Type, MousePointerClick, RefreshCcw } from "lucide-react";
import { BrandKit } from "../types/banner.ts";

interface BrandKitEditorProps {
  brandKit: BrandKit;
  onChangeBrandKit: (updated: BrandKit) => void;
  onAutoTuneColors: () => void;
}

const PALETTE_PRESETS = [
  { name: "Electric Blue", primary: "#2563EB", secondary: "#1E40AF", accent: "#F59E0B", bg: "#0F172A", text: "#FFFFFF" },
  { name: "Neon Cyber", primary: "#8B5CF6", secondary: "#6D28D9", accent: "#06B6D4", bg: "#030712", text: "#FFFFFF" },
  { name: "Luxury Gold", primary: "#D97706", secondary: "#78350F", accent: "#FBBF24", bg: "#18181B", text: "#FFFFFF" },
  { name: "Crimson Bold", primary: "#DC2626", secondary: "#991B1B", accent: "#F97316", bg: "#0F172A", text: "#FFFFFF" },
  { name: "Emerald Pro", primary: "#059669", secondary: "#064E3B", accent: "#34D399", bg: "#022C22", text: "#FFFFFF" },
];

export const BrandKitEditor: React.FC<BrandKitEditorProps> = ({
  brandKit,
  onChangeBrandKit,
  onAutoTuneColors,
}) => {
  const updateField = (field: keyof BrandKit, value: string) => {
    onChangeBrandKit({ ...brandKit, [field]: value });
  };

  const applyPreset = (preset: typeof PALETTE_PRESETS[0]) => {
    onChangeBrandKit({
      ...brandKit,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      backgroundColor: preset.bg,
      textColor: preset.text,
    });
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm text-white">Campaign Copy & Brand Identity</h3>
        </div>
        <button
          type="button"
          onClick={onAutoTuneColors}
          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <RefreshCcw className="w-3 h-3 text-indigo-400" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Grid of Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Brand Name */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Brand Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={brandKit.brandName}
              onChange={(e) => updateField("brandName", e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Product Title */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Product Title
          </label>
          <input
            type="text"
            value={brandKit.productTitle}
            onChange={(e) => updateField("productTitle", e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Offer Badge */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-400" />
            Offer / Discount Badge
          </label>
          <input
            type="text"
            value={brandKit.offerBadge}
            onChange={(e) => updateField("offerBadge", e.target.value)}
            placeholder="e.g. 40% OFF"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Primary Benefit */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Primary Benefit
          </label>
          <input
            type="text"
            value={brandKit.primaryBenefit}
            onChange={(e) => updateField("primaryBenefit", e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Tagline */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Tagline
          </label>
          <input
            type="text"
            value={brandKit.tagline}
            onChange={(e) => updateField("tagline", e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Call to Action Button Text */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <MousePointerClick className="w-3 h-3 text-blue-400" />
            CTA Button Copy
          </label>
          <input
            type="text"
            value={brandKit.ctaText}
            onChange={(e) => updateField("ctaText", e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Colors & Palette Presets */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Brand Colors & Presets:
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {PALETTE_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700/60"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.primary }} />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color pickers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-lg">
            <input
              type="color"
              value={brandKit.primaryColor}
              onChange={(e) => updateField("primaryColor", e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
            <div className="text-[11px]">
              <div className="text-slate-400">Button</div>
              <div className="font-mono text-slate-200 uppercase">{brandKit.primaryColor}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-lg">
            <input
              type="color"
              value={brandKit.accentColor}
              onChange={(e) => updateField("accentColor", e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
            <div className="text-[11px]">
              <div className="text-slate-400">Badge / Tag</div>
              <div className="font-mono text-amber-400 uppercase">{brandKit.accentColor}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-lg">
            <input
              type="color"
              value={brandKit.backgroundColor}
              onChange={(e) => updateField("backgroundColor", e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
            <div className="text-[11px]">
              <div className="text-slate-400">Background</div>
              <div className="font-mono text-slate-200 uppercase">{brandKit.backgroundColor}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-lg">
            <input
              type="color"
              value={brandKit.textColor}
              onChange={(e) => updateField("textColor", e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
            <div className="text-[11px]">
              <div className="text-slate-400">Text</div>
              <div className="font-mono text-slate-200 uppercase">{brandKit.textColor}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
