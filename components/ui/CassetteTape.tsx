interface CassetteTapeProps {
  spinning?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
}

export default function CassetteTape({
  spinning = false,
  label = "mixtape",
  sublabel = "SIDE A",
  className = "",
}: CassetteTapeProps) {
  const reelStyle = (duration: string): React.CSSProperties => ({
    transformBox: "fill-box",
    transformOrigin: "center",
    animation: spinning ? `spin-slow ${duration} linear infinite` : "none",
  });

  const isSideB = sublabel.includes("B");

  return (
    <svg
      viewBox="0 0 320 205"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Body ── */}
      <rect
        x="2" y="2" width="316" height="201" rx="13"
        fill="#3333cc" stroke="#1a1935" strokeWidth="2.5"
      />

      {/* ── Corner screw marks ── */}
      {([
        [20, 20], [300, 20], [20, 185], [300, 185],
      ] as [number, number][]).map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="8.5" fill="#2828bb" stroke="#1a1935" strokeWidth="1.5" />
          <line x1={cx - 4.5} y1={cy - 4.5} x2={cx + 4.5} y2={cy + 4.5} stroke="#1a1935" strokeWidth="1.5" />
          <line x1={cx + 4.5} y1={cy - 4.5} x2={cx - 4.5} y2={cy + 4.5} stroke="#1a1935" strokeWidth="1.5" />
        </g>
      ))}

      {/* ── Main label ── */}
      <rect
        x="20" y="13" width="280" height="128" rx="18"
        fill="#f0eff8" stroke="#1a1935" strokeWidth="2.5"
      />

      {/* ── Label text ── */}
      <text
        x="148" y="52"
        textAnchor="middle"
        fill="#1a1935"
        fontFamily="Caveat, cursive"
        fontSize="30"
        fontWeight="600"
      >
        {label.toLowerCase()}
      </text>

      {/* ── Heart ── */}
      <path
        d="M 276 32 C 276 28 271 24 266 28 C 261 24 256 28 256 32 C 256 38 266 46 266 46 C 266 46 276 38 276 32 Z"
        fill="#3333cc"
      />

      {/* ── Reel housing oval ── */}
      <rect
        x="40" y="72" width="240" height="62" rx="31"
        fill="#e0dff0" stroke="#1a1935" strokeWidth="2"
      />

      {/* ── Tape window ── */}
      <rect
        x="118" y="88" width="84" height="28" rx="3"
        fill="#1a1935"
      />
      {/* tape sheen */}
      <rect
        x="124" y="92" width="30" height="8" rx="2"
        fill="#f0eff8" opacity="0.25"
      />

      {/* ── Left reel ── */}
      <g transform="translate(93, 103)" style={reelStyle("3.2s")}>
        <circle r="26" fill="#ffffff" stroke="#1a1935" strokeWidth="2" />
        {/* 6 spokes */}
        <line x1="0"     y1="-26"  x2="0"     y2="-9"  stroke="#1a1935" strokeWidth="1.5" />
        <line x1="22.5"  y1="-13"  x2="7.8"   y2="-4.5" stroke="#1a1935" strokeWidth="1.5" />
        <line x1="22.5"  y1="13"   x2="7.8"   y2="4.5"  stroke="#1a1935" strokeWidth="1.5" />
        <line x1="0"     y1="26"   x2="0"     y2="9"   stroke="#1a1935" strokeWidth="1.5" />
        <line x1="-22.5" y1="13"   x2="-7.8"  y2="4.5"  stroke="#1a1935" strokeWidth="1.5" />
        <line x1="-22.5" y1="-13"  x2="-7.8"  y2="-4.5" stroke="#1a1935" strokeWidth="1.5" />
        {/* Hub */}
        <circle r="9" fill="#1a1935" />
        <circle r="3.5" fill="#ffffff" />
      </g>

      {/* ── Right reel ── */}
      <g transform="translate(227, 103)" style={reelStyle("4.1s")}>
        <circle r="26" fill="#ffffff" stroke="#1a1935" strokeWidth="2" />
        <line x1="0"     y1="-26"  x2="0"     y2="-9"  stroke="#1a1935" strokeWidth="1.5" />
        <line x1="22.5"  y1="-13"  x2="7.8"   y2="-4.5" stroke="#1a1935" strokeWidth="1.5" />
        <line x1="22.5"  y1="13"   x2="7.8"   y2="4.5"  stroke="#1a1935" strokeWidth="1.5" />
        <line x1="0"     y1="26"   x2="0"     y2="9"   stroke="#1a1935" strokeWidth="1.5" />
        <line x1="-22.5" y1="13"   x2="-7.8"  y2="4.5"  stroke="#1a1935" strokeWidth="1.5" />
        <line x1="-22.5" y1="-13"  x2="-7.8"  y2="-4.5" stroke="#1a1935" strokeWidth="1.5" />
        <circle r="9" fill="#1a1935" />
        <circle r="3.5" fill="#ffffff" />
      </g>

      {/* ── Bottom section ── */}

      {/* Side A / B label */}
      <rect
        x="26" y="151" width="30" height="20" rx="4"
        fill="#f0eff8" stroke="#1a1935" strokeWidth="1.5"
      />
      <text
        x="41" y="165"
        textAnchor="middle"
        fill="#1a1935"
        fontFamily="'Courier Prime', Courier, monospace"
        fontSize="11"
        fontWeight="700"
      >
        {isSideB ? "B" : "A"}
      </text>

      {/* Guide slots (3 oval holes) */}
      <ellipse cx="112" cy="165" rx="17" ry="10" fill="#2828bb" stroke="#1a1935" strokeWidth="1.5" />
      <ellipse cx="160" cy="165" rx="17" ry="10" fill="#2828bb" stroke="#1a1935" strokeWidth="1.5" />
      <ellipse cx="208" cy="165" rx="17" ry="10" fill="#2828bb" stroke="#1a1935" strokeWidth="1.5" />

      {/* Connector pin holes */}
      <circle cx="112" cy="191" r="5.5" fill="#1a1935" />
      <circle cx="160" cy="191" r="5.5" fill="#1a1935" />
      <circle cx="208" cy="191" r="5.5" fill="#1a1935" />
    </svg>
  );
}
