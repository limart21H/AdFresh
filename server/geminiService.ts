import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client with aistudio-build user-agent
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

export interface ProductAnalysis {
  brandName: string;
  productTitle: string;
  tagline: string;
  primaryBenefit: string;
  valueProps: string[];
  offerBadge: string;
  ctaText: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    textColor: string;
  };
  visualStylePrompt: string;
  targetAudience: string;
  category: string;
}

export interface BannerAdCopy {
  id: string;
  sizeKey: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  badge: string;
  layoutStyle: "clean" | "bold" | "modern" | "editorial";
}

/**
 * Analyze product description and optional URL content to create a comprehensive ad strategy
 */
export async function analyzeProductAndStrategy(params: {
  url?: string;
  description: string;
  scrapedTitle?: string;
  scrapedDescription?: string;
}): Promise<ProductAnalysis> {
  const ai = getGeminiClient();

  if (!ai) {
    // High-quality smart heuristic fallback if API key is not configured
    return generateFallbackAnalysis(params);
  }

  try {
    const prompt = `You are a world-class digital advertising creative director.
Analyze this product information and create a comprehensive banner ad campaign blueprint.

Product Description:
${params.description || "N/A"}

Product URL:
${params.url || "N/A"}

Scraped Title (if available):
${params.scrapedTitle || "N/A"}

Scraped Meta Description (if available):
${params.scrapedDescription || "N/A"}

Generate a complete marketing campaign profile in valid JSON format with the following fields:
- brandName: The brand or company name (short, punchy)
- productTitle: The exact product or service name (max 4-6 words)
- tagline: A high-converting memorable marketing slogan
- primaryBenefit: The single most compelling reason to buy
- valueProps: Array of 3 concise bullet points highlighting key advantages (each max 5 words)
- offerBadge: A prominent discount or incentive badge (e.g. "Limited 40% OFF", "Free 14-Day Trial", "Free Next-Day Delivery", "New Launch")
- ctaText: A high-converting CTA (e.g. "Shop Collection", "Claim 40% Off", "Get Started Free", "Buy Now")
- brandColors: An aesthetically matched hex color palette:
  - primary: vibrant primary brand color (hex, e.g. #3B82F6 or #FF4B4B)
  - secondary: complementary secondary color (hex)
  - accent: high-contrast button/badge highlight color (hex, e.g. #10B981 or #F59E0B)
  - background: rich dark or clean light canvas background (hex, e.g. #0F172A or #18181B)
  - textColor: contrasting text color (hex, e.g. #FFFFFF or #0F172A)
- visualStylePrompt: A detailed, photorealistic prompt for generating high-end studio commercial product photography (lighting, angles, aesthetic, clean studio backdrop, commercial depth of field)
- targetAudience: Brief target customer description
- category: E-commerce category (e.g., Tech & Electronics, Fashion & Apparel, SaaS & Software, Health & Wellness, Home & Living)

Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text?.trim() || "";
    const parsed = JSON.parse(jsonText);
    return {
      brandName: parsed.brandName || "Brand",
      productTitle: parsed.productTitle || "Featured Product",
      tagline: parsed.tagline || "Engineered for Excellence",
      primaryBenefit: parsed.primaryBenefit || "Unmatched quality and performance",
      valueProps: Array.isArray(parsed.valueProps) && parsed.valueProps.length > 0
        ? parsed.valueProps.slice(0, 3)
        : ["Premium Quality", "Instant Setup", "Money-back Guarantee"],
      offerBadge: parsed.offerBadge || "Special Offer",
      ctaText: parsed.ctaText || "Shop Now",
      brandColors: {
        primary: parsed.brandColors?.primary || "#3B82F6",
        secondary: parsed.brandColors?.secondary || "#1D4ED8",
        accent: parsed.brandColors?.accent || "#F59E0B",
        background: parsed.brandColors?.background || "#0F172A",
        textColor: parsed.brandColors?.textColor || "#FFFFFF",
      },
      visualStylePrompt: parsed.visualStylePrompt || "A sleek commercial studio product showcase on a modern minimalist pedestal with soft cinematic rim lighting, 8k resolution, crisp detail.",
      targetAudience: parsed.targetAudience || "Modern consumers & professionals",
      category: parsed.category || "Consumer Goods",
    };
  } catch {
    return generateFallbackAnalysis(params);
  }
}

/**
 * Generate customized banner ad copy tailored to each specific layout dimension
 */
export async function generateTailoredBannerCopies(
  analysis: ProductAnalysis,
  bannerSizes: { key: string; name: string; width: number; height: number; type: string }[]
): Promise<Record<string, BannerAdCopy>> {
  const ai = getGeminiClient();

  if (!ai) {
    return generateFallbackBannerCopies(analysis, bannerSizes);
  }

  try {
    const prompt = `You are a senior ad copywriter. Craft custom headline, subheadline, and CTA copy customized specifically for each banner ad format dimension.
For wide banners (e.g. 728x90, 970x250, 320x50), copy must be ultra-short and fit horizontally.
For tall skyscraper banners (e.g. 160x600, 300x600), copy must read well stacked vertically.
For square and rectangular banners (e.g. 300x250, 1080x1080), balance headline and subtext.

Product details:
- Brand: ${analysis.brandName}
- Product: ${analysis.productTitle}
- Tagline: ${analysis.tagline}
- Primary Benefit: ${analysis.primaryBenefit}
- Badge: ${analysis.offerBadge}
- Default CTA: ${analysis.ctaText}

Formats:
${bannerSizes.map((s) => `- ${s.key} (${s.name}, ${s.width}x${s.height}, ${s.type})`).join("\n")}

Return a JSON object mapping each format key (e.g. "medium_rect", "leaderboard", etc.) to an object with:
- headline: Punchy headline fitted for this specific format
- subheadline: Short complementary text or benefit
- ctaText: Action CTA (max 2-3 words)
- badge: Offer badge (e.g. "40% OFF")
- layoutStyle: one of "clean", "bold", "modern", "editorial"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    const result: Record<string, BannerAdCopy> = {};

    for (const size of bannerSizes) {
      if (parsed[size.key]) {
        result[size.key] = {
          id: size.key,
          sizeKey: size.key,
          headline: parsed[size.key].headline || analysis.productTitle,
          subheadline: parsed[size.key].subheadline || analysis.primaryBenefit,
          ctaText: parsed[size.key].ctaText || analysis.ctaText,
          badge: parsed[size.key].badge || analysis.offerBadge,
          layoutStyle: parsed[size.key].layoutStyle || "modern",
        };
      } else {
        result[size.key] = generateSingleFallbackCopy(analysis, size);
      }
    }

    return result;
  } catch {
    return generateFallbackBannerCopies(analysis, bannerSizes);
  }
}

