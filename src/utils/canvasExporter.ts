import JSZip from "jszip";
import { BannerSizeConfig, BrandKit, BannerVariation } from "../types/banner.ts";

export interface RenderBannerOptions {
  size: BannerSizeConfig;
  brandKit: BrandKit;
  variation: BannerVariation;
  imageUrl?: string;
  scale?: number; // default 1 or 2 for retina
}

/**
 * Draws the banner ad onto an HTML5 Canvas with professional composition,
 * typography, gradient overlay, CTA button, and offer badges.
 */
export async function renderBannerToCanvas(
  options: RenderBannerOptions
): Promise<HTMLCanvasElement> {
  const { size, brandKit, variation, imageUrl, scale = 1 } = options;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not acquire 2D canvas context");
  }

  const w = size.width * scale;
  const h = size.height * scale;
  canvas.width = w;
  canvas.height = h;

  // Background base
  ctx.fillStyle = brandKit.backgroundColor || "#0F172A";
  ctx.fillRect(0, 0, w, h);

  // If image is available, draw image with smart aspect filling
  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl);
      drawCoverImage(ctx, img, 0, 0, w, h);
    } catch (e) {
      console.warn("Failed to draw background image, drawing fallback gradient", e);
      drawFallbackGradient(ctx, w, h, brandKit);
    }
  } else {
    drawFallbackGradient(ctx, w, h, brandKit);
  }

  // Draw dark/gradient overlay to guarantee text legibility
  drawOverlayGradients(ctx, w, h, size);

  // Layout decision based on aspect ratio & dimensions
  const isWide = w / h > 2.5; // e.g. Leaderboard 728x90, Billboard 970x250, Mobile 320x50
  const isTall = h / w > 2.5; // e.g. Skyscraper 160x600, 300x600

  const primaryColor = brandKit.primaryColor || "#3B82F6";
  const accentColor = brandKit.accentColor || "#F59E0B";
  const textColor = brandKit.textColor || "#FFFFFF";

  if (isWide) {
    renderWideBanner(ctx, w, h, brandKit, variation, scale, primaryColor, accentColor, textColor);
  } else if (isTall) {
    renderTallBanner(ctx, w, h, brandKit, variation, scale, primaryColor, accentColor, textColor);
  } else {
    renderStandardBanner(ctx, w, h, brandKit, variation, scale, primaryColor, accentColor, textColor);
  }

  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sWidth = img.width;
  let sHeight = img.height;
  let sx = 0;
  let sy = 0;

  if (imgRatio > targetRatio) {
    sWidth = img.height * targetRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / targetRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

function drawFallbackGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  brandKit: BrandKit
) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, brandKit.primaryColor || "#1E3A8A");
  grad.addColorStop(0.5, brandKit.secondaryColor || "#172554");
  grad.addColorStop(1, brandKit.backgroundColor || "#0B0F19");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Decorative subtle circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(w * 0.8, h * 0.3, Math.min(w, h) * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.fill();
  ctx.restore();
}

