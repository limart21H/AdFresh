import React, { useState } from "react";
import {
  X,
  Download,
  Code2,
  Check,
  RotateCcw,
  Sparkles,
  Maximize2,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { BannerSizeConfig, BrandKit, BannerVariation } from "../types/banner.ts";
import {
  downloadBannerAsPng,
  generateHtmlEmbedSnippet,
} from "../utils/canvasExporter.ts";

interface BannerDetailModalProps {
  size: BannerSizeConfig | null;
  brandKit: BrandKit;
  variation: BannerVariation;
  imageUrl?: string;
  onClose: () => void;
  onUpdateVariation: (updated: BannerVariation) => void;
}

export const BannerDetailModal: React.FC<BannerDetailModalProps> = ({
  size,
  brandKit,
  variation,
  imageUrl,
  onClose,
  onUpdateVariation,
}) => {
  if (!size) return null;

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [viewTab, setViewTab] = useState<"preview" | "code">("preview");

  const isWide = size.width / size.height > 2.5;
  const isTall = size.height / size.width > 2.5;

  const headline = variation.headline || brandKit.productTitle;
  const subheadline = variation.subheadline || brandKit.primaryBenefit;
  const ctaText = variation.ctaText || brandKit.ctaText || "Shop Now";
  const badgeText = variation.badge || brandKit.offerBadge;

  const handleDownload = async (scale: number = 2) => {
    setDownloading(true);
    try {
      await downloadBannerAsPng(
        { size, brandKit, variation, imageUrl, scale },
        `adforge_${size.width}x${size.height}_${size.id}_${scale}x.png`
      );
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const embedCode = generateHtmlEmbedSnippet(
    { size, brandKit, variation },
    imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">{size.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {size.width} × {size.height} px
                </span>
                <span className="text-xs text-slate-400">({size.aspectRatio})</span>
              </div>
              <p className="text-xs text-slate-400">{size.description}</p>
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Preview or Embed Code */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* View Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setViewTab("preview")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    viewTab === "preview"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Live Preview
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab("code")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    viewTab === "code"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  HTML5 Embed Tag
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                IAB Standard Unit
              </span>
            </div>

            {/* Preview Box */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 min-h-[340px] flex items-center justify-center overflow-auto relative">
              {viewTab === "preview" ? (
                <div
                  style={{
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    maxWidth: "100%",
                    maxHeight: "360px",
                    aspectRatio: `${size.width}/${size.height}`,
                    backgroundColor: brandKit.backgroundColor || "#0F172A",
                  }}
                  className="relative rounded-lg overflow-hidden shadow-2xl border border-white/10 shrink-0 select-none"
                >
                  {/* Background Image */}
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Hero background"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${brandKit.primaryColor} 0%, ${brandKit.secondaryColor} 60%, ${brandKit.backgroundColor} 100%)`,
                      }}
                      className="absolute inset-0"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div
                    style={{
                      background: isWide
                        ? "linear-gradient(90deg, rgba(10,15,29,0.92) 0%, rgba(10,15,29,0.7) 50%, rgba(10,15,29,0.3) 100%)"
                        : isTall
                        ? "linear-gradient(180deg, rgba(10,15,29,0.85) 0%, rgba(10,15,29,0.4) 35%, rgba(10,15,29,0.75) 70%, rgba(10,15,29,0.95) 100%)"
                        : "linear-gradient(180deg, rgba(10,15,29,0.7) 0%, rgba(10,15,29,0.45) 45%, rgba(10,15,29,0.95) 100%)",
                    }}
                    className="absolute inset-0 pointer-events-none"
                  />

                  {/* Live Rendered Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between box-border z-10">
                    {isWide ? (
                      <div className="h-full flex items-center justify-between w-full">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              style={{ color: brandKit.accentColor }}
                              className="font-black text-xs uppercase tracking-wider"
                            >
                              {brandKit.brandName}
                            </span>
                            {badgeText && (
                              <span
                                style={{
                                  backgroundColor: brandKit.accentColor,
                                  color: "#000000",
                                }}
                                className="px-2 py-0.5 rounded text-[10px] font-black uppercase"
                              >
                                {badgeText}
                              </span>
                            )}
                          </div>
                          <div className="font-extrabold text-sm sm:text-base text-white truncate">
                            {headline}
                          </div>
                        </div>

                        <div
                          style={{ backgroundColor: brandKit.primaryColor }}
                          className="px-4 py-2 rounded-lg text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-lg shrink-0"
                        >
                          <span>{ctaText}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ) : isTall ? (
                      <div className="h-full flex flex-col justify-between">
                        <div>
                          <div
                            style={{ color: brandKit.accentColor }}
                            className="font-black text-sm uppercase tracking-wider mb-1"
                          >
                            {brandKit.brandName}
                          </div>
                          {badgeText && (
                            <span
                              style={{
                                backgroundColor: brandKit.accentColor,
                                color: "#000000",
                              }}
                              className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase mb-3"
                            >
                              {badgeText}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="font-extrabold text-lg text-white leading-tight mb-2">
                            {headline}
                          </div>
                          <div className="text-xs text-slate-200 line-clamp-3 mb-4">
                            {subheadline}
                          </div>
                          <div
                            style={{ backgroundColor: brandKit.primaryColor }}
                            className="w-full py-2.5 rounded-lg text-white font-bold text-xs uppercase tracking-wide text-center shadow-lg"
                          >
                            {ctaText}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span
                            style={{ color: brandKit.accentColor }}
                            className="font-black text-xs uppercase tracking-wider"
                          >
                            {brandKit.brandName}
                          </span>
                          {badgeText && (
                            <span
                              style={{
                                backgroundColor: brandKit.accentColor,
                                color: "#000000",
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-black uppercase"
                            >
                              {badgeText}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="font-extrabold text-base text-white leading-tight mb-1.5">
                            {headline}
                          </div>
                          <div className="text-xs text-slate-200 line-clamp-2 mb-3">
                            {subheadline}
                          </div>
                          <div
                            style={{ backgroundColor: brandKit.primaryColor }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white font-bold text-xs uppercase tracking-wide shadow-lg"
                          >
                            <span>{ctaText}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">Embed Snippet</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied!" : "Copy Code"}</span>
                    </button>
                  </div>
                  <pre className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-300 overflow-auto max-h-[280px]">
                    {embedCode}
                  </pre>
                </div>
              )}
            </div>

            {/* Quick Export actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDownload(2)}
                disabled={downloading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? "Rendering..." : "Download 2x Retina PNG"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload(1)}
                disabled={downloading}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                1x Standard
              </button>
            </div>
          </div>

          {/* Right Column: Copy Customization */}
          <div className="lg:col-span-5 space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Tailor Text for this Size
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateVariation({
                    ...variation,
                    headline: brandKit.productTitle,
                    subheadline: brandKit.primaryBenefit,
                    ctaText: brandKit.ctaText,
                    badge: brandKit.offerBadge,
                  })
                }
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Format Headline
                </label>
                <input
                  type="text"
                  value={variation.headline}
                  onChange={(e) =>
                    onUpdateVariation({ ...variation, headline: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Subheadline / Benefit
                </label>
                <textarea
                  value={variation.subheadline}
                  onChange={(e) =>
                    onUpdateVariation({ ...variation, subheadline: e.target.value })
                  }
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Offer Badge
                  </label>
                  <input
                    type="text"
                    value={variation.badge}
                    onChange={(e) =>
                      onUpdateVariation({ ...variation, badge: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    CTA Button
                  </label>
                  <input
                    type="text"
                    value={variation.ctaText}
                    onChange={(e) =>
                      onUpdateVariation({ ...variation, ctaText: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Dimension Specs */}
            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Standard Dimensions:</span>
                <span className="font-mono text-slate-200">{size.width} × {size.height} px</span>
              </div>
              <div className="flex justify-between">
                <span>Aspect Ratio:</span>
                <span className="font-mono text-slate-200">{size.aspectRatio}</span>
              </div>
              <div className="flex justify-between">
                <span>Network Placement:</span>
                <span className="text-slate-200">{size.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Retina Resolution:</span>
                <span className="font-mono text-emerald-400">{size.width * 2} × {size.height * 2} px (2x)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
