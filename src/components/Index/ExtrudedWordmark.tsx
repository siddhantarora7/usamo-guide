import * as React from 'react';

/**
 * The wordmark, with a soft dimensional backdrop.
 *
 * A few copies of the text step down and to the right behind the face,
 * darkening as they go, which reads as a moulded edge rather than a drop
 * shadow. The type itself stays straight and unrotated — a turned wordmark
 * reads as skewed, and widely-spaced copies resolve into visible tiles.
 *
 * The copies are `aria-hidden`; only the front face is in the accessibility
 * tree, so the name is announced once.
 */

/* Fewer, tighter layers. Twelve widely-spaced copies resolved into visible
   tiles; this reads as one soft edge. */
const DEPTH_LAYERS = 7;

export default function ExtrudedWordmark({
  lead,
  trail,
}: {
  lead: string;
  trail: string;
}): JSX.Element {

  const layers = Array.from({ length: DEPTH_LAYERS }, (_, i) => i + 1);

  return (
    <div className="wordmark">
      <h1 className="wordmark__block">
        {/* Side wall, back to front. Painted first so the face lands on top. */}
        {layers
          .slice()
          .reverse()
          .map(i => (
            <span
              key={i}
              aria-hidden="true"
              className="wordmark__layer"
              style={
                {
                  '--layer': i,
                  // Deeper copies are darker; the ramp is non-linear so the
                  // edge reads as curving away rather than as a flat band.
                  '--layer-shade': (1 - i / DEPTH_LAYERS) ** 1.9,
                } as React.CSSProperties
              }
            >
              {lead} {trail}
            </span>
          ))}

        <span className="wordmark__face">
          <span className="wordmark__lead">{lead}</span>{' '}
          <span className="wordmark__trail-wrap">
            <span className="wordmark__trail">{trail}</span>
            {/* The site's mascot, perched on the end of the wordmark. Decorative,
                so it stays out of the accessibility tree — the name is already
                read from the face above. */}
            <img
              src="/images/Titlemascot.png"
              alt=""
              aria-hidden="true"
              className="wordmark__pet"
            />
          </span>
        </span>
      </h1>
    </div>
  );
}
