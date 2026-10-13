import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapIcon } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { useApp } from '../store/AppStore';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  kind: 'thana' | 'user' | 'alert' | 'report' | 'officer' | 'sos';
  title: string;
  /** Short permanent label drawn next to the pin (thana names in the existing app). */
  label?: string;
  color?: string;
  onClick?: () => void;
}

export interface MapCircle {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  color: string;
  opacity?: number;
  title?: string;
}

const PIN_SVG: Record<MapMarker['kind'], string> = {
  // Static SVG strings only; no user text ever goes into marker HTML.
  thana:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="#056750"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/></svg>',
  user: '',
  alert:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M12 7v6M12 17h.01"/></svg>',
  report:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg>',
  officer:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7z"/></svg>',
  sos: '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 2 2 21h20z"/></svg>',
};

function iconFor(m: MapMarker) {
  if (m.kind === 'thana') {
    return L.divIcon({ className: '', html: `<div class="thana-pin"><div>${PIN_SVG.thana}</div></div>`, iconSize: [38, 38], iconAnchor: [19, 38] });
  }
  if (m.kind === 'user') return L.divIcon({ className: '', html: '<div class="user-pin"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
  const color = m.color && /^#[0-9a-f]{3,8}$/i.test(m.color) ? m.color : '#1d4ed8';
  return L.divIcon({
    className: '',
    html: `<div class="alert-pin" style="background:${color}">${PIN_SVG[m.kind]}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function textEl(text: string) {
  const el = document.createElement('span');
  el.textContent = text;
  return el;
}

type MapProps = {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  circles?: MapCircle[];
  label: string;
  className?: string;
  height?: number | string;
  fit?: boolean;
};

/** In low-data mode (SG-043) the map waits for a tap before downloading any tiles. */
export function MapView(props: MapProps) {
  const { state } = useApp();
  const { tr } = useI18n();
  const [load, setLoad] = useState(false);
  if (state.settings.lowBandwidth && !load) {
    return (
      <div className="map-placeholder" style={{ height: props.height ?? 360 }}>
        <MapIcon size={32} aria-hidden="true" />
        <span className="small">{tr('কম ডেটা মোড: মানচিত্র লোড হয়নি', 'Low-data mode: the map is not loaded')}</span>
        <button type="button" className="btn small outline" onClick={() => setLoad(true)}>
          {tr('মানচিত্র লোড করুন', 'Load the map')}
        </button>
      </div>
    );
  }
  return <MapInner {...props} />;
}

function MapInner({
  center,
  zoom = 13,
  markers = [],
  circles = [],
  label,
  className = '',
  height = 360,
  fit = false,
}: MapProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map>();
  const layer = useRef<L.LayerGroup>();
  const [tilesFailed, setTilesFailed] = useState(false);
  const { tr } = useI18n();

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: true, attributionControl: true }).setView([center.lat, center.lng], zoom);
    let loaded = 0;
    let failed = 0;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    })
      .on('tileload', () => {
        loaded++;
        setTilesFailed(false);
      })
      .on('tileerror', () => {
        failed++;
        if (loaded === 0 && failed >= 3) setTilesFailed(true);
      })
      .addTo(m);
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    // Leaflet measures its container once; re-measure after layout settles.
    const t = window.setTimeout(() => m.invalidateSize(), 150);
    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(el.current);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      m.remove();
      map.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    map.current?.setView([center.lat, center.lng], map.current.getZoom() || zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng]);

  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    for (const c of circles) {
      const circle = L.circle([c.lat, c.lng], { radius: c.radius, color: c.color, weight: 1, fillColor: c.color, fillOpacity: c.opacity ?? 0.3 });
      if (c.title) circle.bindTooltip(textEl(c.title));
      circle.addTo(g);
    }
    for (const mk of markers) {
      const marker = L.marker([mk.lat, mk.lng], { icon: iconFor(mk), title: mk.title, alt: mk.title, keyboard: true, riseOnHover: true });
      if (mk.label) marker.bindTooltip(textEl(mk.label), { permanent: true, direction: 'right', offset: [12, -22], className: 'map-label' });
      else marker.bindTooltip(textEl(mk.title));
      if (mk.onClick) marker.on('click keypress', () => mk.onClick?.());
      marker.addTo(g);
    }
    if (fit && markers.length > 1 && map.current) {
      map.current.fitBounds(L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number])).pad(0.15), { maxZoom: 15 });
    }
  }, [markers, circles, fit]);

  return (
    <div style={{ position: 'relative', height }} className={className}>
      <div ref={el} className={`map ${className.includes('full') ? 'full' : ''}`} role="region" aria-label={label} style={{ height: '100%' }} />
      {tilesFailed && (
        <div className="map-offline" role="status">
          {tr('মানচিত্রের টাইল লোড হয়নি (অফলাইন?)। পিনগুলো ঠিক জায়গায় দেখানো হচ্ছে; তালিকা দেখতেও পারেন।', 'Map tiles could not load (offline?). Pins are still shown in place; you can also use the list.')}
        </div>
      )}
    </div>
  );
}
