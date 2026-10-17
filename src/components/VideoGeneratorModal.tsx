import React, { useState } from "react";
import { X, Film, Upload, RefreshCw, Play, Download, Sparkles, AlertCircle } from "lucide-react";

interface VideoGeneratorModalProps {
  currentImageUrl?: string;
  onClose: () => void;
}

export const VideoGeneratorModal: React.FC<VideoGeneratorModalProps> = ({
  currentImageUrl,
  onClose,
}) => {
  const [photo, setPhoto] = useState<string | undefined>(currentImageUrl);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [prompt, setPrompt] = useState(
    "Cinematic commercial product advertisement, dramatic slow dolly in, studio lighting, hyper-realistic motion"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const MOTION_PROMPTS = [
    "Dramatic slow zoom with rotating studio rim light",
    "Cinematic camera flyby with subtle particle dust",
    "Hero product reveal with elegant focus pull",
    "Dynamic energetic camera pan suitable for social ads",
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target?.result as string);
      setVideoUri(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateVideo = async () => {
    if (!photo) {
      setErrorNotice("Please select or upload a photo first.");
      return;
    }
    setIsGenerating(true);
    setErrorNotice(null);
    setVideoUri(null);
    setStatusText("Initiating Veo video generation (veo-3.1-fast-generate-preview)...");

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: photo,
          prompt,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setErrorNotice(data.error);
        setIsGenerating(false);
        return;
      }

      if (data.operationName) {
        // Poll for completion
        const opName = data.operationName;
        setStatusText("Veo is rendering your cinematic video ad (typically 30-90s)...");

        const interval = setInterval(async () => {
          try {
            const pollRes = await fetch("/api/video-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ operationName: opName }),
            });
            const pollData = await pollRes.json();

            if (pollData.done) {
              clearInterval(interval);
              setIsGenerating(false);
              if (pollData.videoUri) {
                setVideoUri(pollData.videoUri);
              } else if (pollData.error) {
                setErrorNotice(pollData.error);
              }
            }
          } catch (pollErr) {
            console.error("Polling error:", pollErr);
          }
        }, 8000);
      } else {
        setErrorNotice("No operation returned from Veo API.");
        setIsGenerating(false);
      }
    } catch (err: unknown) {
      setErrorNotice("Network error initiating video generation.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Veo Video Ad Generator
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                  veo-3.1-fast-generate-preview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Animate any still product photo into a high-impact video advertisement
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorNotice && (
            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Photo & Video Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Photo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Starting Photo</span>
                <label className="cursor-pointer text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="h-52 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative">
                {photo ? (
                  <img
                    src={photo}
                    alt="Source"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-500 text-xs">
                    Please upload or select an image
                  </div>
                )}
              </div>
            </div>

            {/* Generated Veo Video */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-rose-400">Veo Video Output</span>
                {videoUri && (
                  <a
                    href={videoUri}
                    download="veo_ad_video.mp4"
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </a>
                )}
              </div>

              <div className="h-52 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative">
                {isGenerating ? (
                  <div className="text-center p-4 space-y-2 text-rose-300">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin" />
                    <p className="text-xs font-semibold">{statusText}</p>
                  </div>
                ) : videoUri ? (
                  <video
                    src={videoUri}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-500 text-xs">
                    <Film className="w-8 h-8 mx-auto mb-2 opacity-40 text-rose-400" />
                    Generated video preview will appear here
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Aspect Ratio Affordance (16:9 Landscape vs 9:16 Portrait) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
              Video Aspect Ratio (Required for Veo)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio("16:9")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  aspectRatio === "16:9"
                    ? "bg-rose-950/40 border-rose-500 text-white ring-1 ring-rose-500/50"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="font-bold text-xs">16:9 Landscape</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Standard web & YouTube landscape video ad
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio("9:16")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  aspectRatio === "9:16"
                    ? "bg-rose-950/40 border-rose-500 text-white ring-1 ring-rose-500/50"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="font-bold text-xs">9:16 Portrait</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  TikTok, Instagram Reels & YouTube Shorts format
                </div>
              </button>
            </div>
          </div>

          {/* Motion Prompt */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
              Cinematic Motion Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {MOTION_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="text-[10px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
                >
                  🎬 {p}
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

          <button
            type="button"
            onClick={handleGenerateVideo}
            disabled={isGenerating || !photo}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Rendering Video...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Video with Veo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