function drawOverlayGradients(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  size: BannerSizeConfig
) {
  const isWide = w / h > 2.5;
  const isTall = h / w > 2.5;

  ctx.save();
  if (isWide) {
    // Horizontal gradient: darker on left where text sits
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, "rgba(10, 15, 29, 0.92)");
    grad.addColorStop(0.5, "rgba(10, 15, 29, 0.75)");
    grad.addColorStop(1, "rgba(10, 15, 29, 0.35)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (isTall) {
    // Vertical gradient: darker on top and bottom
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(10, 15, 29, 0.85)");
    grad.addColorStop(0.35, "rgba(10, 15, 29, 0.4)");
    grad.addColorStop(0.7, "rgba(10, 15, 29, 0.75)");
    grad.addColorStop(1, "rgba(10, 15, 29, 0.95)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else {
    // Standard vignette / bottom heavy gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(10, 15, 29, 0.7)");
    grad.addColorStop(0.45, "rgba(10, 15, 29, 0.45)");
    grad.addColorStop(1, "rgba(10, 15, 29, 0.95)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Render horizontal banners like 728x90, 970x250, 320x50
 */
function renderWideBanner(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  brandKit: BrandKit,
  variation: BannerVariation,
  scale: number,
  primaryColor: string,
  accentColor: string,
  textColor: string
) {
  const pad = Math.max(10 * scale, Math.floor(h * 0.12));
  const isSmallMobile = h < 70 * scale;

  // 1. Brand & Badge on the left
  let currentX = pad;
  ctx.font = `bold ${Math.max(10 * scale, Math.floor(h * 0.16))}px system-ui, sans-serif`;
  ctx.fillStyle = accentColor;
  ctx.textBaseline = "middle";

  const brandText = (brandKit.brandName || "BRAND").toUpperCase();
  ctx.fillText(brandText, currentX, h * 0.32);

  // Badge pill if space permits
  if (variation.badge && !isSmallMobile) {
    const badgeText = variation.badge.toUpperCase();
    ctx.font = `600 ${Math.max(9 * scale, Math.floor(h * 0.12))}px system-ui, sans-serif`;
    const bWidth = ctx.measureText(badgeText).width + 12 * scale;
    const bHeight = 18 * scale;
    const bx = currentX + ctx.measureText(brandText).width + 10 * scale;

    ctx.fillStyle = accentColor;
    roundRect(ctx, bx, h * 0.32 - bHeight / 2, bWidth, bHeight, 4 * scale);
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.fillText(badgeText, bx + 6 * scale, h * 0.32);
  }

  // 2. Headline
  ctx.font = `bold ${Math.max(12 * scale, Math.floor(h * 0.28))}px system-ui, sans-serif`;
  ctx.fillStyle = textColor;
  const headline = variation.headline || brandKit.productTitle;
  ctx.fillText(headline, currentX, h * 0.7);

  // 3. CTA Button on Right
  const ctaText = (variation.ctaText || brandKit.ctaText || "SHOP NOW").toUpperCase();
  const ctaFontSize = Math.max(10 * scale, Math.floor(h * 0.2));
  ctx.font = `bold ${ctaFontSize}px system-ui, sans-serif`;
  const textWidth = ctx.measureText(ctaText).width;
  const btnPadX = 14 * scale;
  const btnWidth = textWidth + btnPadX * 2 + 10 * scale;
  const btnHeight = Math.max(26 * scale, Math.floor(h * 0.5));
  const btnX = w - pad - btnWidth;
  const btnY = (h - btnHeight) / 2;

  // Button background
  ctx.fillStyle = primaryColor;
  roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 6 * scale);
  ctx.fill();

  // Button text + arrow
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "middle";
  ctx.fillText(ctaText, btnX + btnPadX, btnY + btnHeight / 2);

  // Little arrow icon
  ctx.beginPath();
  const arrowX = btnX + btnPadX + textWidth + 4 * scale;
  const arrowY = btnY + btnHeight / 2;
  ctx.moveTo(arrowX, arrowY - 4 * scale);
  ctx.lineTo(arrowX + 4 * scale, arrowY);
  ctx.lineTo(arrowX, arrowY + 4 * scale);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
}

/**
 * Render tall vertical skyscraper banners like 160x600, 300x600
 */
function renderTallBanner(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  brandKit: BrandKit,
  variation: BannerVariation,
  scale: number,
  primaryColor: string,
  accentColor: string,
  textColor: string
) {
  const pad = Math.max(14 * scale, Math.floor(w * 0.08));

  // 1. Top Brand Name
  ctx.textBaseline = "top";
  ctx.font = `bold ${Math.max(12 * scale, Math.floor(w * 0.09))}px system-ui, sans-serif`;
  ctx.fillStyle = accentColor;
  ctx.fillText((brandKit.brandName || "BRAND").toUpperCase(), pad, pad);

  // 2. Offer Badge
  if (variation.badge) {
    const badgeText = variation.badge.toUpperCase();
    ctx.font = `bold ${Math.max(10 * scale, Math.floor(w * 0.075))}px system-ui, sans-serif`;
    const bWidth = ctx.measureText(badgeText).width + 12 * scale;
    const bHeight = 22 * scale;
    const by = pad + 24 * scale;

    ctx.fillStyle = accentColor;
    roundRect(ctx, pad, by, bWidth, bHeight, 4 * scale);
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.fillText(badgeText, pad + 6 * scale, by + 4 * scale);
  }

  // 3. Headline stacked
  const headline = variation.headline || brandKit.productTitle;
  const headlineSize = Math.max(15 * scale, Math.floor(w * 0.12));
  ctx.font = `800 ${headlineSize}px system-ui, sans-serif`;
  ctx.fillStyle = textColor;
  wrapText(ctx, headline, pad, h * 0.55, w - pad * 2, headlineSize * 1.25, 3);

  // 4. Subheadline / Value Prop
  const subtext = variation.subheadline || brandKit.primaryBenefit;
  const subtextSize = Math.max(10 * scale, Math.floor(w * 0.07));
  ctx.font = `400 ${subtextSize}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  wrapText(ctx, subtext, pad, h * 0.74, w - pad * 2, subtextSize * 1.3, 2);

  // 5. Bottom CTA Button
  const ctaText = (variation.ctaText || brandKit.ctaText || "SHOP NOW").toUpperCase();
  const btnHeight = Math.max(34 * scale, Math.floor(h * 0.065));
  const btnY = h - pad - btnHeight;
  const btnWidth = w - pad * 2;

  ctx.fillStyle = primaryColor;
  roundRect(ctx, pad, btnY, btnWidth, btnHeight, 6 * scale);
  ctx.fill();

  ctx.font = `bold ${Math.max(11 * scale, Math.floor(w * 0.08))}px system-ui, sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ctaText, pad + btnWidth / 2, btnY + btnHeight / 2);
  ctx.textAlign = "left"; // reset
}

/**
 * Render standard rectangular & square banners like 300x250, 1080x1080, 1200x628
 */
function renderStandardBanner(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  brandKit: BrandKit,
  variation: BannerVariation,
  scale: number,
  primaryColor: string,
  accentColor: string,
  textColor: string
) {
  const pad = Math.max(16 * scale, Math.floor(Math.min(w, h) * 0.07));

  // Top Bar: Brand & Badge
  ctx.textBaseline = "top";
  ctx.font = `bold ${Math.max(12 * scale, Math.floor(h * 0.06))}px system-ui, sans-serif`;
  ctx.fillStyle = accentColor;
  ctx.fillText((brandKit.brandName || "BRAND").toUpperCase(), pad, pad);

  // Badge
  if (variation.badge) {
    const badgeText = variation.badge.toUpperCase();
    ctx.font = `bold ${Math.max(10 * scale, Math.floor(h * 0.045))}px system-ui, sans-serif`;
    const bWidth = ctx.measureText(badgeText).width + 12 * scale;
    const bHeight = Math.max(20 * scale, Math.floor(h * 0.07));
    const bx = w - pad - bWidth;

    ctx.fillStyle = accentColor;
    roundRect(ctx, bx, pad - 2 * scale, bWidth, bHeight, 4 * scale);
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.fillText(badgeText, bx + 6 * scale, pad + (bHeight - 12 * scale) / 2);
  }

  // Headline
  const headline = variation.headline || brandKit.productTitle;
  const headlineSize = Math.max(16 * scale, Math.floor(Math.min(w, h) * 0.085));
  ctx.font = `800 ${headlineSize}px system-ui, sans-serif`;
  ctx.fillStyle = textColor;
  const headlineY = h * 0.52;
  wrapText(ctx, headline, pad, headlineY, w - pad * 2, headlineSize * 1.2, 2);

  // Subheadline
  const subtext = variation.subheadline || brandKit.primaryBenefit;
  const subtextSize = Math.max(11 * scale, Math.floor(Math.min(w, h) * 0.048));
  ctx.font = `400 ${subtextSize}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  wrapText(ctx, subtext, pad, h * 0.72, w - pad * 2, subtextSize * 1.35, 2);

  // Bottom CTA Button
  const ctaText = (variation.ctaText || brandKit.ctaText || "GET STARTED").toUpperCase();
  const ctaFontSize = Math.max(11 * scale, Math.floor(Math.min(w, h) * 0.05));
  ctx.font = `bold ${ctaFontSize}px system-ui, sans-serif`;
  const textWidth = ctx.measureText(ctaText).width;
  const btnPadX = 16 * scale;
  const btnWidth = Math.min(w - pad * 2, textWidth + btnPadX * 2 + 12 * scale);
  const btnHeight = Math.max(30 * scale, Math.floor(h * 0.13));
  const btnY = h - pad - btnHeight;

  ctx.fillStyle = primaryColor;
  roundRect(ctx, pad, btnY, btnWidth, btnHeight, 6 * scale);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "middle";
  ctx.fillText(ctaText, pad + btnPadX, btnY + btnHeight / 2);

  // Arrow
  ctx.beginPath();
  const arrowX = pad + btnPadX + textWidth + 6 * scale;
  const arrowY = btnY + btnHeight / 2;
  ctx.moveTo(arrowX, arrowY - 4 * scale);
  ctx.lineTo(arrowX + 4 * scale, arrowY);
  ctx.lineTo(arrowX, arrowY + 4 * scale);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1 && n < words.length - 1) {
        // truncate with ellipsis for last line if text is still remaining
        let remaining = "";
        for (let k = n; k < words.length; k++) {
          remaining += words[k] + " ";
        }
        let truncated = remaining.trim();
        while (ctx.measureText(truncated + "...").width > maxWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1);
        }
        ctx.fillText(truncated + "...", x, currentY);
        return;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

/**
 * Downloads a single banner as PNG
 */
export async function downloadBannerAsPng(options: RenderBannerOptions, filename?: string) {
  const canvas = await renderBannerToCanvas({ ...options, scale: 2 });
  const dataUrl = canvas.toDataURL("image/png");
  const defaultName = `adforge_${options.size.width}x${options.size.height}_${options.size.id}.png`;

  const link = document.createElement("a");
  link.download = filename || defaultName;
  link.href = dataUrl;
  link.click();
}

/**
 * Downloads all selected banners packaged as a single ZIP archive
 */
export async function downloadAllBannersAsZip(
  banners: RenderBannerOptions[],
  campaignName: string,
  onProgress?: (completed: number, total: number) => void
) {
  const zip = new JSZip();
  const folder = zip.folder(`adforge_${campaignName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_banners`) || zip;

  let completed = 0;
  for (const b of banners) {
    const canvas = await renderBannerToCanvas({ ...b, scale: 2 });
    const dataUrl = canvas.toDataURL("image/png");
    const base64Data = dataUrl.split(",")[1];
    const fileName = `${b.size.width}x${b.size.height}_${b.size.id}.png`;
    folder.file(fileName, base64Data, { base64: true });

    completed++;
    if (onProgress) {
      onProgress(completed, banners.length);
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.download = `AdForge_Banner_Campaign_${Date.now()}.zip`;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Generate standard HTML/CSS ad embed snippet for third-party publishing
 */
export function generateHtmlEmbedSnippet(options: RenderBannerOptions, imageSrc: string): string {
  const { size, brandKit, variation } = options;
  return `<!-- AdForge Standard Banner Ad (${size.width}x${size.height}) -->
<div style="position:relative;width:${size.width}px;height:${size.height}px;background-color:${brandKit.backgroundColor};overflow:hidden;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,0.15);border-radius:4px;user-select:none;">
  <img src="${imageSrc}" alt="${brandKit.productTitle}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;" />
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,0.4) 0%,rgba(15,23,42,0.95) 100%);z-index:2;"></div>
  <div style="position:relative;z-index:3;padding:12px;height:100%;display:flex;flex-direction:column;justify-content:space-between;box-sizing:border-box;">
    <div>
      <span style="font-weight:700;font-size:11px;color:${brandKit.accentColor};text-transform:uppercase;letter-spacing:0.5px;">${brandKit.brandName}</span>
      <h3 style="margin:4px 0 0;font-weight:800;font-size:15px;color:#FFFFFF;line-height:1.2;">${variation.headline}</h3>
    </div>
    <div>
      <p style="margin:0 0 8px;font-size:11px;color:rgba(255,255,255,0.8);">${variation.subheadline}</p>
      <a href="#" style="display:inline-block;background-color:${brandKit.primaryColor};color:#FFFFFF;padding:6px 14px;border-radius:4px;text-decoration:none;font-weight:700;font-size:11px;text-transform:uppercase;">${variation.ctaText} &rarr;</a>
    </div>
  </div>
</div>`;
}
