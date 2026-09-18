import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';

const StudentsByPromoChart: React.FC = () => {
  const [animate, setAnimate] = useState(false);
  const total = 1240;
  const promos = 12;
  const base = Math.floor(total / promos);
  const remainder = total % promos;
  const values = Array.from({ length: promos }).map((_, i) => base + (i < remainder ? 1 : 0));
  const max = Math.max(...values, 1);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 h-60 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-medium">Étudiants par promotion</h3>
        <BarChart2 className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex-1 flex items-center">
        <div className="w-full flex items-end gap-3 px-2 h-40">
          {values.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full h-36 flex items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[#4361ee] to-[#4cc9f0] transition-all duration-800 ease-out"
                  style={{ height: animate ? `${(v / max) * 100}%` : '2%', transitionDelay: `${i * 120}ms` }}
                  title={`${v} étudiants`}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">P{i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ActiveDonut: React.FC = () => {
  const [animate, setAnimate] = useState(false);
  const active = 900;
  const inactive = 340;
  const total = Math.max(active + inactive, 1);
  const activePct = (active / total) * 100;

  const size = 120;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (active / total) * circumference;
  const targetOffset = circumference - dash;

  useEffect(() => {
    const delay = Math.max(200, 12 * 120 + 80);
    const t = setTimeout(() => setAnimate(true), delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size}>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <circle r={radius} fill="none" stroke="#e6edf8" strokeWidth={stroke} />
          <circle
            r={radius}
            fill="none"
            stroke="#4361ee"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animate ? targetOffset : circumference}
            style={{ transition: 'stroke-dashoffset 900ms ease-out' }}
            transform={`rotate(-90)`}
          />
          <text x="0" y="4" textAnchor="middle" className="text-sm font-semibold fill-current text-gray-700" style={{ fontSize: 14 }}>
            {Math.round(activePct)}%
          </text>
        </g>
      </svg>
      <div>
        <div className="text-sm font-medium">Actifs</div>
        <div className="text-lg font-semibold text-gray-800">{active}</div>
        <div className="text-sm text-gray-500">Inactifs: {inactive}</div>
      </div>
    </div>
  );
};

const ChartsSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StudentsByPromoChart />
      <div className="bg-white rounded-lg border border-gray-100 p-4 h-60 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-medium">Actifs vs Inactifs</h3>
          <BarChart2 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <ActiveDonut />
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;