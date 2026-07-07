import sharp from "sharp";

// GPT-4o Vision downscales images (shortest side → 768px), so a receipt
// occupying a third of the frame loses the character detail that separates
// "2@" from "20". Receipts are bright paper on darker surroundings: crop to
// the bright-pixel bounding box to feed the model maximum effective
// resolution. If the detected region looks wrong, fall back to the full frame.
const ANALYSIS_WIDTH = 200;
const BRIGHTNESS_THRESHOLD = 170;
const PAD_RATIO = 0.03;
const MIN_AREA_RATIO = 0.05;
const MAX_AREA_RATIO = 0.9;

export async function prepareReceiptImage(input: Buffer): Promise<Buffer> {
  // bake EXIF orientation into the pixels first — metadata() reads the
  // pre-rotation header, so measuring the un-materialized pipeline gives
  // swapped width/height for 90°-rotated photos
  const orientedBuffer = await sharp(input).rotate().toBuffer();
  const oriented = sharp(orientedBuffer);
  const { data, info } = await oriented
    .clone()
    .resize({ width: ANALYSIS_WIDTH })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] > BRIGHTNESS_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const meta = await oriented.clone().metadata();
  const fullWidth = meta.width ?? 0;
  const fullHeight = meta.height ?? 0;

  if (maxX >= 0 && fullWidth > 0 && fullHeight > 0) {
    const scale = fullWidth / info.width;
    const pad = Math.round(Math.max(fullWidth, fullHeight) * PAD_RATIO);
    const left = Math.max(0, Math.round(minX * scale) - pad);
    const top = Math.max(0, Math.round(minY * scale) - pad);
    const right = Math.min(fullWidth, Math.round((maxX + 1) * scale) + pad);
    const bottom = Math.min(fullHeight, Math.round((maxY + 1) * scale) + pad);
    const width = right - left;
    const height = bottom - top;
    const areaRatio = (width * height) / (fullWidth * fullHeight);

    if (areaRatio >= MIN_AREA_RATIO && areaRatio <= MAX_AREA_RATIO) {
      return oriented
        .extract({ left, top, width, height })
        .jpeg({ quality: 90 })
        .toBuffer();
    }
  }

  return oriented.jpeg({ quality: 90 }).toBuffer();
}
