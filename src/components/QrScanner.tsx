import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, ScanLine } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface Detector {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
}
function getDetector(): Detector | undefined {
  const W = window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector };
  try {
    return W.BarcodeDetector ? new W.BarcodeDetector({ formats: ['qr_code'] }) : undefined;
  } catch {
    return undefined;
  }
}

/** Scans QR codes with the camera where the browser supports BarcodeDetector. Otherwise (and always,
 * as a demo aid) tapping the frame "scans" a sample code supplied by the caller. */
export function QrScanner({ onResult, onSample, sampleLabel }: { onResult: (text: string) => void; onSample: () => void; sampleLabel: string }) {
  const { tr } = useI18n();
  const video = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const stream = useRef<MediaStream>();
  const supported = typeof window !== 'undefined' && !!getDetector() && !!navigator.mediaDevices?.getUserMedia;

  const stop = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = undefined;
    setActive(false);
  };
  useEffect(() => stop, []);

  const start = async () => {
    setError('');
    const detector = getDetector();
    if (!detector) return;
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (video.current) {
        video.current.srcObject = stream.current;
        await video.current.play();
      }
      setActive(true);
      const loop = async () => {
        if (!stream.current || !video.current) return;
        try {
          const codes = await detector.detect(video.current);
          if (codes[0]?.rawValue) {
            stop();
            onResult(codes[0].rawValue);
            return;
          }
        } catch {
          // Frames can fail to decode while the camera warms up; keep trying.
        }
        window.setTimeout(loop, 300);
      };
      void loop();
    } catch {
      setError(tr('ক্যামেরা চালু করা যায়নি (অনুমতি নেই?)। নমুনা বা নম্বর দিয়ে চেষ্টা করুন।', 'The camera could not start (no permission?). Use the sample or type the number.'));
      stop();
    }
  };

  return (
    <div className="stack">
      <div className="scan-frame" style={{ padding: 0, overflow: 'hidden', display: active ? 'grid' : 'none' }}>
        <video ref={video} muted playsInline style={{ width: '100%', maxHeight: 360, objectFit: 'cover' }} aria-label={tr('ক্যামেরার দৃশ্য', 'Camera view')} />
      </div>
      {!active && (
        <button type="button" className="scan-frame" onClick={onSample} aria-label={sampleLabel}>
          <span className="corners">
            <ScanLine size={64} color="#fac900" aria-hidden="true" />
          </span>
          <span className="small" style={{ marginTop: 12 }}>
            {sampleLabel}
          </span>
        </button>
      )}
      {supported ? (
        <button type="button" className="btn outline" onClick={() => (active ? stop() : void start())}>
          {active ? <CameraOff size={18} aria-hidden="true" /> : <Camera size={18} aria-hidden="true" />}
          {active ? tr('ক্যামেরা বন্ধ', 'Stop camera') : tr('ক্যামেরা দিয়ে আসল QR স্ক্যান', 'Scan a real QR with the camera')}
        </button>
      ) : (
        <p className="tiny muted">{tr('এই ব্রাউজারে ক্যামেরা দিয়ে QR পড়ার সুবিধা (BarcodeDetector) নেই; নমুনা বা নম্বর ব্যবহার করুন।', 'This browser cannot read QR codes from the camera (no BarcodeDetector); use the sample or type the number.')}</p>
      )}
      {error && (
        <p className="danger-text small" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
