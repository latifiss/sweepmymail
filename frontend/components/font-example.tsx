import React from 'react';

interface FontExampleProps {
  className?: string;
}

export default function FontExample({ className = '' }: FontExampleProps) {
  return (
    <div className={`font-example ${className}`}>
      <h1 className="font-gliker">Gliker Font Heading</h1>
      <p className="font-gliker">
        This paragraph uses the Gliker font via the utility class.
      </p>

      <h2 style={{ fontFamily: 'var(--font-gliker)' }}>
        Gliker Font with Inline Style
      </h2>
      <p style={{ fontFamily: 'var(--font-gliker)' }}>
        This paragraph uses the Gliker font via inline styles.
      </p>

      <div className="font-comparison">
        <p className="font-gotham">
          <strong>Gotham Font:</strong> This text uses the Gotham font family.
        </p>
        <p className="font-mono">
          <strong>Monospace Font:</strong> This text uses the monospace font family.
        </p>
      </div>
    </div>
  );
}