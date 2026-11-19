import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { Check, Copy, CheckCircle2 } from 'lucide-react';

const CORE_PALETTE = [
  {
    name: 'Primary Institutional',
    token: 'primary-container / primary',
    hex: '#12305A',
    hoverHex: '#1C4478',
    textColor: '#FFFFFF',
    usage: 'Root navigation bars, primary CTAs, high-level headers, active system states.',
  },
  {
    name: 'Primary Deep Anchor',
    token: 'primary',
    hex: '#001B3E',
    textColor: '#FFFFFF',
    usage: 'Deep institutional anchor and high-contrast dark surfaces.',
  },
  {
    name: 'Secondary Saffron',
    token: 'secondary / accent',
    hex: '#F5B544',
    hoverHex: '#E5A330',
    textColor: '#172033',
    usage: 'Highlight callouts, warning indicators, and critical workflow flags.',
  },
  {
    name: 'System Success',
    token: 'success',
    hex: '#18864B',
    textColor: '#FFFFFF',
    usage: 'Published results, verified credentials, and completed recruitment cycles.',
  },
  {
    name: 'System Warning',
    token: 'warning',
    hex: '#D97706',
    textColor: '#FFFFFF',
    usage: 'Impending registration deadlines and unverified scrutiny batches.',
  },
  {
    name: 'System Error',
    token: 'error',
    hex: '#DC2626',
    textColor: '#FFFFFF',
    usage: 'Rejected files, validation errors, and critical system alerts.',
  },
  {
    name: 'System Info',
    token: 'info',
    hex: '#2563EB',
    textColor: '#FFFFFF',
    usage: 'Ongoing updates and informational administrative tooltips.',
  },
  {
    name: 'Page Canvas (Level 0)',
    token: 'canvas',
    hex: '#F4F6FA',
    textColor: '#172033',
    usage: 'Glare-free page canvas for comfortable readability during long shifts.',
  },
  {
    name: 'Surface / Card (Level 1)',
    token: 'surface-container-lowest',
    hex: '#FFFFFF',
    textColor: '#172033',
    usage: 'Clean contrast container for data tables and KPI blocks.',
  },
  {
    name: 'Structural Border',
    token: 'border-structural',
    hex: '#E4E7EC',
    textColor: '#172033',
    usage: 'Demarcates table columns, input boundaries, and card headers.',
  },
  {
    name: 'Main Body Text',
    token: 'text-main',
    hex: '#172033',
    textColor: '#FFFFFF',
    usage: 'Strict WCAG AAA contrast against white cards and tabular rows.',
  },
  {
    name: 'Muted / Secondary Text',
    token: 'text-muted',
    hex: '#667085',
    textColor: '#FFFFFF',
    usage: 'Metadata, timestamps, roll call labels, and column headers.',
  },
];

