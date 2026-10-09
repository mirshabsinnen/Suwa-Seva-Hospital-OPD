import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

/**
 * HospitalSvgIcon
 * Elegant, professional hospital & medical SVG icon for Suwa-Seva OPD.
 * Cross-platform compatible with react-native-svg.
 */
export const HospitalSvgIcon = ({ size = 28, color = '#005A71', style }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
      {/* Hospital Building Base */}
      <Rect
        x="6"
        y="10"
        width="36"
        height="32"
        rx="6"
        fill={color}
        fillOpacity="0.12"
        stroke={color}
        strokeWidth="2.5"
      />
      {/* Building roof / cornice line */}
      <Path
        d="M4 14C4 11.7909 5.79086 10 8 10H40C42.2091 10 44 11.7909 44 14V16H4V14Z"
        fill={color}
      />
      {/* Central Medical Cross */}
      <Path
        d="M24 20V32M18 26H30"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Base door */}
      <Path
        d="M20 42V37C20 35.8954 20.8954 35 22 35H26C27.1046 35 28 35.8954 28 37V42"
        stroke={color}
        strokeWidth="2"
      />
      {/* Hospital Windows */}
      <Rect x="10" y="21" width="4" height="4" rx="1" fill={color} />
      <Rect x="10" y="29" width="4" height="4" rx="1" fill={color} />
      <Rect x="34" y="21" width="4" height="4" rx="1" fill={color} />
      <Rect x="34" y="29" width="4" height="4" rx="1" fill={color} />
      {/* Subtle heartbeat pulse indicator on roof */}
      <Path
        d="M19 6L21 8L24 4L27 9L29 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default HospitalSvgIcon;