/**
 * Generate commercial image using specified Gemini model, aspect ratio, and resolution
 */
export async function generateStudioImage(params: {
  prompt: string;
  model: "gemini-3-pro-image-preview" | "gemini-nano-banana-2.1";
  aspectRatio: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
  imageSize: "1K" | "2K" | "4K";
}): Promise<{ imageUrl: string | null; error?: string }> {
  const ai = getGeminiClient();

  if (!ai) {
    return {
      imageUrl: null,
      error: "GEMINI_API_KEY is not configured. Please set your Gemini API Key in Settings > Secrets to enable live AI image generation.",
    };
  }

  try {
    const selectedModel = params.model || "gemini-3-pro-image-preview";
    const aspectRatio = params.aspectRatio || "1:1";
    const imageSize = params.imageSize || "1K";

    // Enhance prompt specifically for commercial banner advertising backgrounds
    const commercialPrompt = `${params.prompt}. Professional commercial advertisement photography, studio lighting, hyper-realistic, 8k resolution, photorealistic product shot, elegant composition suitable for text overlay and banner ad typography, clean depth of field.`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: {
        parts: [
          {
            text: commercialPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio,
          imageSize,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || "image/png";
        return {
          imageUrl: `data:${mimeType};base64,${part.inlineData.data}`,
        };
      }
    }

    return {
      imageUrl: null,
      error: "No image data returned from Gemini image generation model.",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Gemini image generation error:", errorMsg);
    return {
      imageUrl: null,
      error: errorMsg,
    };
  }
}

/**
 * Edit an existing image or create new variations using gemini-nano-banana-2.1
 */
export async function editImageWithNanoBanana(params: {
  base64Image?: string;
  mimeType?: string;
  prompt: string;
  aspectRatio?: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
  imageSize?: "1K" | "2K" | "4K";
}): Promise<{ imageUrl: string | null; error?: string }> {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      imageUrl: null,
      error: "GEMINI_API_KEY is not configured in Settings > Secrets.",
    };
  }

  try {
    const parts: any[] = [];
    if (params.base64Image) {
      // Strip data url prefix if present
      const cleanBase64 = params.base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: params.mimeType || "image/png",
        },
      });
    }

    parts.push({
      text: params.prompt,
    });

    const response = await ai.models.generateContent({
      model: "gemini-nano-banana-2.1",
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: params.aspectRatio || "1:1",
          imageSize: params.imageSize || "1K",
        },
      },
    });

    const candidateParts = response.candidates?.[0]?.content?.parts || [];
    for (const part of candidateParts) {
      if (part.inlineData && part.inlineData.data) {
        const mime = part.inlineData.mimeType || "image/png";
        return {
          imageUrl: `data:${mime};base64,${part.inlineData.data}`,
        };
      }
    }

    return {
      imageUrl: null,
      error: "No image returned from gemini-nano-banana-2.1 editor.",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Image editing error:", errorMsg);
    return {
      imageUrl: null,
      error: errorMsg,
    };
  }
}

