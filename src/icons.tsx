import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const IconPng: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zM4.5 12.5h.5v-1h-.5a.5.5 0 0 1 0-1H5v-1h-.5A1.5 1.5 0 0 0 3 10.5v1A1.5 1.5 0 0 0 4.5 13h.5v-.5H4.5zm2.5 0v-3h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H7zm1-1h.5v-1H8v1zm2 1h1v-1h-.5v-1h.5v-1H10v3z" />
  </svg>
);

export const IconPdf: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zM3.5 9.5A1.5 1.5 0 0 0 5 11h.5v-1H5a.5.5 0 0 1 0-1h.5V8H5a1.5 1.5 0 0 0-1.5 1.5zM7 9.5v1a1 1 0 0 0 1 1h.5v-1H8v-1h.5V8.5H8a1 1 0 0 0-1 1zM10 8.5v3h.5v-1h.5v-1h-.5v-1h.5V8.5H10z" />
  </svg>
);

export const IconSvg: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zM3.5 11.5a.5.5 0 0 0 .5.5h.5v-.5H4v-1h.5V10a.5.5 0 0 0-.5-.5h-.5v.5H4v1h-.5v.5zm3.5-2a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1zm.5 2a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 1 0v1zm2-2h1v.5h-.5v.5h.5v.5h-.5v.5h.5V12H9.5v-2.5z" />
  </svg>
);

export const IconText: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z" />
  </svg>
);

export const IconImage: React.FC<IconProps> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
    <line x1="12" y1="3" x2="12" y2="8" />
    <line x1="9.5" y1="5.5" x2="12" y2="3" />
    <line x1="14.5" y1="5.5" x2="12" y2="3" />
  </svg>
);

export const IconLock: React.FC<IconProps> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
  </svg>
);

export const IconUnlock: React.FC<IconProps> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" />
  </svg>
);
