// ---------------------------------------------------------------------------
// A4 page dimensions in millimeters
// ---------------------------------------------------------------------------

/** A4 page width in millimeters */
export const A4_WIDTH_MM = 210;

/** A4 page height in millimeters */
export const A4_HEIGHT_MM = 297;

// ---------------------------------------------------------------------------
// Conversion factors
// ---------------------------------------------------------------------------

/** 1 mm = 3.7795275591 px  (at 96 DPI) */
export const MM_TO_PX = 3.7795275591;

/** 1 mm = 2.8346456693 pt */
export const MM_TO_PT = 2.8346456693;

/** 1 px = 1/MM_TO_PX mm */
export const PX_TO_MM = 1 / MM_TO_PX;

/** 1 pt = 1/MM_TO_PT mm */
export const PT_TO_MM = 1 / MM_TO_PT;

/** 1 inch = 25.4 mm */
export const IN_TO_MM = 25.4;

/** 1 mm = 1/25.4 inches */
export const MM_TO_IN = 1 / IN_TO_MM;

// ---------------------------------------------------------------------------
// Computed A4 dimensions in other units
// ---------------------------------------------------------------------------

/** A4 width in pixels (96 DPI) */
export const A4_WIDTH_PX = A4_WIDTH_MM * MM_TO_PX;

/** A4 height in pixels (96 DPI) */
export const A4_HEIGHT_PX = A4_HEIGHT_MM * MM_TO_PX;

/** A4 width in points */
export const A4_WIDTH_PT = A4_WIDTH_MM * MM_TO_PT;

/** A4 height in points */
export const A4_HEIGHT_PT = A4_HEIGHT_MM * MM_TO_PT;

// ---------------------------------------------------------------------------
// Conversion functions
// ---------------------------------------------------------------------------

/** Convert millimeters to pixels (96 DPI) */
export function mmToPx(mm: number): number {
	return mm * MM_TO_PX;
}

/** Convert pixels (96 DPI) to millimeters */
export function pxToMm(px: number): number {
	return px * PX_TO_MM;
}

/** Convert millimeters to points */
export function mmToPt(mm: number): number {
	return mm * MM_TO_PT;
}

/** Convert points to millimeters */
export function ptToMm(pt: number): number {
	return pt * PT_TO_MM;
}

/** Convert inches to millimeters */
export function inToMm(inches: number): number {
	return inches * IN_TO_MM;
}

/** Convert millimeters to inches */
export function mmToIn(mm: number): number {
	return mm * MM_TO_IN;
}