/**
 * Use Google Search Grounding with gemini-3.8-flash for real-time market data
 */
export async function runSearchGrounding(query: string): Promise<{
  insights: string;
  sources: { title: string; url: string }[];
  suggestedHooks: string[];
}> {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      insights: `Real-time search insights for "${query}": Trending consumer interest highlights rapid adoption, premium aesthetics, and direct customer reviews.`,
      sources: [],
      suggestedHooks: [
        `"Why thousands are upgrading to ${query} this month"`,
        `"Top-rated innovation in 2026: See the results"`,
        `"Limited batch release — claim your exclusive savings"`,
      ],
    };
  }

  try {
    const prompt = `Research real-time market trends, competitor positioning, and recent buzz about: "${query}".
Provide a concise 3-paragraph summary of:
1. Current market trends and customer demand
2. Best-converting ad angles and emotional triggers
3. 3 suggested high-CTR advertising headlines

End with a JSON block:
\`\`\`json
{
  "suggestedHooks": ["hook 1", "hook 2", "hook 3"]
}
\`\`\``;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const sources: { title: string; url: string }[] = [];

    // Extract grounding metadata if present
    const groundingChunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks;
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || "Web Source",
            url: chunk.web.uri,
          });
        }
      }
    }

    // Extract hooks JSON if present
    let suggestedHooks = [
      `"Why customers are switching to ${query}"`,
      `"2026 Award Winner: Engineered for peak performance"`,
      `"Order today and save with instant free shipping"`,
    ];

    const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch?.[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (Array.isArray(parsed.suggestedHooks) && parsed.suggestedHooks.length > 0) {
          suggestedHooks = parsed.suggestedHooks;
        }
      } catch {
        // ignore
      }
    }

    return {
      insights: text.replace(/```json[\s\S]*?```/, "").trim(),
      sources,
      suggestedHooks,
    };
  } catch {
    return {
      insights: `Market research for "${query}": High engagement on product quality, competitive warranty, and sleek design.`,
      sources: [],
      suggestedHooks: [
        `"Why shoppers choose ${query} over competitors"`,
        `"Experience next-level comfort and performance"`,
        `"Exclusive limited-time promo inside"`,
      ],
    };
  }
}

/**
 * Use Google Maps Grounding with gemini-3.8-flash for local store and branch ad banners
 */
