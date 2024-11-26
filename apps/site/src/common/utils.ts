import { YUSer } from './types';

export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

export function getRandomColor(usedColors: string[]) {
  const COLORS = [
    // Blues (sophisticated and calming)
    '#4f46e5', // Indigo blue
    '#3b82f6', // Royal blue
    '#0ea5e9', // Sky blue

    // Teals and Cyans (fresh and professional)
    '#0891b2', // Teal
    '#0d9488', // Dark teal
    '#0369a1', // Ocean blue

    // Purples (rich but soft)
    '#8b5cf6', // Soft purple
    '#6d28d9', // Medium purple
    '#7c3aed', // Bright purple

    // Reds and Pinks (warm but not aggressive)
    '#e11d48', // Rose
    '#be185d', // Ruby
    '#db2777', // Pink

    // Greens (natural and balanced)
    '#059669', // Emerald
    '#16a34a', // Forest
    '#15803d', // Deep green
  ];

  let freeColors = COLORS.filter((color) => !usedColors.includes(color));
  if (freeColors.length === 0) freeColors = COLORS;
  const randomColorIndex = Math.floor(Math.random() * freeColors.length);
  return freeColors[randomColorIndex];
}

function alphaHexColor(color: string, alpha: number): string {
  // Remove # if present and convert to uppercase
  const cleanColor = color.replace('#', '').toUpperCase();

  // Validate alpha value between 0 and 1
  const validAlpha = Math.max(0, Math.min(1, alpha));

  // Convert alpha to hex
  const alphaHex = Math.round(validAlpha * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

  // Handle both 3-digit and 6-digit hex
  let fullHex: string;
  if (cleanColor.length === 3) {
    // Convert 3-digit to 6-digit (#RGB -> #RRGGBB)
    fullHex = cleanColor
      .split('')
      .map((char) => char + char)
      .join('');
  } else if (cleanColor.length === 6) {
    fullHex = cleanColor;
  } else {
    throw new Error(
      'Invalid hex color format. Use 3 or 6 digits (e.g., #RGB or #RRGGBB)'
    );
  }

  return `#${fullHex}${alphaHex}`;
}

export function darkenHexColor(hex: string, amount: number): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Darken each component
  const darkenComponent = (component: number) => {
    // Ensure amount is between 0 and 1
    const factor = Math.min(Math.max(amount, 0), 1);
    // Darken by reducing the value
    return Math.round(component * (1 - factor));
  };

  // Convert darkened components back to hex
  const darkR = darkenComponent(r).toString(16).padStart(2, '0');
  const darkG = darkenComponent(g).toString(16).padStart(2, '0');
  const darkB = darkenComponent(b).toString(16).padStart(2, '0');

  return `#${darkR}${darkG}${darkB}`;
}

export function css(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  return strings
    .reduce((result, str, i) => result + str + (values[i] || ''), '')
    .trim();
}

export function getYMonacoCSS(user: YUSer) {
  const { id, color, name, isActive } = user;

  return css`
    .yRemoteSelection-${id} {
      background: ${alphaHexColor(color, 0.5)};
    }

    .yRemoteSelectionHead-${id} {
      position: absolute;
      border-left: ${color} solid 2px;
      border-top: ${color} solid 2px;
      border-bottom: ${color} solid 2px;
      height: 100%;
      box-sizing: border-box;
    }

    .yRemoteSelectionHead-${id}::after {
      position: absolute;
      padding: 0 ${isActive ? '4px' : '0'};
      content: '${isActive ? name : ' '}';
      background: ${color};
      border-radius: ${isActive ? `3px 3px 0 0` : '3px'};
      ${!isActive ? `border: 3px solid ${color};` : ''}
      font-size: 12px;
      white-space: nowrap;
      color: white;
      left: -2px;
      top: ${isActive ? '-25px' : '-2px'};
      z-index: 10;
    }
  `;
}

export function injectYMonacoCSS(users: YUSer[]) {
  const styleSheetId = 'blazecode-monaco';
  const styles = users.map(getYMonacoCSS).join('\n');
  const styleSheet = (() => {
    const existingStyleSheet = document.getElementById(styleSheetId);

    if (existingStyleSheet) return existingStyleSheet;
    else {
      const newStyledSheet = document.createElement('style');
      newStyledSheet.setAttribute('id', styleSheetId);
      document.head.appendChild(newStyledSheet);

      return newStyledSheet;
    }
  })();
  styleSheet.innerHTML = styles;
}

export function getInitials(name: string) {
  const [firstName, lastName] = name
    .split(' ')
    .filter((part) => part.trim().length > 0);
  return `${firstName[0].toUpperCase()}${
    lastName ? lastName[0].toUpperCase() : ''
  }`;
}
