import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Verifies the temporary access code for the Bangla private preview.
 * The code itself lives in the BENGALI_PREVIEW_CODE server secret and is
 * never exposed to the browser.
 */
export const verifyBengaliPreviewCode = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ code: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const expected = process.env["BENGALI_PREVIEW_CODE"];
    if (!expected) {
      return { ok: false as const, error: "Preview access is not configured yet." };
    }
    return data.code === expected
      ? { ok: true as const }
      : { ok: false as const, error: "Incorrect access code." };
  });