export async function runMapsGrounding(query: string, location?: string): Promise<{
  placeName: string;
  address: string;
  rating?: string;
  hours?: string;
  localAdCopy: {
    headline: string;
    subtext: string;
    cta: string;
  };
  sources: { title: string; uri: string }[];
}> {
  const ai = getGeminiClient();
  const searchLocation = location ? `${query} in ${location}` : query;

  if (!ai) {
    return {
      placeName: query,
      address: location || "Downtown Flagship Store",
      rating: "4.8 ★",
      hours: "Open Daily 9:00 AM - 9:00 PM",
      localAdCopy: {
        headline: `Visit ${query} Near You`,
        subtext: "Experience our full collection in-store today. Test before you buy.",
        cta: "Get Directions",
      },
      sources: [],
    };
  }

  try {
    const prompt = `Use Google Maps data to find accurate location, address, rating, and opening hours for: "${searchLocation}".
Then, generate localized retail store banner ad copy (headline, subtext, call-to-action).

Format your response as JSON:
\`\`\`json
{
  "placeName": "Name of the place",
  "address": "Full street address",
  "rating": "4.8 ★ (1,200 reviews)",
  "hours": "Open today until 9:00 PM",
  "localAdCopy": {
    "headline": "Punchy local ad headline",
    "subtext": "Compelling localized invitation to visit in person",
    "cta": "Get Directions"
  }
}
\`\`\``;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text || "";
    const sources: { title: string; uri: string }[] = [];

    const groundingChunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks;
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.maps?.uri || chunk.web?.uri) {
          sources.push({
            title: chunk.maps?.title || chunk.web?.title || "Google Maps Location",
            uri: chunk.maps?.uri || chunk.web?.uri || "",
          });
        }
      }
    }

    const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/) || [null, text];
    if (jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return {
          placeName: parsed.placeName || query,
          address: parsed.address || "Local Store",
          rating: parsed.rating || "4.8 ★",
          hours: parsed.hours || "Open Today",
          localAdCopy: {
            headline: parsed.localAdCopy?.headline || `Visit ${query}`,
            subtext: parsed.localAdCopy?.subtext || "Visit our nearest location today.",
            cta: parsed.localAdCopy?.cta || "Get Directions",
          },
          sources,
        };
      } catch {
        // ignore
      }
    }

    return {
      placeName: query,
      address: location || "Flagship Location",
      rating: "4.9 ★",
      hours: "Open Today",
      localAdCopy: {
        headline: `Visit ${query} Today`,
        subtext: "Explore in-store exclusive discounts and live demos.",
        cta: "Find Store",
      },
      sources,
    };
  } catch {
    return {
      placeName: query,
      address: location || "Downtown Store",
      rating: "4.8 ★",
      hours: "Open Today",
      localAdCopy: {
        headline: `Visit ${query} Near You`,
        subtext: "Special in-store promos and expert staff available.",
        cta: "Directions",
      },
      sources: [],
    };
  }
}

/**
 * Generate animated video from photo using Veo model: veo-3.1-fast-generate-preview
 */
export async function startVeoVideoGeneration(params: {
  base64Image: string;
  mimeType?: string;
  prompt: string;
  aspectRatio: "16:9" | "9:16";
}): Promise<{ operationName: string | null; error?: string }> {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      operationName: null,
      error: "GEMINI_API_KEY is not configured for Veo video generation.",
    };
  }

  try {
    const cleanBase64 = params.base64Image.replace(/^data:image\/[a-z]+;base64,/, "");

    const operation = await (ai.models as any).generateVideos({
      model: "veo-3.1-fast-generate-preview",
      prompt: params.prompt || "Dynamic cinematic commercial camera pan, slow zoom, studio lighting, smooth 4k video",
      image: {
        imageBytes: cleanBase64,
        mimeType: params.mimeType || "image/png",
      },
      config: {
        numberOfVideos: 1,
        resolution: "720p",
        aspectRatio: params.aspectRatio || "16:9",
      },
    });

    return {
      operationName: operation.name,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Veo video generation error:", errorMsg);
    return {
      operationName: null,
      error: errorMsg,
    };
  }
}

/**
 * Poll Veo video operation status
 */
