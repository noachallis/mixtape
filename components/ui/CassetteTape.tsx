interface CassetteTapeProps {
  spinning?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
}

export default function CassetteTape({
  spinning = false,
  label = "MIXTAPE",
  sublabel = "SIDE A",
  className = "",
}: CassetteTapeProps) {
  const reelStyle = (duration: string): React.CSSProperties => ({
    transformBox: "fill-box",
    transformOrigin: "center",
    animation: spinning ? `spin-slow ${duration} linear infinite` : "none",
  });

  return (
    <svg
      viewBox="0 0 320 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <rect
        x="1" y="1" width="318" height="198"
        rx="9"
        fill="#dddcea"
        stroke="#3333cc"
        strokeWidth="1.5"
      />

      {/* Corner screws */}
      {([
        [18, 18], [302, 18], [18, 182], [302, 182],
      ] as [number, number][]).map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="7" fill="#e8e7f0" stroke="#b8b8cc" strokeWidth="0.75" />
          <line x1={cx - 3.5} y1={cy} x2={cx + 3.5} y2={cy} stroke="#b8b8cc" strokeWidth="0.75" />
          <line x1={cx} y1={cy - 3.5} x2={cx} y2={cy + 3.5} stroke="#b8b8cc" strokeWidth="0.75" />
        </g>
      ))}

      {/* Window */}
      <rect x="56" y="26" width="208" height="112" rx="5" fill="#d0cfe0" />

      {/* Left reel */}
      <g transform="translate(114, 79)" style={reelStyle("3.2s")}>
        <circle r="38" fill="#c8c7d8" stroke="#b8b8cc" strokeWidth="0.75" />
        <line x1="0" y1="-38" x2="0" y2="-16" stroke="#9090a8" strokeWidth="1.5" />
        <line x1="32.9" y1="19" x2="13.9" y2="8" stroke="#9090a8" strokeWidth="1.5" />
        <line x1="-32.9" y1="19" x2="-13.9" y2="8" stroke="#9090a8" strokeWidth="1.5" />
        <circle r="16" fill="#d8d7e8" stroke="#c0bfd0" strokeWidth="0.75" />
        <circle r="5" fill="#dddcea" />
      </g>

      {/* Right reel */}
      <g transform="translate(206, 79)" style={reelStyle("4.1s")}>
        <circle r="38" fill="#c8c7d8" stroke="#b8b8cc" strokeWidth="0.75" />
        <line x1="0" y1="-38" x2="0" y2="-16" stroke="#9090a8" strokeWidth="1.5" />
        <line x1="32.9" y1="19" x2="13.9" y2="8" stroke="#9090a8" strokeWidth="1.5" />
        <line x1="-32.9" y1="19" x2="-13.9" y2="8" stroke="#9090a8" strokeWidth="1.5" />
        <circle r="16" fill="#d8d7e8" stroke="#c0bfd0" strokeWidth="0.75" />
        <circle r="5" fill="#dddcea" />
      </g>

      {/* Tape path — bottom of window */}
      <rect x="56" y="127" width="208" height="11" fill="#d0cfe0" />
      <circle cx="84" cy="132" r="5.5" fill="#c8c7d8" stroke="#b8b8cc" strokeWidth="0.75" />
      <circle cx="236" cy="132" r="5.5" fill="#c8c7d8" stroke="#b8b8cc" strokeWidth="0.75" />
      <rect x="90" y="130" width="140" height="4" rx="1" fill="#b8b8cc" />

      {/* Label */}
      <rect x="70" y="150" width="180" height="38" rx="3" fill="#3333cc" />
      <text
        x="160" y="165"
        textAnchor="middle"
        fill="#f0eff8"
        fontFamily="'Courier Prime', Courier, monospace"
        fontSize="11"
        fontWeight="700"
        letterSpacing="5"
      >
        {label.toUpperCase()}
      </text>
      <text
        x="160" y="180"
        textAnchor="middle"
        fill="#a0a0e8"
        fontFamily="'Courier Prime', Courier, monospace"
        fontSize="7"
        letterSpacing="3"
      >
        {sublabel.toUpperCase()}
      </text>

      {/* Bottom guide holes */}
      <circle cx="110" cy="194" r="4.5" fill="#d0cfe0" />
      <circle cx="160" cy="194" r="4.5" fill="#d0cfe0" />
      <circle cx="210" cy="194" r="4.5" fill="#d0cfe0" />
    </svg>
  );
}
