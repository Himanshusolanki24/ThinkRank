/**
 * Shared company logo components for Placement Genome
 * Re-uses the same SVGL logos from MNCsInterview page
 */
import {
  Google,
  Microsoft,
  AmazonWebServicesLight,
  Meta,
  AppleLight,
  Netflix,
  UberLight,
} from "@ridemountainpig/svgl-react";

// Custom Flipkart Logo
const FlipkartLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 713.39 707.4" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="FK_1" gradientUnits="userSpaceOnUse" x1="356.48" y1="493.13" x2="356.48" y2="1080.9" gradientTransform="matrix(1 0 0 1 0.14 -373.55)">
        <stop offset="0" stopColor="#F7E830" />
        <stop offset="1" stopColor="#FDCB06" />
      </linearGradient>
    </defs>
    <path fill="url(#FK_1)" d="M712.87,122.59c-0.3-1-0.6-2-1-3c-236.9,0.1-473.7,0-710.5,0.1c-0.6,0.7-1,1.4-1.1,2.3c0,183.7,0,367.3-0.1,551c1.5,9.8,6.9,18.7,14.1,25.4c0.3,0.1,1,0.2,1.3,0.3c3.7,3.9,9,5.8,14,7.6c3.7-0.2,7.3,1.4,11,1h294c2.8-0.1,5.7,0.4,8.4-0.7c0.1-0.4,0.2-1.1,0.3-1.5c0.1-0.5,0.2-1.6,0.3-2.2c6.3-35.2,12.4-70.5,19.1-105.7l0.6-4.5c-27.2-0.1-54.5,0-81.7-0.1c-6.6-0.2-13.4,0-20-0.8c-11.3-0.5-22.7-0.1-34-1.2c-14,0-27.9-1.3-41.9-1.3c-11-1.1-22.1-0.7-33.2-1.2c-7.2-0.9-14.6-0.5-21.9-0.8c-11.9-1.3-24-0.4-35.9-1.7c-12.6,0.1-25.2-1-37.8-1.3" />
    <path fill="#0D69B3" d="M486.27,304.69c29.7-17.4,64.1-25.8,98.3-27.4c11.1-1,22.3-0.7,33.3,0.7c7.2,1.7,14.6,3.7,20.3,8.6c-2.9,0.2-5.7-1.1-8.6-1.5c-8.2-1.6-16.7-1-25-1.2c-24.1,0-48.4,1.9-71.7,8.5" />
  </svg>
);

// White-filtered logos for dark backgrounds
const WhiteApple = ({ className = "w-6 h-6" }: { className?: string }) => (
  <AppleLight className={`${className} text-white`} style={{ filter: 'brightness(0) invert(1)' }} />
);

const WhiteUber = ({ className = "w-6 h-6" }: { className?: string }) => (
  <UberLight className={`${className} text-white`} style={{ filter: 'brightness(0) invert(1)' }} />
);

const WhiteAWS = ({ className = "w-6 h-6" }: { className?: string }) => (
  <AmazonWebServicesLight className={`${className} text-white`} style={{ filter: 'brightness(0) invert(1)' }} />
);

// Adobe logo (simple "A" SVG)
const AdobeLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.5 3H3V21L9.5 3Z" fill="#FF0000"/>
    <path d="M14.5 3H21V21L14.5 3Z" fill="#FF0000"/>
    <path d="M12 8.5L16.5 21H13.5L12.25 17H8.5L12 8.5Z" fill="#FF0000"/>
  </svg>
);

// Goldman Sachs logo (simple "GS" text)
const GoldmanLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="4" y="17" fontFamily="serif" fontWeight="bold" fontSize="12" fill="#7399C6">GS</text>
  </svg>
);

// Map company IDs to their logo components
export const COMPANY_LOGO_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  google: Google,
  amazon: WhiteAWS,
  microsoft: Microsoft,
  meta: Meta,
  apple: WhiteApple,
  netflix: Netflix,
  uber: WhiteUber,
  flipkart: FlipkartLogo,
  adobe: AdobeLogo,
  goldman: GoldmanLogo,
};

interface CompanyLogoProps {
  companyId: string;
  className?: string;
}

export const CompanyLogo = ({ companyId, className = "w-6 h-6" }: CompanyLogoProps) => {
  const LogoComponent = COMPANY_LOGO_MAP[companyId];
  if (!LogoComponent) {
    return <span className={`${className} flex items-center justify-center font-bold text-white`}>?</span>;
  }
  return <LogoComponent className={className} />;
};
