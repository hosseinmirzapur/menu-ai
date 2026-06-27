"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  size?: number;
  compact?: boolean;
  url?: string;
}

export default function QRCodeDisplay({
  size = 200,
  compact = false,
  url: customUrl,
}: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [displayUrl, setDisplayUrl] = useState("");

  useEffect(() => {
    const baseUrl =
      customUrl ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    setDisplayUrl(baseUrl);

    QRCode.toDataURL(baseUrl, {
      width: size,
      margin: compact ? 1 : 2,
      color: {
        dark: "#C4A88A",
        light: "#0C0A09",
      },
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch(console.error);
  }, [size, compact]);

  if (!qrDataUrl) {
    return (
      <div
        className="bg-[#1C1917] rounded-xl animate-pulse flex items-center justify-center text-[#8B7355] text-xs"
        style={{ width: size, height: size }}
      >
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={qrDataUrl}
        alt={`QR Code for ${displayUrl}`}
        className="rounded-xl"
        width={size}
        height={size}
      />
      {!compact && (
        <p
          className="text-xs text-[#8B7355] text-center break-all font-sans"
          dir="ltr"
        >
          {displayUrl.replace(/^https?:\/\//, "")}
        </p>
      )}
    </div>
  );
}
