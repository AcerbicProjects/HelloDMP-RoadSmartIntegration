import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/** Renders a real, scannable QR code for the given text. */
export function QrCode({ value, label, size = 220 }: { value: string; label: string; size?: number }) {
  const [src, setSrc] = useState<string>();
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(value, { margin: 1, width: size, errorCorrectionLevel: 'M', color: { dark: '#0b1f1c', light: '#ffffff' } })
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setSrc(undefined));
    return () => {
      alive = false;
    };
  }, [value, size]);
  if (!src) return <div className="skeleton" style={{ width: '100%', aspectRatio: '1' }} aria-label={label} />;
  return <img src={src} alt={label} width={size} height={size} style={{ width: '100%', height: 'auto' }} />;
}