const TYPOGRAPHY_SCALE = [
  {
    token: 'headline-xl',
    size: '32px / 40px',
    weight: '700 (Bold)',
    tracking: '-0.02em',
    sample: 'Institutional Public Service Recruitment Architecture',
    className: 'text-[32px] leading-[40px] font-bold tracking-[-0.02em]',
  },
  {
    token: 'metric-display',
    size: '28px / 36px',
    weight: '700 (Bold)',
    tracking: '-0.02em',
    sample: 'Recruitment Candidates & Sanctioned Posts Matrix',
    className: 'text-[28px] leading-[36px] font-bold tracking-[-0.02em] tabular-data',
  },
  {
    token: 'headline-lg',
    size: '24px / 32px',
    weight: '600 (SemiBold)',
    tracking: '-0.01em',
    sample: 'Commission Requisition & Merit List Gazette',
    className: 'text-[24px] leading-[32px] font-semibold tracking-[-0.01em]',
  },
  {
    token: 'headline-md',
    size: '20px / 28px',
    weight: '600 (SemiBold)',
    tracking: '-0.005em',
    sample: 'Candidate Dossier Scrutiny Queue',
    className: 'text-[20px] leading-[28px] font-semibold tracking-[-0.005em]',
  },
  {
    token: 'headline-sm',
    size: '16px / 24px',
    weight: '600 (SemiBold)',
    tracking: '0em',
    sample: 'Departmental Vacancy Allocation Matrix',
    className: 'text-[16px] leading-[24px] font-semibold tracking-normal',
  },
  {
    token: 'body-md',
    size: '14px / 20px',
    weight: '400 (Regular)',
    tracking: '0em',
    sample: 'All candidate certificates are cross-verified with DigiLocker and issuing authorities.',
    className: 'text-[14px] leading-[20px] font-normal',
  },
  {
    token: 'data-mono',
    size: '13px / 18px',
    weight: '500 (Medium)',
    tracking: '0.01em',
    sample: 'ROLL: [Roll-Number] · REG: [Registration-ID] · GSR-[Gazette]',
    className: 'text-[13px] leading-[18px] font-medium tracking-[0.01em] tabular-data',
  },
  {
    token: 'label-sm',
    size: '11px / 14px',
    weight: '600 (SemiBold)',
    tracking: '0.04em',
    sample: 'ADMIT CARD / ACTIVE · STATUTORY QUOTA VERIFIED',
    className: 'text-[11px] leading-[14px] font-semibold tracking-[0.04em] uppercase',
  },
];

