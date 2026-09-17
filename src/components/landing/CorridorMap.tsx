import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const VIEW_W = 1000;
const VIEW_H = 500;

function project(lat: number, lng: number) {
  return {
    x: (lng + 180) / 360 * VIEW_W,
    y: (90 - lat) / 180 * VIEW_H
  };
}

const HUB = { name: 'Nigeria', lat: 9.1, lng: 7.5 };

const origins = [
{ id: 'nyc', label: 'New York', lat: 40.7, lng: -74, delay: 0 },
{ id: 'tor', label: 'Toronto', lat: 43.7, lng: -79.4, delay: 0.7 },
{ id: 'ldn', label: 'London', lat: 51.5, lng: -0.1, delay: 0.25 },
{ id: 'ber', label: 'Berlin', lat: 52.5, lng: 13.4, delay: 1.1 },
{ id: 'dxb', label: 'Dubai', lat: 25.2, lng: 55.3, delay: 0.5 },
{ id: 'sgp', label: 'Singapore', lat: 1.3, lng: 103.8, delay: 1.4 },
{ id: 'jnb', label: 'Johannesburg', lat: -26.2, lng: 28, delay: 0.9 },
{ id: 'sao', label: 'São Paulo', lat: -23.5, lng: -46.6, delay: 1.7 }];


const hub = project(HUB.lat, HUB.lng);

function arcPath(lat: number, lng: number) {
  const from = project(lat, lng);
  const dx = hub.x - from.x;
  const dy = hub.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const midX = (from.x + hub.x) / 2;
  const midY = (from.y + hub.y) / 2;
  const lift = distance * 0.26;
  const controlX = midX + dy / distance * lift;
  const controlY = midY - dx / distance * lift;
  return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${hub.x.toFixed(
    1
  )} ${hub.y.toFixed(1)}`;
}

const meridians = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
const parallels = [-60, -30, 0, 30, 60];

export function CorridorMap() {
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        viewBox={`120 40 760 400`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full opacity-[0.85]"
        role="presentation">
        
        <g stroke="rgba(255,255,255,0.05)" strokeWidth="1">
          {meridians.map((lng) => {
            const { x } = project(0, lng);
            return <line key={`m-${lng}`} x1={x} y1={0} x2={x} y2={VIEW_H} />;
          })}
          {parallels.map((lat) => {
            const { y } = project(lat, 0);
            return <line key={`p-${lat}`} x1={0} y1={y} x2={VIEW_W} y2={y} />;
          })}
        </g>

        <g>
          {origins.map((origin, index) => {
            const d = arcPath(origin.lat, origin.lng);
            return (
              <g key={origin.id}>
                <path d={d} fill="none" stroke="rgba(242,245,244,0.10)" strokeWidth="1" />
                <motion.path
                  d={d}
                  fill="none"
                  stroke="#008751"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  initial={reduced ? { pathLength: 1, opacity: 0.35 } : { pathLength: 0, opacity: 0 }}
                  animate={reduced ? undefined : { pathLength: 1, opacity: 0.55 }}
                  transition={
                  reduced ?
                  undefined :
                  { duration: 1.1, ease: [0.23, 1, 0.32, 1], delay: 0.3 + index * 0.12 }
                  } />
                
                {!reduced &&
                <circle r="2.6" fill="#8ce3b6">
                    <animateMotion dur="4.2s" repeatCount="indefinite" begin={`${origin.delay}s`} path={d} />
                    <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.12;0.82;1"
                    dur="4.2s"
                    repeatCount="indefinite"
                    begin={`${origin.delay}s`} />
                  
                  </circle>
                }
              </g>);

          })}
        </g>

        <g>
          {origins.map((origin) => {
            const { x, y } = project(origin.lat, origin.lng);
            const flipped = x > hub.x;
            return (
              <g key={`node-${origin.id}`}>
                <circle cx={x} cy={y} r="2.4" fill="rgba(242,245,244,0.55)" />
                <circle cx={x} cy={y} r="6" fill="none" stroke="rgba(242,245,244,0.14)" />
                <text
                  x={flipped ? x + 10 : x - 10}
                  y={y + 3}
                  textAnchor={flipped ? 'start' : 'end'}
                  fill="rgba(242,245,244,0.34)"
                  fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                  letterSpacing="0.6">
                  
                  {origin.label}
                </text>
              </g>);

          })}
        </g>

        <g>
          {!reduced &&
          <motion.circle
            cx={hub.x}
            cy={hub.y}
            fill="none"
            stroke="#008751"
            strokeWidth="1.2"
            initial={{ r: 8, opacity: 0.5 }}
            animate={{ r: [8, 20], opacity: [0.5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }} />

          }
          <circle cx={hub.x} cy={hub.y} r="9" fill="rgba(22,179,100,0.18)" />
          <circle cx={hub.x} cy={hub.y} r="4" fill="#008751" />
          <text
            x={hub.x}
            y={hub.y + 24}
            textAnchor="middle"
            fill="rgba(140,227,182,0.85)"
            fontSize="11"
            fontFamily="'JetBrains Mono', monospace"
            letterSpacing="1.4">
            
            NIGERIA
          </text>
        </g>
      </svg>
    </div>);

}