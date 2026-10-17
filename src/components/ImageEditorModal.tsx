import React, { useState } from "react";
import { X, Sparkles, Wand2, Upload, RefreshCw, Check, ArrowRight, Image as ImageIcon } from "lucide-react";
import { SupportedAspectRatio, SupportedImageSize } from "../types/banner.ts";

interface ImageEditorModalProps {
  currentImageUrl?: string;
  onApplyImage: (imageUrl: string) => void;
  onClose: () => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  currentImageUrl,
  onApplyImage,
  onClose,
}) => {
  const [baseImage, setBaseImage] = useState<string | undefined>(currentImageUrl);
  const [editPrompt, setEditPrompt] = useState(
    "Add dramatic cinematic studio rim lighting and reflection on a dark polished surface"
  );
  const [aspectRatio, setAspectRatio] = useState<SupportedAspectRatio>("1:1");
  const [imageSize, setImageSize] = useState<SupportedImageSize>("1K");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const QUICK_EDITS = [
    "Add warm golden hour lighting",
    "Replace background with modern minimalist studio pedestal",
    "Add glowing cyan cyberpunk neon rim light",
    "Enhance textures and add luxury marble backdrop",
    "Floating levitation with subtle shadow",
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBaseImage(event.target?.result as string);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleExecuteEdit = async () => {
    if (!editPrompt.trim()) return;
    setIsProcessing(true);
    setErrorNotice(null);

    try {
      const res = await fetch("/api/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: baseImage,
          prompt: editPrompt,
          aspectRatio,
          imageSize,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setResultImage(data.imageUrl);
      } else if (data.error) {
        setErrorNotice(data.error);
      }
    } catch (err: unknown) {
      setErrorNotice("Failed to connect to image editor service.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  AI Image Editor & Creator
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  gemini-nano-banana-2.1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Use natural language prompts to create or transform banner imagery
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
        <div className="p-6 overflow-y-auto space-y-6">
          {errorNotice && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-200">
              {errorNotice}
            </div>
          )}

          {/* Grid Preview (Original vs Edited) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Source Image</span>
                <label className="cursor-pointer text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload New</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="h-56 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative">
                {baseImage ? (
                  <img
                    src={baseImage}
                    alt="Source"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-500">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No image selected. Upload or prompt from scratch.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Generated / Edited Result */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-emerald-400">Edited Result</span>
                {resultImage && (
                  <button
                    type="button"
                    onClick={() => onApplyImage(resultImage)}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply to Banners</span>
                  </button>
                )}
              </div>

              <div className="h-56 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative">
                {isProcessing ? (
                  <div className="text-center p-4 text-slate-400 space-y-2">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-400" />
                    <p className="text-xs font-semibold">Editing image with gemini-nano-banana-2.1...</p>
                  </div>
                ) : resultImage ? (
                  <img
                    src={resultImage}
                    alt="Result"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-500">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-400" />
                    <p className="text-xs">Your AI edited image will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Prompt Controls */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
              Edit Instructions & Prompt
            </label>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              rows={2}
              placeholder="e.g. Add golden hour rim light and place product on luxury black marble with soft reflection..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
            />

            {/* Quick Inspiration */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_EDITS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setEditPrompt(preset)}
                  className="text-[10px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
                >
                  ⚡ {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExecuteEdit}
              disabled={isProcessing || !editPrompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Transform with Nano Banana 2.1</span>
                </>
              )}
            </button>

            {resultImage && (
              <button
                type="button"
                onClick={() => {
                  onApplyImage(resultImage);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save to Banners</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
