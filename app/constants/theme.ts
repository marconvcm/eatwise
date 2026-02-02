const SPACING = 44.0;

const STATUS_BAR_HEIGHT = 59;

const SPACING_2X = SPACING * 2;
const SPACING_3X = SPACING * 3;
const SPACING_4X = SPACING * 4;
const SPACING_5X = SPACING * 5;

const SPACING_2F = SPACING / 2;
const SPACING_3F = SPACING / 3;
const SPACING_4F = SPACING / 4;
const SPACING_5F = SPACING / 5;

const FONT_SIZE = 17.0;

const FONT_SIZE_2X = FONT_SIZE * 2;
const FONT_SIZE_3X = FONT_SIZE * 3;

const FONT_SIZE_2F = FONT_SIZE / 2;
const FONT_SIZE_3F = FONT_SIZE / 3;

const DARK_RED = "#45040c";
const VIVID_RED = "#720714";
const BLACK = "#000000";
const DARK_GREEN = "#063a21";
const VIVID_GREEN = "#12562a";
const SILVER = "#c0c0c0";

export type ColorSetup = {
   base: string;
   light: string;
   lighter: string;
   dark: string;
   darker: string;
}

export type ThemeColors = {
   primary: ColorSetup;
   secondary: ColorSetup;
   surface: ColorSetup;
   error: ColorSetup;
   text: ColorSetup;
   border: ColorSetup;
}

const COLORS: ThemeColors = {
   primary: {
      base: VIVID_GREEN,
      light: "#2d8f4f",
      lighter: "#4db06f",
      dark: "#0d3f1e",
      darker: "#062815",
   },
   secondary: {
      base: DARK_GREEN,
      light: "#0d5532",
      lighter: "#147043",
      dark: "#042915",
      darker: "#02180d",
   },
   surface: {
      base: "#ffffff",
      light: "#f5f5f5",
      lighter: "#fafafa",
      dark: "#e0e0e0",
      darker: "#d0d0d0",
   },
   error: {
      base: VIVID_RED,
      light: "#a00b1e",
      lighter: "#d41028",
      dark: "#4a0510",
      darker: "#2d0309",
   },
   text: {
      base: BLACK,
      light: "#333333",
      lighter: "#666666",
      dark: "#000000",
      darker: "#000000",
   },
   border: {
      base: SILVER,
      light: "#d9d9d9",
      lighter: "#e8e8e8",
      dark: "#a8a8a8",
      darker: "#909090",
   },
}

export const Theme = {
   SPACING,
   SPACING_2X,
   SPACING_3X,
   SPACING_4X,
   SPACING_5X,
   SPACING_2F,
   SPACING_3F,
   SPACING_4F,
   SPACING_5F,
   FONT_SIZE,
   FONT_SIZE_2X,
   FONT_SIZE_3X,
   FONT_SIZE_2F,
   FONT_SIZE_3F,
   COLORS,
   STATUS_BAR_HEIGHT
}