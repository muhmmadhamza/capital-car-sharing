import { ServiceError } from "@/services/errors";

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Mock-mode helper: shrink a picked image to a JPEG data URL so it fits in
 * localStorage. The real API stores the original file and returns a URL.
 * `square` crops to the centre (avatars); otherwise the aspect ratio is kept.
 */
export async function imageFileToDataUrl(
  file: File,
  { maxSide, quality, square = false, field = "image" }: { maxSide: number; quality: number; square?: boolean; field?: string },
): Promise<string> {
  if (!file.type.startsWith("image/")) throw new ServiceError("invalid_input", "Please choose an image file.", field);
  if (file.size > MAX_BYTES) throw new ServiceError("invalid_input", "That image is too large. Choose one under 8 MB.", field);
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new ServiceError("invalid_input", "We could not read that image.", field);

  const sw = square ? Math.min(bitmap.width, bitmap.height) : bitmap.width;
  const sh = square ? sw : bitmap.height;
  const sx = (bitmap.width - sw) / 2;
  const sy = (bitmap.height - sh) / 2;
  const scale = Math.min(1, maxSide / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw * scale));
  canvas.height = Math.max(1, Math.round(sh * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new ServiceError("invalid_input", "We could not read that image.", field);
  }
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}
