/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Layers,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Header } from "./components/Header.tsx";
import { ProductForm } from "./components/ProductForm.tsx";
import { AiControls } from "./components/AiControls.tsx";
import { BrandKitEditor } from "./components/BrandKitEditor.tsx";
import { BannerCard } from "./components/BannerCard.tsx";
import { BannerDetailModal } from "./components/BannerDetailModal.tsx";
import { ExportModal } from "./components/ExportModal.tsx";
import { AdRushGame } from "./game/AdRushGame.tsx";
import { ImageEditorModal } from "./components/ImageEditorModal.tsx";
import { VideoGeneratorModal } from "./components/VideoGeneratorModal.tsx";
import { GroundingStudioModal } from "./components/GroundingStudioModal.tsx";
import {
  STANDARD_BANNER_SIZES,
  SAMPLE_PRODUCTS,
} from "./constants/bannerSizes.ts";
import {
  SupportedModel,
  SupportedImageSize,
  SupportedAspectRatio,
  BannerSizeConfig,
  BrandKit,
  BannerVariation,
} from "./types/banner.ts";

export default function App() {
  // Campaign & Product Inputs
  const [productUrl, setProductUrl] = useState(SAMPLE_PRODUCTS[0].url);
  const [productDescription, setProductDescription] = useState(
    SAMPLE_PRODUCTS[0].description
  );

  // AI Controls Affordances (Mandatory Requirements)
  const [selectedModel, setSelectedModel] = useState<SupportedModel>(
    "gemini-3-pro-image-preview"
  );
  const [selectedImageSize, setSelectedImageSize] = useState<SupportedImageSize>(
    "1K"
  );
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<SupportedAspectRatio>(
    "1:1"
  );
  const [visualPrompt, setVisualPrompt] = useState(
    "A sleek pair of high-end matte black headphones resting on a minimalist concrete plinth, volumetric blue rim light, studio commercial lighting, photorealistic 8k"
  );
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | undefined>(
    undefined
  );

  // Brand Kit State
  const [brandKit, setBrandKit] = useState<BrandKit>({
    brandName: "AuraWave",
    productTitle: "ANC Pro Wireless Headphones",
    tagline: "Pure Sound. Zero Distractions.",
    primaryBenefit: "45-Hour Battery & Adaptive Spatial Sound",
    offerBadge: "Special 40% OFF",
    ctaText: "Shop Collection",
    primaryColor: "#2563EB",
    secondaryColor: "#1E3A8A",
    accentColor: "#F59E0B",
    backgroundColor: "#0F172A",
    textColor: "#FFFFFF",
  });

  // Variations tailored per banner format
  const [variations, setVariations] = useState<Record<string, BannerVariation>>({});

  // UI State
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeModalSize, setActiveModalSize] = useState<BannerSizeConfig | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // New Modals State: Game, Image Editor, Veo Video, Grounding
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isGroundingOpen, setIsGroundingOpen] = useState(false);

  // Initialize variations on mount
  useEffect(() => {
    const initialVars: Record<string, BannerVariation> = {};
    for (const size of STANDARD_BANNER_SIZES) {
      initialVars[size.id] = {
        sizeId: size.id,
        headline: brandKit.productTitle,
        subheadline: brandKit.primaryBenefit,
        ctaText: brandKit.ctaText,
        badge: brandKit.offerBadge,
      };
    }
    setVariations(initialVars);
  }, []);

  // Handle preset sample selection
  const handleSelectSample = (sample: typeof SAMPLE_PRODUCTS[0]) => {
    setProductUrl(sample.url);
    setProductDescription(sample.description);
  };

  // Generate complete banner ad campaign
  const handleGenerateCampaign = async () => {
    if (!productDescription.trim() && !productUrl.trim()) return;

    setIsGeneratingCampaign(true);
    setStatusMessage("Analyzing product features & audience...");
    setApiNotice(null);

    try {
      // 1. Analyze product with Gemini 3.8 Flash
      const analysisRes = await fetch("/api/analyze-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: productUrl,
          description: productDescription,
        }),
      });

      const analysisData = await analysisRes.json();
      const analysis = analysisData.analysis;

      if (analysis) {
        // Update brand kit
        const updatedKit: BrandKit = {
          brandName: analysis.brandName || brandKit.brandName,
          productTitle: analysis.productTitle || brandKit.productTitle,
          tagline: analysis.tagline || brandKit.tagline,
          primaryBenefit: analysis.primaryBenefit || brandKit.primaryBenefit,
          offerBadge: analysis.offerBadge || brandKit.offerBadge,
          ctaText: analysis.ctaText || brandKit.ctaText,
          primaryColor: analysis.brandColors?.primary || brandKit.primaryColor,
          secondaryColor: analysis.brandColors?.secondary || brandKit.secondaryColor,
          accentColor: analysis.brandColors?.accent || brandKit.accentColor,
          backgroundColor: analysis.brandColors?.background || brandKit.backgroundColor,
          textColor: analysis.brandColors?.textColor || brandKit.textColor,
        };
        setBrandKit(updatedKit);

        if (analysis.visualStylePrompt) {
          setVisualPrompt(analysis.visualStylePrompt);
        }

        // 2. Generate custom tailored copy for each format
        setStatusMessage("Crafting layout-specific copy for all banner formats...");
        const copyRes = await fetch("/api/generate-copy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis,
            bannerSizes: STANDARD_BANNER_SIZES.map((s) => ({
              key: s.id,
              name: s.name,
              width: s.width,
              height: s.height,
              type: s.category,
            })),
          }),
        });

        const copyData = await copyRes.json();
        if (copyData.copies) {
          setVariations(copyData.copies);
        }

        // 3. Attempt Gemini image generation with selected model, aspect ratio, and size
        setStatusMessage(
          `Generating hero visual with ${
            selectedModel === "gemini-3-pro-image-preview" ? "Gemini 3 Pro" : "Nano Banana"
          } (${selectedImageSize}, ${selectedAspectRatio})...`
        );

        const imgRes = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: analysis.visualStylePrompt || visualPrompt,
            model: selectedModel,
            aspectRatio: selectedAspectRatio,
            imageSize: selectedImageSize,
          }),
        });

        const imgData = await imgRes.json();
        if (imgData.imageUrl) {
          setGeneratedImageUrl(imgData.imageUrl);
          setApiNotice(null);
        } else if (imgData.error) {
          // If Gemini returned an error (e.g. no key or quota exceeded), notify clearly
          setApiNotice(
            imgData.error.includes("GEMINI_API_KEY")
              ? "Gemini API key is not active. Using high-resolution procedural studio graphics across all banner formats. To enable live AI photorealistic generation, configure your key in Settings > Secrets."
              : `Image generation note: ${imgData.error}. High-res procedural graphics have been rendered across all standard formats.`
          );
        }
      }
    } catch (err: unknown) {
      console.error("Campaign generation error:", err);
      setApiNotice(
        "Could not contact server API. Standard procedural banners generated successfully."
      );
    } finally {
      setIsGeneratingCampaign(false);
      setStatusMessage("");
    }
  };

  // Regenerate only the hero visual with current model, aspect ratio, and image size
  const handleRegenerateVisual = async () => {
    if (!visualPrompt.trim()) return;
    setIsGeneratingVisual(true);
    setApiNotice(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: visualPrompt,
          model: selectedModel,
          aspectRatio: selectedAspectRatio,
          imageSize: selectedImageSize,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else if (data.error) {
        setApiNotice(data.error);
      }
    } catch (err: unknown) {
      console.error("Visual generation error:", err);
      setApiNotice("Network error during image generation request.");
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  // Filter banner formats
  const categories = [
    "All",
    "IAB Standard",
    "Social Feed",
    "Social Story",
    "Large Display",
    "Mobile",
  ];

  const filteredSizes =
    selectedCategory === "All"
      ? STANDARD_BANNER_SIZES
      : STANDARD_BANNER_SIZES.filter((s) => s.category === selectedCategory);

  if (isGameOpen) {
    return (
      <AdRushGame
        onCloseGame={() => setIsGameOpen(false)}
        bannerImageUrl={generatedImageUrl}
        brandName={brandKit.brandName}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* App Header */}
      <Header
        currentModel={selectedModel}
        currentSize={selectedImageSize}
        bannerCount={STANDARD_BANNER_SIZES.length}
        onOpenExportAll={() => setIsExportModalOpen(true)}
        onOpenTemplates={() => handleSelectSample(SAMPLE_PRODUCTS[1])}
        onOpenGame={() => setIsGameOpen(true)}
        onOpenImageEditor={() => setIsImageEditorOpen(true)}
        onOpenVideoGenerator={() => setIsVideoModalOpen(true)}
        onOpenGrounding={() => setIsGroundingOpen(true)}
        isGenerating={isGeneratingCampaign || isGeneratingVisual}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 space-y-8">
        {/* API Notification Banner (if any) */}
        {apiNotice && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs shadow-md">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">System Status: </span>
              {apiNotice}
            </div>
            <button
              onClick={() => setApiNotice(null)}
              className="text-amber-400 hover:text-amber-300 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Top Control Grid: Product Input & AI Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Info & Campaign Source */}
          <div className="lg:col-span-5 space-y-6">
            <ProductForm
              url={productUrl}
              onChangeUrl={setProductUrl}
              description={productDescription}
              onChangeDescription={setProductDescription}
              onGenerateCampaign={handleGenerateCampaign}
              onSelectSample={handleSelectSample}
              isGenerating={isGeneratingCampaign}
              statusMessage={statusMessage}
            />

            {/* Brand Kit & Color Editor */}
            <BrandKitEditor
              brandKit={brandKit}
              onChangeBrandKit={setBrandKit}
              onAutoTuneColors={() => {
                setBrandKit((prev) => ({
                  ...prev,
                  primaryColor: "#2563EB",
                  secondaryColor: "#1E3A8A",
                  accentColor: "#F59E0B",
                  backgroundColor: "#0F172A",
                  textColor: "#FFFFFF",
                }));
              }}
            />
          </div>

          {/* Right Column: AI Model Affordances & Image Controls */}
          <div className="lg:col-span-7">
            <AiControls
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              selectedImageSize={selectedImageSize}
              onSelectImageSize={setSelectedImageSize}
              selectedAspectRatio={selectedAspectRatio}
              onSelectAspectRatio={setSelectedAspectRatio}
              visualPrompt={visualPrompt}
              onChangeVisualPrompt={setVisualPrompt}
              onRegenerateVisual={handleRegenerateVisual}
              isGeneratingVisual={isGeneratingVisual}
              hasCustomImage={Boolean(generatedImageUrl)}
            />
          </div>
        </div>

        {/* Banner Ads Showcase Section */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          {/* Section Header & Category Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                  Generated Standard Banner Ads ({filteredSizes.length} Formats)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact pixel proportions for Google Display Network, Meta Ads, and web embeds
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs">
              <span className="pl-2 pr-1 text-slate-500 flex items-center gap-1 text-[11px]">
                <Filter className="w-3 h-3" />
                Filter:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Banner Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSizes.map((size) => {
              const variation = variations[size.id] || {
                sizeId: size.id,
                headline: brandKit.productTitle,
                subheadline: brandKit.primaryBenefit,
                ctaText: brandKit.ctaText,
                badge: brandKit.offerBadge,
              };

              return (
                <BannerCard
                  key={size.id}
                  size={size}
                  brandKit={brandKit}
                  variation={variation}
                  imageUrl={generatedImageUrl}
                  onOpenDetailModal={(s) => setActiveModalSize(s)}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* Banner Detail & Edit Modal */}
      {activeModalSize && (
        <BannerDetailModal
          size={activeModalSize}
          brandKit={brandKit}
          variation={
            variations[activeModalSize.id] || {
              sizeId: activeModalSize.id,
              headline: brandKit.productTitle,
              subheadline: brandKit.primaryBenefit,
              ctaText: brandKit.ctaText,
              badge: brandKit.offerBadge,
            }
          }
          imageUrl={generatedImageUrl}
          onClose={() => setActiveModalSize(null)}
          onUpdateVariation={(updated) =>
            setVariations((prev) => ({ ...prev, [activeModalSize.id]: updated }))
          }
        />
      )}

      {/* Batch Export ZIP Modal */}
      {isExportModalOpen && (
        <ExportModal
          bannerSizes={STANDARD_BANNER_SIZES}
          brandKit={brandKit}
          variations={variations}
          imageUrl={generatedImageUrl}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {/* AI Image Editor Modal (gemini-nano-banana-2.1) */}
      {isImageEditorOpen && (
        <ImageEditorModal
          currentImageUrl={generatedImageUrl}
          onApplyImage={(img) => {
            setGeneratedImageUrl(img);
            setIsImageEditorOpen(false);
          }}
          onClose={() => setIsImageEditorOpen(false)}
        />
      )}

      {/* Veo Video Generator Modal (veo-3.1-fast-generate-preview) */}
      {isVideoModalOpen && (
        <VideoGeneratorModal
          currentImageUrl={generatedImageUrl}
          onClose={() => setIsVideoModalOpen(false)}
        />
      )}

      {/* Real-World Grounding Intelligence Modal (Google Search & Maps) */}
      {isGroundingOpen && (
        <GroundingStudioModal
          brandKit={brandKit}
          onApplyCopy={(updated) => {
            setBrandKit((prev) => ({ ...prev, ...updated }));
          }}
          onClose={() => setIsGroundingOpen(false)}
        />
      )}
    </div>
  );
}