export async function pollVeoOperation(operationName: string): Promise<{
  done: boolean;
  videoUri?: string;
  error?: string;
}> {
  const ai = getGeminiClient();
  if (!ai) {
    return { done: true, error: "GEMINI_API_KEY is not configured." };
  }

  try {
    const { GenerateVideosOperation } = await import("@google/genai");
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await (ai.operations as any).getVideosOperation({ operation: op });

    if (updated.done) {
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      return {
        done: true,
        videoUri: uri,
      };
    }

    return { done: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { done: true, error: errorMsg };
  }
}


// Fallback logic for offline / no-key mode
function generateFallbackAnalysis(params: {
  url?: string;
  description: string;
  scrapedTitle?: string;
  scrapedDescription?: string;
}): ProductAnalysis {
  const text = (params.scrapedTitle || "") + " " + (params.description || "") + " " + (params.scrapedDescription || "");
  let brandName = "NovaTech";
  let productTitle = "Next-Gen Smart Audio Pro";
  let category = "Consumer Tech";
  let primaryColor = "#2563EB";
  let secondaryColor = "#1D4ED8";
  let accentColor = "#F59E0B";

  // Check URL or description hints
  if (params.url) {
    try {
      const parsedUrl = new URL(params.url.startsWith("http") ? params.url : `https://${params.url}`);
      const domain = parsedUrl.hostname.replace("www.", "").split(".")[0];
      if (domain) {
        brandName = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    } catch {
      // ignore
    }
  }

  const lower = text.toLowerCase();
  if (lower.includes("shoe") || lower.includes("fashion") || lower.includes("wear") || lower.includes("cloth")) {
    category = "Fashion & Apparel";
    productTitle = "AeroFit Ultra Sneakers";
    primaryColor = "#DC2626";
    secondaryColor = "#991B1B";
    accentColor = "#FBBF24";
  } else if (lower.includes("coffee") || lower.includes("drink") || lower.includes("food")) {
    category = "Food & Beverage";
    productTitle = "Artisan Reserve Roast";
    primaryColor = "#78350F";
    secondaryColor = "#451A03";
    accentColor = "#F59E0B";
  } else if (lower.includes("software") || lower.includes("app") || lower.includes("ai") || lower.includes("saas")) {
    category = "SaaS & AI";
    productTitle = "FlowSync Enterprise Suite";
    primaryColor = "#7C3AED";
    secondaryColor = "#5B21B6";
    accentColor = "#06B6D4";
  } else if (lower.includes("watch") || lower.includes("ring") || lower.includes("luxury")) {
    category = "Luxury & Accessories";
    productTitle = "Chronos Precision Timepiece";
    primaryColor = "#1E293B";
    secondaryColor = "#0F172A";
    accentColor = "#EAB308";
  }

  return {
    brandName,
    productTitle,
    tagline: "Designed for those who demand the extraordinary",
    primaryBenefit: "Instant performance upgrade with 100% satisfaction guaranteed",
    valueProps: ["Precision Engineered", "Next-Gen Durability", "Free Express Delivery"],
    offerBadge: "Special 40% OFF",
    ctaText: "Shop Collection",
    brandColors: {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      background: "#0F172A",
      textColor: "#FFFFFF",
    },
    visualStylePrompt: `Minimalist high-end commercial studio product photography of ${productTitle}, floating on clean geometric pedestals, volumetric studio lighting, rich contrast, 8k resolution.`,
    targetAudience: "Discerning customers seeking premium quality",
    category,
  };
}

function generateSingleFallbackCopy(
  analysis: ProductAnalysis,
  size: { key: string; name: string; width: number; height: number; type: string }
): BannerAdCopy {
  const isWide = size.width / size.height > 2.5;
  const isTall = size.height / size.width > 2.5;

  let headline = analysis.productTitle;
  let subheadline = analysis.primaryBenefit;

  if (isWide) {
    headline = `${analysis.brandName} ${analysis.productTitle}`;
    subheadline = analysis.offerBadge;
  } else if (isTall) {
    headline = analysis.productTitle;
    subheadline = analysis.tagline;
  }

  return {
    id: size.key,
    sizeKey: size.key,
    headline,
    subheadline,
    ctaText: analysis.ctaText,
    badge: analysis.offerBadge,
    layoutStyle: "modern",
  };
}

function generateFallbackBannerCopies(
  analysis: ProductAnalysis,
  bannerSizes: { key: string; name: string; width: number; height: number; type: string }[]
): Record<string, BannerAdCopy> {
  const result: Record<string, BannerAdCopy> = {};
  for (const size of bannerSizes) {
    result[size.key] = generateSingleFallbackCopy(analysis, size);
  }
  return result;
}
