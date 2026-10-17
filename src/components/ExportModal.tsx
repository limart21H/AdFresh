import React, { useState } from "react";
import { X, Download, Archive, Check, Layers, AlertCircle } from "lucide-react";
import { BannerSizeConfig, BrandKit, BannerVariation } from "../types/banner.ts";
import { downloadAllBannersAsZip } from "../utils/canvasExporter.ts";

interface ExportModalProps {
  bannerSizes: BannerSizeConfig[];
  brandKit: BrandKit;
  variations: Record<string, BannerVariation>;
  imageUrl?: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  bannerSizes,
  brandKit,
  variations,
  imageUrl,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    bannerSizes.map((s) => s.id)
  );
  const [isZipping, setIsZipping] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(bannerSizes.map((s) => s.id));
  const deselectAll = () => setSelectedIds([]);

  const handleExportZip = async () => {
    if (selectedIds.length === 0) return;
    setIsZipping(true);
    setProgress({ completed: 0, total: selectedIds.length });

    const activeSizes = bannerSizes.filter((s) => selectedIds.includes(s.id));
    const renderItems = activeSizes.map((size) => ({
      size,
      brandKit,
      variation: variations[size.id] || {
        sizeId: size.id,
        headline: brandKit.productTitle,
        subheadline: brandKit.primaryBenefit,
        ctaText: brandKit.ctaText,
        badge: brandKit.offerBadge,
      },
      imageUrl,
      scale: 2, // crisp 2x retina
    }));

    try {
      await downloadAllBannersAsZip(
        renderItems,
        brandKit.brandName || "Campaign",
        (completed, total) => setProgress({ completed, total })
      );
      setTimeout(() => {
        setIsZipping(false);
        setProgress(null);
        onClose();
      }, 800);
    } catch (err) {
      console.error("ZIP creation failed:", err);
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Export Campaign Banners
              </h3>
              <p className="text-xs text-slate-400">
                Package high-resolution retina graphics for Google Display, Meta & Web
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Controls */}
          <div className="flex items-center justify-between text-xs">
            <div className="text-slate-300 font-semibold">
              Selected:{" "}
              <span className="text-amber-400 font-bold">{selectedIds.length}</span> of{" "}
              {bannerSizes.length} standard sizes
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Select All
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={deselectAll}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Formats Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {bannerSizes.map((size) => {
              const checked = selectedIds.includes(size.id);
              return (
                <div
                  key={size.id}
                  onClick={() => toggleSelect(size.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    checked
                      ? "bg-slate-800/80 border-blue-500/60 shadow-sm"
                      : "bg-slate-950/40 border-slate-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                        checked ? "bg-blue-600 text-white" : "border border-slate-600 bg-slate-800"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{size.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {size.width} × {size.height} px
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {size.category}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress state */}
          {isZipping && progress && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Rendering High-Res Canvases...</span>
                <span className="font-mono text-amber-400">
                  {progress.completed} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-amber-500 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExportZip}
            disabled={isZipping || selectedIds.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? "Packaging ZIP..." : `Download ZIP Archive (${selectedIds.length})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
