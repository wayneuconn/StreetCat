"use client";

import { useState, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { useTranslations } from "next-intl";

// Cat logo SVG path data (matches the home page logo)
const CAT_SVG = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M25 75 C25 45, 35 25, 50 20 C65 25, 75 45, 75 75" stroke="#d4a04a" stroke-width="3" fill="none"/>
  <path d="M30 45 L25 20 L40 35" stroke="#d4a04a" stroke-width="3" fill="none"/>
  <path d="M70 45 L75 20 L60 35" stroke="#d4a04a" stroke-width="3" fill="none"/>
  <circle cx="40" cy="48" r="3" fill="#d4a04a"/>
  <circle cx="60" cy="48" r="3" fill="#d4a04a"/>
  <path d="M46 55 Q50 58 54 55" stroke="#d4a04a" stroke-width="2" fill="none"/>
  <path d="M30 52 L18 50" stroke="#d4a04a" stroke-width="1.5"/>
  <path d="M30 55 L18 56" stroke="#d4a04a" stroke-width="1.5"/>
  <path d="M70 52 L82 50" stroke="#d4a04a" stroke-width="1.5"/>
  <path d="M70 55 L82 56" stroke="#d4a04a" stroke-width="1.5"/>
  <path d="M75 75 Q78 82, 85 80" stroke="#d4a04a" stroke-width="3" fill="none"/>
</svg>`;

function svgToImage(svg: string, size: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

export function ShareQR({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName: string;
}) {
  const t = useTranslations("share");
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(async () => {
    const url = `${window.location.origin}/menu/${eventId}`;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = 2; // retina
    const qrSize = 280 * scale;
    const padding = 40 * scale;
    const logoAreaSize = 60 * scale;
    const titleHeight = 50 * scale;
    const subtitleHeight = 30 * scale;
    const bottomPad = 20 * scale;
    const totalW = qrSize + padding * 2;
    const totalH =
      titleHeight + qrSize + subtitleHeight + bottomPad + padding * 2;

    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = "#1a1410";
    ctx.beginPath();
    const r = 16 * scale;
    ctx.moveTo(r, 0);
    ctx.lineTo(totalW - r, 0);
    ctx.quadraticCurveTo(totalW, 0, totalW, r);
    ctx.lineTo(totalW, totalH - r);
    ctx.quadraticCurveTo(totalW, totalH, totalW - r, totalH);
    ctx.lineTo(r, totalH);
    ctx.quadraticCurveTo(0, totalH, 0, totalH - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.fill();

    // Border
    ctx.strokeStyle = "#d4a04a";
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // Event name title
    ctx.fillStyle = "#d4a04a";
    ctx.font = `bold ${18 * scale}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(eventName, totalW / 2, padding + 28 * scale);

    // Generate QR to a temp canvas
    const tmpCanvas = document.createElement("canvas");
    await QRCode.toCanvas(tmpCanvas, url, {
      width: qrSize,
      margin: 1,
      color: {
        dark: "#f5e6c8",
        light: "#1a141000",
      },
      errorCorrectionLevel: "H", // high so logo doesn't break scan
    });

    // Draw QR
    const qrX = padding;
    const qrY = padding + titleHeight;
    ctx.drawImage(tmpCanvas, qrX, qrY, qrSize, qrSize);

    // Logo in center of QR
    const logoImg = await svgToImage(CAT_SVG, logoAreaSize);
    const logoBg = logoAreaSize + 10 * scale;
    const logoBgX = qrX + (qrSize - logoBg) / 2;
    const logoBgY = qrY + (qrSize - logoBg) / 2;
    ctx.fillStyle = "#1a1410";
    ctx.beginPath();
    const lr = 8 * scale;
    ctx.moveTo(logoBgX + lr, logoBgY);
    ctx.lineTo(logoBgX + logoBg - lr, logoBgY);
    ctx.quadraticCurveTo(logoBgX + logoBg, logoBgY, logoBgX + logoBg, logoBgY + lr);
    ctx.lineTo(logoBgX + logoBg, logoBgY + logoBg - lr);
    ctx.quadraticCurveTo(logoBgX + logoBg, logoBgY + logoBg, logoBgX + logoBg - lr, logoBgY + logoBg);
    ctx.lineTo(logoBgX + lr, logoBgY + logoBg);
    ctx.quadraticCurveTo(logoBgX, logoBgY + logoBg, logoBgX, logoBgY + logoBg - lr);
    ctx.lineTo(logoBgX, logoBgY + lr);
    ctx.quadraticCurveTo(logoBgX, logoBgY, logoBgX + lr, logoBgY);
    ctx.fill();

    const logoX = qrX + (qrSize - logoAreaSize) / 2;
    const logoY = qrY + (qrSize - logoAreaSize) / 2;
    ctx.drawImage(logoImg, logoX, logoY, logoAreaSize, logoAreaSize);

    // Subtitle
    ctx.fillStyle = "#f5e6c880";
    ctx.font = `${11 * scale}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(
      t("scanToJoin"),
      totalW / 2,
      qrY + qrSize + subtitleHeight
    );

    setImageUrl(canvas.toDataURL("image/png"));
    setOpen(true);
  }, [eventId, eventName, t]);

  const handleSave = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `${eventName}-invite.png`;
    a.click();
  };

  const handleShare = async () => {
    if (!imageUrl) return;
    const blob = await (await fetch(imageUrl)).blob();
    const file = new File([blob], `${eventName}-invite.png`, {
      type: "image/png",
    });
    if (navigator.share) {
      navigator.share({
        title: eventName,
        text: t("shareText"),
        files: [file],
      });
    } else {
      handleSave();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={generate}
        className="text-text-muted hover:text-accent-gold transition-colors text-sm flex items-center gap-1"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
        </svg>
        {t("share")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex flex-col items-center gap-4 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <canvas ref={canvasRef} className="hidden" />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="QR Code"
                className="w-72 rounded-xl shadow-2xl"
              />
            )}
            <div className="flex gap-3">
              <button onClick={handleSave} className="btn-primary text-sm px-5">
                {t("saveImage")}
              </button>
              <button onClick={handleShare} className="btn-primary text-sm px-5">
                {t("shareImage")}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-border-gold px-5 py-2 text-sm text-text-muted hover:text-accent-gold transition-colors"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
