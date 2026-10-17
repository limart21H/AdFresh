import React from "react";
import { Layers, Sparkles, Download, Wand2, ShieldCheck } from "lucide-react";
import { SupportedModel, SupportedImageSize } from "../types/banner.ts";

interface HeaderProps {
  currentModel: SupportedModel;
  currentSize: SupportedImageSize;
  bannerCount: number;
  onOpenExportAll: () => void;
  onOpenTemplates: () => void;
  onOpenGame: () => void;
  onOpenImageEditor: () => void;
  onOpenVideoGenerator: () => void;
  onOpenGrounding: () => void;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentModel,
  currentSize,
  bannerCount,
  onOpenExportAll,
  onOpenTemplates,
  onOpenGame,
  onOpenImageEditor,
  onOpenVideoGenerator,
  onOpenGrounding,
  isGenerating,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">AdForge</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30">
                AI Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-Format Banner Ads, 3D Arcade & Generative Media
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 3D Game Launcher */}
          <button
            onClick={onOpenGame}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all shadow-sm"
          >
            <span>🎮</span>
            <span>AdRush 3D</span>
          </button>

          {/* AI Image Editor (Nano Banana 2.1) */}
          <button
            onClick={onOpenImageEditor}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-purple-300 transition-colors"
          >
            <span>🎨</span>
            <span>Image Editor</span>
          </button>

          {/* Veo Video Generator */}
          <button
            onClick={onOpenVideoGenerator}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-rose-300 transition-colors"
          >
            <span>🎬</span>
            <span>Veo Video</span>
          </button>

          {/* Google Search & Maps Grounding */}
          <button
            onClick={onOpenGrounding}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-blue-300 transition-colors"
          >
            <span>🌐</span>
            <span>Grounding</span>
          </button>

          {/* Export Campaign Button */}
          <button
            onClick={onOpenExportAll}
            disabled={bannerCount === 0 || isGenerating}
            type="button"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ({bannerCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
