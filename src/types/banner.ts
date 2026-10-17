export type SupportedModel = "gemini-3-pro-image-preview" | "gemini-nano-banana-2.1";
export type SupportedImageSize = "1K" | "2K" | "4K";
export type SupportedAspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";

export interface BannerSizeConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: SupportedAspectRatio;
  category: "IAB Standard" | "Social Feed" | "Social Story" | "Large Display" | "Mobile";
  description: string;
  popular?: boolean;
}

export interface BrandKit {
  brandName: string;
  productTitle: string;
  tagline: string;
  primaryBenefit: string;
  offerBadge: string;
  ctaText: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface BannerVariation {
  sizeId: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  badge: string;
  customImageUrl?: string;
}

export interface CampaignData {
  url: string;
  description: string;
  category: string;
  targetAudience: string;
  visualPrompt: string;
  brandKit: BrandKit;
  variations: Record<string, BannerVariation>;
  generatedImageUrl?: string;
  modelUsed: SupportedModel;
  imageSize: SupportedImageSize;
  aspectRatio: SupportedAspectRatio;
}
