type IconProps = { size?: number; color?: string; className?: string };

export function BellIcon({ size = 18, color = "#1E3A5F" }: IconProps) {
  return (
    <svg width={size * (16 / 18)} height={size} viewBox="0 0 16 18" fill="none">
      <path d="M6.65244 15.7781C6.78898 16.0145 6.98535 16.2109 7.22182 16.3474C7.45829 16.4839 7.72653 16.5558 7.99958 16.5558C8.27263 16.5558 8.54087 16.4839 8.77734 16.3474C9.01381 16.2109 9.21018 16.0145 9.34672 15.7781" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.20321 11.3649C1.10161 11.4763 1.03455 11.6148 1.01021 11.7635C0.985865 11.9123 1.00528 12.0649 1.06609 12.2029C1.12691 12.3408 1.2265 12.4581 1.35275 12.5405C1.479 12.6229 1.62647 12.6668 1.77723 12.6669H14.2219C14.3727 12.667 14.5202 12.6232 14.6465 12.541C14.7728 12.4588 14.8725 12.3416 14.9335 12.2038C14.9945 12.0659 15.0141 11.9133 14.99 11.7645C14.9658 11.6157 14.8989 11.4772 14.7975 11.3657C13.763 10.2993 12.6663 9.16607 12.6663 5.66677C12.6663 4.42906 12.1747 3.24205 11.2995 2.36686C10.4243 1.49168 9.23728 1 7.99958 1C6.76187 1 5.57486 1.49168 4.69968 2.36686C3.82449 3.24205 3.33281 4.42906 3.33281 5.66677C3.33281 9.16607 2.23535 10.2993 1.20321 11.3649Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SmartphoneIcon({ size = 24, color = "#434343" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

export function BackpackIcon({ size = 24, color = "#434343" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M8 10h8" />
      <path d="M8 18h8" />
      <path d="M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function WalletIcon({ size = 24, color = "#434343" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

export function ShirtIcon({ size = 24, color = "#434343" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </svg>
  );
}

export function GemIcon({ size = 24, color = "#434343" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 3 8 9l4 13 4-13-2.5-6" />
      <path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z" />
      <path d="M2 9h20" />
    </svg>
  );
}

export function BookIcon({ size = 24, color = "#434343" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    </svg>
  );
}

export function KeyRoundIcon({ size = 24, color = "#434343" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
      <circle cx="16.5" cy="7.5" r=".5" fill={color} />
    </svg>
  );
}