export const DesignSystemSpecView: React.FC = () => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [demoCheckbox, setDemoCheckbox] = useState(true);
  const [demoRadio, setDemoRadio] = useState<'online' | 'offline'>('online');

  const handleCopyHex = (hex: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hex).catch(() => {});
    }
    setCopiedToken(hex);
    setTimeout(() => setCopiedToken(null), 1800);
  };

  return (
    <div className="space-y-8 w-full min-w-0">
      {/* Brand & Style Overview Card */}
      <div className="elevation-1 rounded-[6px] p-6 w-full min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E7EC]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#12305A]">
              Enterprise Design System Specification
            </span>
            <h2 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em] text-[#172033] mt-0.5">
              GovJob Admin — Public Sector Recruitment Architecture
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#667085] tabular-data shrink-0">
            <span className="whitespace-nowrap">Typeface: Inter (tnum, cv05)</span>
            <span>·</span>
            <span className="whitespace-nowrap">Grid: 12-Col / 8px Rhythm</span>
            <span>·</span>
            <span className="whitespace-nowrap">Contrast: WCAG AAA</span>
          </div>
        </div>

        <p className="text-[14px] leading-[22px] text-[#172033] mt-4 max-w-4xl">
          Designed for civil service administrators, examination officers, and content managers,
          the GovJob Admin design system conveys institutional trust, procedural precision, and
          stability. It pairs a deep navy anchor (<code className="font-semibold text-[#12305A]">#12305A</code>)
          with functional saffron accents (<code className="font-semibold text-[#7f5700]">#F5B544</code>)
          and crisp <code className="font-semibold">1px solid #E4E7EC</code> structural borders over a
          glare-free <code className="font-semibold">#F4F6FA</code> shift canvas.
        </p>
      </div>

      {/* Color Tokens Grid */}
      <div className="elevation-1 rounded-[6px] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[18px] leading-[26px] font-semibold text-[#172033]">
              1. Institutional Color Palette & Surface Tokens
            </h3>
            <p className="text-[12px] text-[#667085]">
              Click any swatch to copy its hex value to the clipboard
            </p>
          </div>
          {copiedToken && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#ECFDF3] border border-[#A6F4C5] text-[#18864B] text-[12px] font-semibold tabular-data">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Copied {copiedToken}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CORE_PALETTE.map((swatch) => (
            <button
              key={swatch.name}
              type="button"
              onClick={() => handleCopyHex(swatch.hex)}
              className="text-left rounded-[6px] border border-[#E4E7EC] overflow-hidden bg-white hover:border-[#12305A] transition-colors group"
            >
              <div
                className="h-16 px-3.5 py-2.5 flex items-end justify-between"
                style={{ backgroundColor: swatch.hex, color: swatch.textColor }}
              >
                <span className="text-[13px] font-bold tracking-[0.01em] tabular-data">
                  {swatch.hex}
                </span>
                <Copy className="w-3.5 h-3.5 opacity-75 group-hover:opacity-100" />
              </div>
              <div className="p-3">
                <div className="text-[13px] font-semibold text-[#172033]">{swatch.name}</div>
                <div className="text-[11px] text-[#667085] font-medium tabular-data mb-1">
                  {swatch.token}
                </div>
                <p className="text-[12px] leading-[16px] text-[#667085]">{swatch.usage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Component Library Matrix: Buttons, Badges, Inputs & Elevation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buttons & Status Badges */}
        <div className="elevation-1 rounded-[6px] p-6 space-y-6">
          <div>
            <h3 className="text-[16px] leading-[24px] font-semibold text-[#172033] mb-1">
              2. Interactive Button Hierarchy (4px Radius)
            </h3>
            <p className="text-[12px] text-[#667085] mb-3">
              Procedural action buttons with deterministic hover and active states
            </p>
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-[4px] bg-[#F4F6FA] border border-[#E4E7EC]">
              <button
                type="button"
                className="px-4 py-2 rounded-[4px] bg-[#12305A] text-white text-[14px] font-semibold hover:bg-[#1C4478] active:bg-[#0D2240] transition-colors"
              >
                Primary Action (#12305A)
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-[4px] bg-white border border-[#E4E7EC] text-[#172033] text-[14px] font-semibold hover:bg-[#F4F6FA] transition-colors"
              >
                Secondary / Outline
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-[4px] bg-[#F5B544] text-[#172033] text-[14px] font-semibold hover:bg-[#E5A330] transition-colors"
              >
                Accent / Urgent (#F5B544)
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-[4px] bg-[#DC2626] text-white text-[14px] font-semibold hover:bg-[#B91C1C] transition-colors"
              >
                Destructive (#DC2626)
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-[16px] leading-[24px] font-semibold text-[#172033] mb-1">
              3. Pipeline Status Badges (4px Micro-Radius)
            </h3>
            <p className="text-[12px] text-[#667085] mb-3">
              High-contrast semantic badges paired with explicit icons and 1px borders
            </p>
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-[4px] bg-[#F4F6FA] border border-[#E4E7EC]">
              <StatusBadge status="Admit Card / Active" />
              <StatusBadge status="Pending / Scrutiny" />
              <StatusBadge status="Result Announced" />
              <StatusBadge status="Rejected / Cancelled" />
            </div>
          </div>
        </div>

        {/* Form Controls & Elevation Levels */}
        <div className="elevation-1 rounded-[6px] p-6 space-y-6">
          <div>
            <h3 className="text-[16px] leading-[24px] font-semibold text-[#172033] mb-1">
              4. Input Fields & Selection Controls (38px Height)
            </h3>
            <p className="text-[12px] text-[#667085] mb-3">
              1px solid #E4E7EC border snapping to #12305A with 2px outer focus ring
            </p>
            <div className="space-y-3 p-4 rounded-[4px] bg-[#F4F6FA] border border-[#E4E7EC]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="spec-demo-input"
                    className="block text-[12px] font-medium text-[#172033] mb-1"
                  >
                    Roll Number Lookup
                  </label>
                  <input
                    id="spec-demo-input"
                    type="text"
                    placeholder="Enter Roll Number..."
                    className="gov-input w-full px-3 text-[14px] tabular-data"
                  />
                </div>
                <div>
                  <label
                    htmlFor="spec-demo-select"
                    className="block text-[12px] font-medium text-[#172033] mb-1"
                  >
                    Examination Zone
                  </label>
                  <select id="spec-demo-select" className="gov-select w-full px-3 text-[14px]">
                    <option>Northern Region (New Delhi)</option>
                    <option>Southern Region (Chennai)</option>
                    <option>Eastern Region (Kolkata)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-[13px] font-medium text-[#172033]">
                  <input
                    type="checkbox"
                    checked={demoCheckbox}
                    onChange={() => setDemoCheckbox(!demoCheckbox)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-[2px] flex items-center justify-center transition-colors ${
                      demoCheckbox
                        ? 'bg-[#12305A] border-[1.5px] border-[#12305A] text-white'
                        : 'bg-white border-[1.5px] border-[#667085]'
                    }`}
                  >
                    {demoCheckbox && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <span>Biometric Verified (#12305A Snap)</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-[13px] font-medium text-[#172033]">
                  <input
                    type="radio"
                    name="demo-mode"
                    checked={demoRadio === 'online'}
                    onChange={() => setDemoRadio('online')}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      demoRadio === 'online'
                        ? 'border-[1.5px] border-[#12305A] bg-[#12305A]'
                        : 'border-[1.5px] border-[#667085] bg-white'
                    }`}
                  >
                    {demoRadio === 'online' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span>CBT Mode</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-[13px] font-medium text-[#172033]">
                  <input
                    type="radio"
                    name="demo-mode"
                    checked={demoRadio === 'offline'}
                    onChange={() => setDemoRadio('offline')}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      demoRadio === 'offline'
                        ? 'border-[1.5px] border-[#12305A] bg-[#12305A]'
                        : 'border-[1.5px] border-[#667085] bg-white'
                    }`}
                  >
                    {demoRadio === 'offline' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span>OMR Pen & Paper</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[16px] leading-[24px] font-semibold text-[#172033] mb-2">
              5. Structural Elevation Hierarchy
            </h3>
            <div className="grid grid-cols-3 gap-3 text-[12px]">
              <div className="p-3 rounded-[6px] bg-[#F4F6FA] border border-[#E4E7EC]">
                <div className="font-semibold text-[#172033]">Level 0 · Canvas</div>
                <div className="text-[#667085] tabular-data mt-0.5">#F4F6FA Flat</div>
              </div>
              <div className="p-3 rounded-[6px] elevation-1">
                <div className="font-semibold text-[#172033]">Level 1 · Card</div>
                <div className="text-[#667085] tabular-data mt-0.5">1px #E4E7EC</div>
              </div>
              <div className="p-3 rounded-[6px] elevation-2">
                <div className="font-semibold text-[#172033]">Level 2 · Popover</div>
                <div className="text-[#667085] tabular-data mt-0.5">Ambient Shadow</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Typography Scale Table */}
      <div className="elevation-1 rounded-[6px] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E7EC] bg-white">
          <h3 className="text-[16px] leading-[24px] font-semibold text-[#172033]">
            6. Typographic Scale & Tabular Numerals (Inter)
          </h3>
          <p className="text-[12px] text-[#667085]">
            Rendered with font-feature-settings: &apos;tnum&apos; 1, &apos;cv05&apos; 1 for strict numerical alignment
          </p>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F4F6FA] border-b border-[#E4E7EC] text-[12px] font-bold uppercase tracking-[0.02em] text-[#667085]">
                <th className="py-2.5 px-6">Token Name</th>
                <th className="py-2.5 px-6">Size / Line Height</th>
                <th className="py-2.5 px-6">Weight & Tracking</th>
                <th className="py-2.5 px-6">Rendered Specimen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {TYPOGRAPHY_SCALE.map((row) => (
                <tr key={row.token} className="bg-white">
                  <td className="py-3 px-6 text-[13px] font-semibold text-[#12305A] tabular-data whitespace-nowrap">
                    {row.token}
                  </td>
                  <td className="py-3 px-6 text-[13px] text-[#667085] tabular-data whitespace-nowrap">
                    {row.size}
                  </td>
                  <td className="py-3 px-6 text-[13px] text-[#667085] tabular-data whitespace-nowrap">
                    {row.weight} · {row.tracking}
                  </td>
                  <td className="py-3 px-6 text-[#172033]">
                    <div className={row.className}>{row.sample}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
