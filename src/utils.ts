// noinspection JSUnusedGlobalSymbols

import { Style } from '@capacitor/status-bar'

import { DarkModeAppearance } from './definitions'

const kAppearanceToStyleMap = {
  [DarkModeAppearance.dark]: Style.Dark,
  [DarkModeAppearance.light]: Style.Light,
  [DarkModeAppearance.system]: Style.Default,
} as const

const kStyleToAppearanceMap = {
  [Style.Dark]: DarkModeAppearance.dark,
  [Style.Light]: DarkModeAppearance.light,
  [Style.Default]: DarkModeAppearance.system,
}

/**
 * Returns whether the given color is a valid 3 or 6 digit
 * '#'-prefixed hex color.
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-F]{6}|[0-9A-F]{3})$/iu.test(color)
}

// Normalize a 3-digit #RGB hex color to #RRGGBB format
export function normalizeHexColor(color: string): string {
  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
  }

  return color
}

/**
 * Returns whether the given 3 or 6 digit '#'-prefixed hex color
 * is considered a dark color based on its perceived luminance.
 * The default luminance threshold is 0.5 (on a scale of 0 to 1.0),
 * but you can pass a custom threshold if you want to change the perceived
 * darkness of a color.
 */
export function isDarkColor(color: string, threshold = 0.5): boolean {
  const hex = color.replace('#', '')
  let blue, green, red

  if (hex.length === 3) {
    red = hex.slice(0, 1)
    red += red
    green = hex.slice(1, 2)
    green += green
    blue = hex.slice(2, 3)
    blue += blue
  } else {
    red = hex.slice(0, 2)
    green = hex.slice(2, 4)
    blue = hex.slice(4, 6)
  }

  red = Number.parseInt(red, 16)
  green = Number.parseInt(green, 16)
  blue = Number.parseInt(blue, 16)

  const brightness = (red * 299 + green * 587 + blue * 114) / 1000
  return brightness < threshold * 255
}

// Converts a DarkModeAppearance to a Style
export function appearanceToStyle(appearance: DarkModeAppearance): Style {
  return kAppearanceToStyleMap[appearance]
}

// Converts a Style to a DarkModeAppearance
export function styleToAppearance(style: Style): DarkModeAppearance {
  return kStyleToAppearanceMap[style]
}
