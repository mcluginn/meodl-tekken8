/**
 * assets/meodl_gear.js
 * Authoritative Mechanical Gear Geometry & Assembly Engine for MEODL
 * Directly derived from MEODL Quiz Bee 2026 Engineering Architecture.
 */

(function(window) {
  'use strict';

  /** Common module (4 units) keeps tooth pitch identical across the train. */
  function gearGeometry(teeth) {
    const count = Math.max(8, Math.round(teeth));
    const pitchRadius = count * 2;
    const outerRadius = pitchRadius + 2;
    const points = Array.from({ length: count }, (_, tooth) =>
      [[-0.5, -2.5], [-0.34, -2.5], [-0.22, 2], [0.22, 2], [0.34, -2.5], [0.5, -2.5]]
        .map(([offset, height]) => {
          const angle = ((tooth + offset) * Math.PI * 2) / count;
          const radius = pitchRadius + height;
          return `${(outerRadius + radius * Math.cos(angle)).toFixed(3)},${(outerRadius + radius * Math.sin(angle)).toFixed(3)}`;
        })
        .join(' ')
    ).join(' ');
    return { count, pitchRadius, outerRadius, points };
  }

  /**
   * Generates pure SVG string for a single mechanical gear.
   * @param {number} teeth - Tooth count (e.g. 24, 16, 12)
   * @param {number|null} size - Dimension in px (optional)
   * @param {boolean} accent - If true, uses brass/gold styling
   * @param {string} className - Additional CSS classes
   */
  function createMechanicalGearSvg(teeth = 24, size = null, accent = false, className = '') {
    const { pitchRadius: r, outerRadius: c, points } = gearGeometry(teeth);
    const dim = size ?? c * 2;
    const accentClass = accent ? 'mechanical-gear mechanical-gear--brass' : 'mechanical-gear';

    const spokes = [0, 120, 240].map((angle) => `
      <path
        d="M ${c + r * 0.2} ${c} H ${c + r * 0.62}"
        transform="rotate(${angle} ${c} ${c})"
        stroke="currentColor"
        stroke-width="${r * 0.12}"
        opacity="0.6"
      />
    `).join('');

    return `
      <svg
        width="${dim}"
        height="${dim}"
        viewBox="0 0 ${c * 2} ${c * 2}"
        aria-hidden="true"
        focusable="false"
        class="${accentClass} ${className}"
      >
        <polygon points="${points}" class="mechanical-gear-body" stroke-width="0.8" stroke-linejoin="round" />
        <circle cx="${c}" cy="${c}" r="${r - 6}" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.65" />
        <circle cx="${c}" cy="${c}" r="${r * 0.64}" fill="#061b3a" stroke="currentColor" stroke-width="1" />
        ${spokes}
        <circle cx="${c}" cy="${c}" r="${r * 0.27}" class="mechanical-gear-body" stroke-width="1" />
        <circle cx="${c}" cy="${c}" r="${r * 0.12}" fill="#06162f" stroke="currentColor" stroke-width="0.7" />
        <path d="M ${c - 2} ${c - r * 0.12} v -2 h 4 v 2" fill="#06162f" stroke="currentColor" stroke-width="0.5" />
      </svg>
    `.trim();
  }

  /**
   * Gear train specs with exact pitch alignment:
   * Gear 0: (65, 66), 24 teeth, CW
   * Gear 1: (145, 66), 16 teeth, CCW, 11.25 deg phase
   * Gear 2: (145, 122), 12 teeth, CW
   */
  const GEAR_TRAIN = [
    { x: 65, y: 66, teeth: 24, direction: 1, phase: 0 },
    { x: 145, y: 66, teeth: 16, direction: -1, phase: 11.25 },
    { x: 145, y: 122, teeth: 12, direction: 1, phase: 0 },
  ];

  /**
   * Generates full HTML markup for an authentic 3-gear interlocking mechanical assembly.
   * @param {string} scale - 'small' | 'medium' | 'large'
   * @param {string} state - 'idle' | 'processing' | 'generation' | 'paused'
   * @param {string} className - Additional CSS classes
   */
  function createGearAssemblyHtml(scale = 'medium', state = 'idle', className = '') {
    const gearsHtml = GEAR_TRAIN.map((gear, i) => {
      const radius = gear.teeth * 2 + 2;
      const rotorClass = `gear-rotor-${i}`;
      const gearSvg = createMechanicalGearSvg(gear.teeth, null, i === 1);

      return `
        <div
          class="gear-position gear-position--${i}"
          style="left: ${gear.x - radius}px; top: ${gear.y - radius}px; width: ${radius * 2}px; height: ${radius * 2}px;"
        >
          <div class="${rotorClass}" data-gear-rotor style="width: 100%; height: 100%;">
            ${gearSvg}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div
        aria-hidden="true"
        data-mechanical-state="${state}"
        class="gear-assembly gear-assembly--${scale} ${className}"
      >
        <div class="gear-assembly-plane">
          <svg class="gear-construction" viewBox="0 0 195 155" focusable="false">
            <path
              d="M 5 66 H 190 M 65 6 V 125 M 145 18 V 151"
              fill="none"
              stroke="currentColor"
              stroke-width="0.5"
              stroke-dasharray="2 5"
            />
            <circle cx="65" cy="66" r="57" fill="none" stroke="currentColor" stroke-width="0.5" />
          </svg>
          ${gearsHtml}
        </div>
      </div>
    `.trim();
  }

  // Export to global window object
  window.MEODL_GEAR = {
    gearGeometry,
    createMechanicalGearSvg,
    createGearAssemblyHtml,
    GEAR_TRAIN,
    setMechanicalState: function(state) {
      document.querySelectorAll('.gear-assembly, [data-meodl-gear-assembly]').forEach((el) => {
        el.setAttribute('data-mechanical-state', state);
      });
    }
  };

  // Auto-render placeholders on DOMContentLoaded
  function initAutoGears() {
    // 1. Interlocking 3-gear train
    document.querySelectorAll('[data-meodl-gear-assembly]').forEach((el) => {
      const scale = el.getAttribute('data-scale') || 'medium';
      const state = el.getAttribute('data-state') || 'idle';
      el.innerHTML = createGearAssemblyHtml(scale, state);
    });

    // 2. Single mechanical gear watermark
    document.querySelectorAll('[data-meodl-gear-single]').forEach((el) => {
      const teeth = parseInt(el.getAttribute('data-teeth') || '24', 10);
      const size = parseInt(el.getAttribute('data-size') || '72', 10);
      const accent = el.getAttribute('data-accent') === 'true';
      const animClass = el.getAttribute('data-reverse') === 'true' ? 'animate-gear-spin-reverse' : 'animate-gear-spin-slow';
      el.innerHTML = createMechanicalGearSvg(teeth, size, accent, animClass);
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAutoGears);
    } else {
      initAutoGears();
    }
  }

})(typeof window !== 'undefined' ? window : this);
