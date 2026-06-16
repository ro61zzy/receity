import type { BusinessInfo } from "@/types/receipt";

const LEGACY_SLOGAN = "Random things you'll actually need ✨";

function isLegacySocial(value: string | undefined): boolean {
  const trimmed = value?.trim().toLowerCase() ?? "";
  if (!trimmed) return false;
  return trimmed.includes("random_convenience");
}

/** Remove old Random Convenience placeholders saved from early app defaults */
export function stripLegacyBusinessDefaults(
  business: Partial<BusinessInfo> | undefined,
): Partial<BusinessInfo> | undefined {
  if (!business) return business;

  return {
    ...business,
    tiktok: isLegacySocial(business.tiktok) ? "" : business.tiktok,
    instagram: isLegacySocial(business.instagram) ? "" : business.instagram,
    slogan: business.slogan?.trim() === LEGACY_SLOGAN ? "" : business.slogan,
  };
}
