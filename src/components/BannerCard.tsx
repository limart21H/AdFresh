import React, { useRef, useState } from "react";
import {
  Download,
  Code2,
  Maximize2,
  Edit3,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { BannerSizeConfig, BrandKit, BannerVariation } from "../types/banner.ts";
import {
  downloadBannerAsPng,
  generateHtmlEmbedSnippet,
} from "../utils/canvasExporter.ts";

interface BannerCardProps {
  size: BannerSizeConfig;
  brandKit: BrandKit;
  variation: BannerVariation;
  imageUrl?: string;
  onOpenDetailModal: (size: BannerSizeConfig) => void;
}

export const BannerCard: React.FC<BannerCardProps> = ({
  size,
  brandKit,
  variation,
  imageUrl,
  onOpenDetailModal,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadBannerAsPng({
        size,
        brandKit,
        variation,
        imageUrl,
        scale: 2,
      });
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCode = () => {
    const code = generateHtmlEmbedSnippet(
      { size, brandKit, variation },
      imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
    );
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Determine scaling to fit card preview area nicely
  // Maximum card preview dimensions
  const maxCardWidth = 360;
  const maxCardHeight = 280;

  const widthRatio = maxCardWidth / size.width;
  const heightRatio = maxCardHeight / size.height;
  const displayScale = Math.min(1, widthRatio, heightRatio);

  const scaledWidth = Math.round(size.width * displayScale);
  const scaledHeight = Math.round(size.height * displayScale);

  // Proportional layout logic
  const isWide = size.width / size.height > 2.5;
  const isTall = size.height / size.width > 2.5;

  const headline = variation.headline || brandKit.productTitle;
  const subheadline = variation.subheadline || brandKit.primaryBenefit;
  const ctaText = variation.ctaText || brandKit.ctaText || "Shop Now";
  const badgeText = variation.badge || brandKit.offerBadge;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col group">
      {/* Card Header */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">{size.name}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
            {size.width}×{size.height}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            {size.category}
          </span>
        </div>
      </div>

      {/* Visual Canvas Display Frame */}
      <div className="p-4 flex-1 flex items-center justify-center bg-slate-950/40 min-h-[190px] overflow-hidden relative">
        {/* Banner container rendered at exact size then scaled */}
        <div
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
          className="relative rounded-lg overflow-hidden shadow-xl border border-white/10 shrink-0"
        >
          {/* Banner inner rendered at actual size with CSS transform */}
          <div
            style={{
              width: `${size.width}px`,
              height: `${size.height}px`,
              transform: `scale(${displayScale})`,
              transformOrigin: "top left",
              backgroundColor: brandKit.backgroundColor || "#0F172A",
              color: brandKit.textColor || "#FFFFFF",
            }}
            className="absolute inset-0 select-none overflow-hidden"
          >
            {/* Background Image / Gradient */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Product Hero"
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

            {/* Gradient Overlay for Legibility */}
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

            {/* Live Copy Layout (Matches Canvas Render) */}
            <div className="absolute inset-0 p-3 flex flex-col justify-between box-border z-10 pointer-events-none">
              {/* Wide layout: (e.g. 728x90, 320x50, 970x250) */}
              {isWide ? (
                <div className="h-full flex items-center justify-between w-full">
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span
                        style={{ color: brandKit.accentColor }}
                        className="font-black text-xs uppercase tracking-wider"
                      >
                        {brandKit.brandName || "BRAND"}
                      </span>
                      {badgeText && (
                        <span
                          style={{
                            backgroundColor: brandKit.accentColor,
                            color: "#000000",
                          }}
                          className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase"
                        >
                          {badgeText}
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-sm text-white leading-tight truncate">
                      {headline}
                    </div>
                  </div>

                  {/* Right CTA */}
                  <div
                    style={{ backgroundColor: brandKit.primaryColor }}
                    className="px-3 py-1.5 rounded-md text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1 shadow-md shrink-0"
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ) : isTall ? (
                // Tall layout: (e.g. 160x600, 300x600)
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <div
                      style={{ color: brandKit.accentColor }}
                      className="font-black text-xs uppercase tracking-wider mb-1"
                    >
                      {brandKit.brandName || "BRAND"}
                    </div>
                    {badgeText && (
                      <span
                        style={{
                          backgroundColor: brandKit.accentColor,
                          color: "#000000",
                        }}
                        className="inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase mb-2"
                      >
                        {badgeText}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="font-black text-base text-white leading-snug line-clamp-3 mb-1">
                      {headline}
                    </div>
                    <div className="text-[11px] text-slate-200 line-clamp-2 mb-3">
                      {subheadline}
                    </div>
                    <div
                      style={{ backgroundColor: brandKit.primaryColor }}
                      className="w-full py-2 rounded-md text-white font-bold text-xs uppercase tracking-wide text-center shadow-md"
                    >
                      {ctaText}
                    </div>
                  </div>
                </div>
              ) : (
                // Standard rectangular/square layout
                <div className="h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span
                      style={{ color: brandKit.accentColor }}
                      className="font-black text-xs uppercase tracking-wider"
                    >
                      {brandKit.brandName || "BRAND"}
                    </span>
                    {badgeText && (
                      <span
                        style={{
                          backgroundColor: brandKit.accentColor,
                          color: "#000000",
                        }}
                        className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase"
                      >
                        {badgeText}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="font-black text-sm sm:text-base text-white leading-tight line-clamp-2 mb-1">
                      {headline}
                    </div>
                    <div className="text-[11px] text-slate-200 line-clamp-2 mb-2.5">
                      {subheadline}
                    </div>
                    <div
                      style={{ backgroundColor: brandKit.primaryColor }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-white font-bold text-xs uppercase tracking-wide shadow-md"
                    >
                      <span>{ctaText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hover overlay button to inspect full size */}
        <button
          type="button"
          onClick={() => onOpenDetailModal(size)}
          className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-semibold text-xs backdrop-blur-xs transition-opacity cursor-pointer"
        >
          <div className="p-2 rounded-full bg-blue-600/90 text-white shadow-lg flex items-center gap-1.5 px-3">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full Preview & Edit</span>
          </div>
        </button>
      </div>

      {/* Card Action Footer */}
      <div className="px-3 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-1 text-xs">
        <button
          type="button"
          onClick={() => onOpenDetailModal(size)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Edit</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy HTML5 Ad Embed Snippet"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>{copiedCode ? "Copied!" : "Embed"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? "..." : "PNG"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
