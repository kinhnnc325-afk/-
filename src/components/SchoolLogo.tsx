import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number;
  customUrl?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ 
  className = 'w-10 h-10', 
  size = 40,
  customUrl 
}) => {
  if (customUrl) {
    return (
      <img 
        src={customUrl} 
        alt="Logo THPT Chuyên Hùng Vương" 
        className={`${className} object-contain rounded-lg`} 
        style={{ width: size, height: size }}
      />
    );
  }

  // Official THPT Chuyên Hùng Vương vector emblem
  return (
    <div 
      className={`relative flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 200 240" 
        width={size} 
        height={size} 
        className="w-full h-full drop-shadow-md"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield background */}
        <path 
          d="M 25 35 Q 25 20 40 20 L 160 20 Q 175 20 175 35 L 175 145 Q 175 200 100 230 Q 25 200 25 145 Z" 
          fill="#FFE500" 
          stroke="#002B7F" 
          strokeWidth="6" 
        />
        {/* Blue right border banner */}
        <path 
          d="M 152 20 L 175 20 L 175 145 Q 175 190 125 220 L 135 210 Q 165 180 165 140 L 165 25 Z" 
          fill="#002B7F" 
        />
        <text 
          x="188" 
          y="-80" 
          transform="rotate(90)" 
          fill="#D60000" 
          fontSize="15" 
          fontWeight="900" 
          letterSpacing="2"
        >
          HÙNG VƯƠNG
        </text>
        {/* Laurel wreath */}
        <g stroke="#002B7F" strokeWidth="2.5" fill="#002B7F">
          <path d="M 36 215 Q 30 140 38 70" fill="none" strokeWidth="3" />
          <ellipse cx="33" cy="80" rx="6" ry="3.5" transform="rotate(-30 33 80)" />
          <ellipse cx="42" cy="95" rx="6" ry="3.5" transform="rotate(25 42 95)" />
          <ellipse cx="32" cy="110" rx="6.5" ry="4" transform="rotate(-30 32 110)" />
          <ellipse cx="41" cy="125" rx="6.5" ry="4" transform="rotate(25 41 125)" />
          <ellipse cx="31" cy="140" rx="7" ry="4" transform="rotate(-30 31 140)" />
          <ellipse cx="40" cy="155" rx="7" ry="4" transform="rotate(25 40 155)" />
          <ellipse cx="33" cy="170" rx="7" ry="4" transform="rotate(-30 33 170)" />
          <ellipse cx="42" cy="185" rx="7" ry="4" transform="rotate(25 42 185)" />
        </g>
        {/* Red Torch */}
        <path 
          d="M 75 90 C 45 65 50 15 85 10 C 105 7 135 15 155 10 C 140 35 160 50 150 65 C 135 55 125 60 115 50 C 110 65 95 75 75 90 Z" 
          fill="#ED1C24" 
        />
        <path d="M 68 85 L 92 85 L 87 100 L 73 100 Z" fill="#FFFFFF" stroke="#002B7F" strokeWidth="3" />
        <rect x="70" y="100" width="16" height="5" fill="#002B7F" />
        {/* Book */}
        <path 
          d="M 52 108 Q 78 116 100 112 Q 122 116 148 108 L 142 178 Q 122 184 100 178 Q 78 184 58 178 Z" 
          fill="#FFFFFF" 
          stroke="#002B7F" 
          strokeWidth="4" 
        />
        <line x1="100" y1="112" x2="100" y2="178" stroke="#002B7F" strokeWidth="2.5" />
        {/* Đền Hùng symbol */}
        <g fill="#D60000">
          <rect x="66" y="152" width="28" height="4" />
          <rect x="68" y="148" width="24" height="4" />
          <rect x="71" y="125" width="4" height="23" />
          <rect x="85" y="125" width="4" height="23" />
        </g>
        <text x="104" y="144" fill="#D60000" fontSize="14" fontWeight="900">
          T.H.P.T
        </text>
        <text x="100" y="208" textAnchor="middle" fill="#D60000" fontSize="15" fontWeight="900">
          CHUYÊN
        </text>
      </svg>
    </div>
  );
};
