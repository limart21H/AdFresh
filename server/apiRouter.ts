import express, { Request, Response } from "express";
import {
  analyzeProductAndStrategy,
  generateTailoredBannerCopies,
  generateStudioImage,
  editImageWithNanoBanana,
  runSearchGrounding,
  runMapsGrounding,
  startVeoVideoGeneration,
  pollVeoOperation,
} from "./geminiService.ts";

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: "25mb" }));

// Known sample domain mock database to avoid DNS lookup errors for demo products
const SAMPLE_MOCK_SITES: Record<string, { title: string; description: string }> = {
  "aurawave-audio.com": {
    title: "AuraWave ANC Pro Wireless Headphones",
    description: "Experience silence and studio-grade acoustics with 45-hour battery life and spatial audio.",
  },
  "zenithflow.io": {
    title: "Zenith Flow Enterprise SaaS Analytics",
    description: "Real-time ecommerce analytics and automated conversion intelligence.",
  },
  "terragloworganics.com": {
    title: "TerraGlow Botanical Brightening Serum",
    description: "100% organic hyaluronic and vitamin C elixir for radiant hydration.",
  },
  "vanguardhorology.com": {
    title: "Vanguard Titan Automatic Chronograph",
    description: "Aerospace titanium Swiss movement luxury statement timepiece.",
  },
  "voltpulse.fit": {
    title: "VoltPulse Apex Carbon Running Shoes",
    description: "Nitrogen-infused foam cushioning with carbon fiber propulsion plate.",
  },
};

// Helper to scrape basic meta tags from URL without heavy dependencies
async function scrapeUrlMeta(targetUrl: string): Promise<{ title?: string; description?: string; ogImage?: string }> {
  try {
    let url = targetUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    // Check for demo/sample domains first
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
      if (SAMPLE_MOCK_SITES[host]) {
        return SAMPLE_MOCK_SITES[host];
      }
    } catch {
      // invalid URL string, return empty
      return {};
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {};
    }

    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);

    const title = ogTitleMatch?.[1] || titleMatch?.[1] || "";
    const description = ogDescMatch?.[1] || metaDescMatch?.[1] || "";
    const ogImage = ogImageMatch?.[1] || "";

    return {
      title: title.trim().slice(0, 200),
      description: description.trim().slice(0, 500),
      ogImage: ogImage.trim(),
    };
  } catch {
    // Fail silently without logging noise to stderr/stdout
    return {};
  }
}

// Endpoint: Scrape URL metadata
apiRouter.post("/scrape-url", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: "URL is required" });
      return;
    }
    const meta = await scrapeUrlMeta(url);
    res.json(meta);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

// Endpoint: Analyze product & create ad campaign blueprint
apiRouter.post("/analyze-product", async (req: Request, res: Response) => {
  try {
    const { url, description } = req.body;

    let scrapedTitle = "";
    let scrapedDescription = "";
    let scrapedImage = "";

    if (url && url.trim().length > 3) {
      const scraped = await scrapeUrlMeta(url);
      scrapedTitle = scraped.title || "";
      scrapedDescription = scraped.description || "";
      scrapedImage = scraped.ogImage || "";
    }

    const analysis = await analyzeProductAndStrategy({
      url,
      description: description || scrapedDescription || scrapedTitle,
      scrapedTitle,
      scrapedDescription,
    });

    res.json({
      analysis,
      scraped: {
        title: scrapedTitle,
        description: scrapedDescription,
        image: scrapedImage,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

// Endpoint: Generate tailored ad copy for sizes
apiRouter.post("/generate-copy", async (req: Request, res: Response) => {
  try {
    const { analysis, bannerSizes } = req.body;
    if (!analysis || !bannerSizes || !Array.isArray(bannerSizes)) {
      res.status(400).json({ error: "analysis and bannerSizes are required" });
      return;
    }

    const copies = await generateTailoredBannerCopies(analysis, bannerSizes);
    res.json({ copies });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

// Endpoint: Generate image using Gemini
apiRouter.post("/generate-image", async (req: Request, res: Response) => {
  try {
    const { prompt, model, aspectRatio, imageSize } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const result = await generateStudioImage({
      prompt,
      model: model || "gemini-3-pro-image-preview",
      aspectRatio: aspectRatio || "1:1",
      imageSize: imageSize || "1K",
    });

    res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg, imageUrl: null });
  }
});

// Endpoint: Edit existing image or create with gemini-nano-banana-2.1
apiRouter.post("/edit-image", async (req: Request, res: Response) => {
  try {
    const { base64Image, mimeType, prompt, aspectRatio, imageSize } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const result = await editImageWithNanoBanana({
      base64Image,
      mimeType,
      prompt,
      aspectRatio,
      imageSize,
    });

    res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg, imageUrl: null });
  }
});

// Endpoint: Search Grounding with gemini-3.8-flash (googleSearch)
apiRouter.post("/search-grounding", async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: "Query is required" });
      return;
    }

    const result = await runSearchGrounding(query);
    res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

// Endpoint: Maps Grounding with gemini-3.8-flash (googleMaps)
apiRouter.post("/maps-grounding", async (req: Request, res: Response) => {
  try {
    const { query, location } = req.body;
    if (!query) {
      res.status(400).json({ error: "Query or store name is required" });
      return;
    }

    const result = await runMapsGrounding(query, location);
    res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

// Endpoint: Start Veo video generation (veo-3.1-fast-generate-preview)
apiRouter.post("/generate-video", async (req: Request, res: Response) => {
  try {
    const { base64Image, mimeType, prompt, aspectRatio } = req.body;
    if (!base64Image) {
      res.status(400).json({ error: "Image is required for Veo video generation" });
      return;
    }

    const result = await startVeoVideoGeneration({
      base64Image,
      mimeType,
      prompt,
      aspectRatio: aspectRatio || "16:9",
    });

    res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg });
  }
});

// Endpoint: Poll Veo video status
apiRouter.post("/video-status", async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      res.status(400).json({ error: "operationName is required" });
      return;
    }

    const result = await pollVeoOperation(operationName);
    res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg, done: true });
  }
});

