import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Checks the Downloads passcode against the DOWNLOADS_PASSCODE server secret.
 * The passcode never ships to the browser.
 */
export const verifyDownloadsPasscode = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ code: z.string().max(200) }).parse(data))
  .handler(async ({ data }) => {
    const expected = process.env["DOWNLOADS_PASSCODE"];
    if (!expected) {
      return { ok: false as const, error: "Downloads access is not configured yet." };
    }
    return data.code === expected
      ? { ok: true as const }
      : { ok: false as const, error: "Incorrect passcode." };
  });
