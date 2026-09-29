import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import { CountryHealthEquityProfile, EquityMetricKey } from '../types/healthEquity';
import { countryHealthEquityProfiles, metricLabels } from '../data/globalHealthEquityData';
import { ZoomIn, ZoomOut, RotateCcw, Layers, Globe2, Sparkles, ShieldCheck, Info } from 'lucide-react';

interface D3WorldMapProps {
  selectedMetric: EquityMetricKey;
  selectedCountry: CountryHealthEquityProfile | null;
  onSelectCountry: (country: CountryHealthEquityProfile) => void;
  showFlows: boolean;
}

export const D3WorldMap: React.FC<D3WorldMapProps> = ({
  selectedMetric,
  selectedCountry,
  onSelectCountry,
  showFlows,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    country: CountryHealthEquityProfile | null;
    rawFeatureName?: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    country: null,
  });

  const [dimensions, setDimensions] = useState({ width: 960, height: 480 });

  // Map country profiles by ISO-numeric id and by alpha code
  const countryProfileMap = useMemo(() => {
    const map = new Map<string, CountryHealthEquityProfile>();
    countryHealthEquityProfiles.forEach((c) => {
      map.set(c.id, c);
      // normalize 3-digit strings e.g. "356", "076"
      map.set(String(parseInt(c.id, 10)), c);
      map.set(c.isoCode, c);
    });
    return map;
  }, []);

  // Update container dimensions on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        const width = Math.max(320, clientWidth);
        const height = Math.min(600, Math.max(340, width * 0.52));
        setDimensions({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Compute metric scale domain
  const metricValues = useMemo(() => {
    return countryHealthEquityProfiles.map((c) => c[selectedMetric] as number);
  }, [selectedMetric]);

  const minMetric = useMemo(() => d3.min(metricValues) ?? 0, [metricValues]);
  const maxMetric = useMemo(() => d3.max(metricValues) ?? 100, [metricValues]);

  // Color scale
  const colorScale = useMemo(() => {
    const colors = metricLabels[selectedMetric].colorScale;
    if (selectedMetric === 'outOfPocketCostPct') {
      // For out of pocket cost, lower is better (green -> yellow -> red)
      return d3
        .scaleLinear<string>()
        .domain([minMetric, (minMetric + maxMetric) / 2, maxMetric])
        .range(colors)
        .interpolate(d3.interpolateRgb);
    }
    // For other metrics, higher is better
    return d3
      .scaleLinear<string>()
      .domain([minMetric, (minMetric + maxMetric) / 2, maxMetric])
      .range(colors)
      .interpolate(d3.interpolateRgb);
  }, [selectedMetric, minMetric, maxMetric]);

  // D3 Projection and GeoJSON Features
  const { countriesGeo, projection, pathGenerator } = useMemo(() => {
    const countries = topojson.feature(
      worldData as any,
      (worldData as any).objects.countries
    ) as any;

    const proj = d3
      .geoNaturalEarth1()
      .fitSize([dimensions.width, dimensions.height], countries);

    const path = d3.geoPath().projection(proj);

    return {
      countriesGeo: countries.features,
      projection: proj,
      pathGenerator: path,
    };
  }, [dimensions]);

  // D3 Zoom Setup
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('.map-content-group');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([
        [-100, -100],
        [dimensions.width + 100, dimensions.height + 100],
      ])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Zoom controls handlers
    (window as any).__d3ZoomIn = () => {
      svg.transition().duration(400).call(zoom.scaleBy as any, 1.4);
    };
    (window as any).__d3ZoomOut = () => {
      svg.transition().duration(400).call(zoom.scaleBy as any, 0.7);
    };
    (window as any).__d3ZoomReset = () => {
      svg.transition().duration(500).call(zoom.transform as any, d3.zoomIdentity);
    };
  }, [dimensions]);

  // Hub Center for Evidence Flow (WHO Global Centre / SALUS Hub coordinates: [70.06, 22.47] Jamnagar/India or [ -71.05, 42.36] Boston)
  const hubCoords: [number, number] = [78.96, 20.59]; // India Global Partner Hub
  const hubPoint = projection(hubCoords) || [0, 0];

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-3 shadow-2xl">
      {/* Map Floating Toolbar */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2 shadow-lg backdrop-blur-md flex flex-col gap-1.5">
          <button
            onClick={() => (window as any).__d3ZoomIn?.()}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => (window as any).__d3ZoomOut?.()}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => (window as any).__d3ZoomReset?.()}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Reset Map View"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Top Right Active Metric Badge */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 shadow-lg backdrop-blur-md text-xs font-mono flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">Active Metric:</span>
          <strong className="text-amber-300 font-bold">{metricLabels[selectedMetric].label}</strong>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-auto cursor-grab active:cursor-grabbing selection:bg-transparent"
        style={{ minHeight: '340px' }}
      >
        <defs>
          {/* Subtle Ocean Radial Glow */}
          <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#090d16" />
            <stop offset="100%" stopColor="#030712" />
          </radialGradient>

          {/* Gradients for Flow Lines */}
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
          </linearGradient>

          {/* Pulse animation for hub */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ocean Background */}
        <rect width={dimensions.width} height={dimensions.height} fill="url(#oceanGlow)" />

        {/* Map Group with D3 Zoom Transform */}
        <g className="map-content-group">
          {/* Countries Polygons */}
          <g className="countries-layer">
            {countriesGeo.map((feature: any, idx: number) => {
              const numericId = String(feature.id);
              const profile = countryProfileMap.get(numericId);
              const isSelected = selectedCountry && (selectedCountry.id === numericId || selectedCountry.isoCode === profile?.isoCode);

              let fillColor = '#1e293b'; // Default dark slate for unmapped territories
              if (profile) {
                const val = profile[selectedMetric] as number;
                fillColor = colorScale(val);
              }

              const pathString = pathGenerator(feature);
              if (!pathString) return null;

              return (
                <path
                  key={feature.id || idx}
                  d={pathString}
                  fill={fillColor}
                  fillOpacity={profile ? 0.88 : 0.4}
                  stroke={isSelected ? '#f59e0b' : '#334155'}
                  strokeWidth={isSelected ? 2.2 : 0.6}
                  className="transition-all duration-200 hover:fill-opacity-100 hover:stroke-white hover:stroke-[1.5px] cursor-pointer"
                  onClick={() => {
                    if (profile) onSelectCountry(profile);
                  }}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    const x = e.clientX - (rect?.left || 0);
                    const y = e.clientY - (rect?.top || 0);
                    setTooltip({
                      visible: true,
                      x,
                      y,
                      country: profile || null,
                      rawFeatureName: feature.properties?.name || 'Global Region',
                    });
                  }}
                  onMouseMove={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    const x = e.clientX - (rect?.left || 0);
                    const y = e.clientY - (rect?.top || 0);
                    setTooltip((prev) => ({ ...prev, x, y }));
                  }}
                  onMouseLeave={() => {
                    setTooltip((prev) => ({ ...prev, visible: false }));
                  }}
                />
              );
            })}
          </g>

          {/* Evidence Flows / Radiating Arcs (Democratization of open medical calculus) */}
          {showFlows && (
            <g className="flow-lines-layer pointer-events-none">
              {countryHealthEquityProfiles.map((c, i) => {
                if (c.id === '356') return null; // skip self
                const targetPoint = projection(c.coordinates);
                if (!targetPoint || !hubPoint) return null;

                // Create curved bezier trajectory
                const dx = targetPoint[0] - hubPoint[0];
                const dy = targetPoint[1] - hubPoint[1];
                const dr = Math.sqrt(dx * dx + dy * dy) * 1.25;
                const pathD = `M${hubPoint[0]},${hubPoint[1]}A${dr},${dr} 0 0,1 ${targetPoint[0]},${targetPoint[1]}`;

                return (
                  <g key={`flow-${i}`}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#flowGradient)"
                      strokeWidth="1.2"
                      strokeOpacity="0.45"
                      strokeDasharray="4 3"
                    />
                    <circle
                      cx={targetPoint[0]}
                      cy={targetPoint[1]}
                      r="3.5"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="1"
                      opacity="0.85"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Glowing Markers for Key Deployment Hubs */}
          <g className="hubs-layer pointer-events-none">
            {countryHealthEquityProfiles.map((c, i) => {
              const pt = projection(c.coordinates);
              if (!pt) return null;
              const isLeadHub = c.salusPramanaDeploymentStatus === 'Global Partner Hub';

              return (
                <g key={`hub-${i}`} transform={`translate(${pt[0]}, ${pt[1]})`}>
                  {isLeadHub && (
                    <circle
                      r="9"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      opacity="0.75"
                      className="animate-ping origin-center"
                    />
                  )}
                  <circle
                    r={isLeadHub ? 4.5 : 2.5}
                    fill={isLeadHub ? '#f59e0b' : '#38bdf8'}
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Floating Hover Tooltip */}
      {tooltip.visible && (
        <div
          className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 min-w-[240px] rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md text-xs transition-all"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.country ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div>
                  <h4 className="font-bold text-white text-sm">{tooltip.country.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{tooltip.country.region}</span>
                </div>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-300 font-bold border border-indigo-500/30">
                  {tooltip.country.salusPramanaDeploymentStatus}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">{metricLabels[selectedMetric].label}:</span>
                  <strong className="text-amber-300">
                    {tooltip.country[selectedMetric]} {metricLabels[selectedMetric].unit}
                  </strong>
                </div>

                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400">Traditional Reliance:</span>
                  <span className="text-teal-300">{tooltip.country.traditionalRelianceRate}% of pop</span>
                </div>

                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400">Out-of-Pocket Burden:</span>
                  <span className={tooltip.country.outOfPocketCostPct > 40 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {tooltip.country.outOfPocketCostPct}%
                  </span>
                </div>

                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400">Averted Herb-Drug Events:</span>
                  <span className="text-indigo-300">{tooltip.country.avertedInteractionsPerYear.toLocaleString()}/yr</span>
                </div>
              </div>

              <div className="pt-1.5 text-[10px] text-amber-200/90 border-t border-slate-800/80 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" /> Click to open full equity profile
              </div>
            </div>
          ) : (
            <div className="text-slate-300 font-mono text-[11px]">
              <strong>{tooltip.rawFeatureName}</strong>
              <p className="text-slate-500 text-[10px] mt-0.5">Global observatory integration pending</p>
            </div>
          )}
        </div>
      )}

      {/* Choropleth Gradient Legend Bar */}
      <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80 pt-3 px-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="h-4 w-4 text-indigo-400" />
          <span className="text-[11px] leading-tight max-w-md">
            {metricLabels[selectedMetric].description}
          </span>
        </div>

        {/* Color Ramp */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
          <span>{minMetric} {metricLabels[selectedMetric].unit}</span>
          <div
            className="h-2.5 w-32 sm:w-48 rounded-full border border-slate-700 shadow-inner"
            style={{
              background: `linear-gradient(to right, ${metricLabels[selectedMetric].colorScale[0]}, ${metricLabels[selectedMetric].colorScale[1]}, ${metricLabels[selectedMetric].colorScale[2]})`,
            }}
          />
          <span>{maxMetric} {metricLabels[selectedMetric].unit}</span>
        </div>
      </div>
    </div>
  );
};
