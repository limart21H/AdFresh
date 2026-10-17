import React from "react";
import {
  Sparkles,
  Cpu,
  Maximize2,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Zap,
  Sliders,
} from "lucide-react";
import { SupportedModel, SupportedImageSize, SupportedAspectRatio } from "../types/banner.ts";
import { ASPECT_RATIOS, IMAGE_SIZES } from "../constants/bannerSizes.ts";

interface AiControlsProps {
  selectedModel: SupportedModel;
  onSelectModel: (model: SupportedModel) => void;
  selectedImageSize: SupportedImageSize;
  onSelectImageSize: (size: SupportedImageSize) => void;
  selectedAspectRatio: SupportedAspectRatio;
  onSelectAspectRatio: (ratio: SupportedAspectRatio) => void;
  visualPrompt: string;
  onChangeVisualPrompt: (prompt: string) => void;
  onRegenerateVisual: () => void;
  isGeneratingVisual: boolean;
  hasCustomImage: boolean;
}

const STYLE_ENHANCERS = [
  "Studio Pedestal",
  "Volumetric Rim Lighting",
  "Minimalist Ceramic",
  "Cyberpunk Neon",
  "Golden Hour Sunlight",
  "Dark Sleek Obsidian",
  "Floating Particles",
  "Glassmorphism Backdrop",
];

export const AiControls: React.FC<AiControlsProps> = ({
  selectedModel,
  onSelectModel,
  selectedImageSize,
  onSelectImageSize,
  selectedAspectRatio,
  onSelectAspectRatio,
  visualPrompt,
  onChangeVisualPrompt,
  onRegenerateVisual,
  isGeneratingVisual,
  hasCustomImage,
}) => {
  const addTagToPrompt = (tag: string) => {
    if (visualPrompt.toLowerCase().includes(tag.toLowerCase())) return;
    const separator = visualPrompt.trim().endsWith(",") ? " " : ", ";
    onChangeVisualPrompt((visualPrompt.trim() + separator + tag).trim());
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Title & Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-wide">
              AI Creative Engine & Image Controls
            </h3>
            <p className="text-xs text-slate-400">
              Configure models, resolution fidelity, and aspect ratios
            </p>
          </div>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Studio Grade
        </span>
      </div>

      {/* 1. Model Selector Affordance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Image Generation Model
          </label>
          <span className="text-[11px] text-slate-400">
            {selectedModel === "gemini-3-pro-image-preview" ? "Studio-Quality Tier" : "Fast General Tier"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option 1: gemini-3-pro-image-preview */}
          <button
            type="button"
            onClick={() => onSelectModel("gemini-3-pro-image-preview")}
            className={`relative p-3.5 rounded-xl border text-left transition-all ${
              selectedModel === "gemini-3-pro-image-preview"
                ? "bg-gradient-to-br from-blue-950/60 to-indigo-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/10"
                : "bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white">gemini-3-pro-image-preview</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    STUDIO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  High-fidelity studio photography. Native support for 1K, 2K & 4K sizes.
                </p>
              </div>
              {selectedModel === "gemini-3-pro-image-preview" && (
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
          </button>

          {/* Option 2: gemini-nano-banana-2.1 */}
          <button
            type="button"
            onClick={() => onSelectModel("gemini-nano-banana-2.1")}
            className={`relative p-3.5 rounded-xl border text-left transition-all ${
              selectedModel === "gemini-nano-banana-2.1"
                ? "bg-gradient-to-br from-blue-950/60 to-indigo-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/10"
                : "bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white">gemini-nano-banana-2.1</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    GENERAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Optimized for versatile ad generations across diverse aspect ratios.
                </p>
              </div>
              {selectedModel === "gemini-nano-banana-2.1" && (
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* 2. Image Size Selector Affordance (1K, 2K, 4K) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            Resolution & Image Size (1K, 2K, 4K)
          </label>
          <span className="text-[11px] text-amber-400/90 font-medium">
            Active: {selectedImageSize}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {IMAGE_SIZES.map((size) => {
            const isSelected = selectedImageSize === size.value;
            return (
              <button
                key={size.value}
                type="button"
                onClick={() => onSelectImageSize(size.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500/50 shadow-md shadow-amber-500/10"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="font-extrabold text-sm">{size.value}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{size.label.split("(")[1]?.replace(")", "") || size.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Aspect Ratio Selector Affordance (1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            Aspect Ratio Control (8 Standard Formats)
          </label>
          <span className="text-[11px] text-indigo-400 font-medium">
            Selected: {selectedAspectRatio}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {ASPECT_RATIOS.map((item) => {
            const isSelected = selectedAspectRatio === item.value;
            // Visual aspect box representation
            const [wPart, hPart] = item.value.split(":").map(Number);
            const maxDim = 24;
            let boxW = maxDim;
            let boxH = maxDim;
            if (wPart > hPart) {
              boxH = Math.max(8, Math.round((hPart / wPart) * maxDim));
            } else if (hPart > wPart) {
              boxW = Math.max(8, Math.round((wPart / hPart) * maxDim));
            }

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onSelectAspectRatio(item.value)}
                title={`${item.label} - ${item.desc}`}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "bg-indigo-600/25 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-md shadow-indigo-500/15"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {/* Visual aspect box */}
                <div className="h-7 w-full flex items-center justify-center mb-1">
                  <div
                    style={{ width: `${boxW}px`, height: `${boxH}px` }}
                    className={`rounded-xs border ${
                      isSelected ? "border-indigo-400 bg-indigo-500/40" : "border-slate-600 bg-slate-800"
                    }`}
                  />
                </div>
                <span className="font-bold text-[11px]">{item.value}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Visual Prompt & Modifiers */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Visual Photography Prompt
          </label>
          <span className="text-[11px] text-slate-400">
            Drives AI commercial backdrop
          </span>
        </div>

        <div className="relative">
          <textarea
            value={visualPrompt}
            onChange={(e) => onChangeVisualPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. Commercial studio shot of product floating on polished dark stone pedestal, volumetric neon rim lighting, 8k crisp details..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Enhancer Chips */}
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1.5">
            Quick Style Enhancers:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STYLE_ENHANCERS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTagToPrompt(tag)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 hover:text-white transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Regenerate Visual Action */}
        <div className="pt-1 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            {hasCustomImage ? "✨ Custom visual loaded" : "💡 Click below to generate or refresh the hero background"}
          </p>
          <button
            type="button"
            onClick={onRegenerateVisual}
            disabled={isGeneratingVisual || !visualPrompt.trim()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isGeneratingVisual ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Generating Image...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Generate Visual with {selectedModel === "gemini-3-pro-image-preview" ? "Gemini 3 Pro" : "Nano Banana"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
