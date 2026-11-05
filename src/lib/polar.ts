/**
 * Polar checkout integration for SnipPug Pro ($4 one-time).
 */

const POLAR_STORAGE_KEY = "snippug-pro-purchased";

/**
 * Build a Polar checkout URL for SnipPug Pro.
 */
export function createCheckoutUrl(userEmail?: string): string {
  const baseUrl = "https://buy.polar.sh";
  const productId =
    (import.meta.env.VITE_POLAR_PRODUCT_ID as string | undefined) ||
    "snippug-pro";
  const successUrl = `${window.location.origin}/?purchase=success`;

  const url = new URL(`${baseUrl}/${productId}`);
  if (userEmail) url.searchParams.set("email", userEmail);
  url.searchParams.set("success_url", successUrl);

  return url.toString();
}

/**
 * Mark the current user as having purchased Pro.
 */
export function markAsPurchased(): void {
  try {
    localStorage.setItem(
      POLAR_STORAGE_KEY,
      JSON.stringify({ purchasedAt: Date.now() }),
    );
  } catch {
    /* storage unavailable */
  }
}

/**
 * Check whether the current user has purchased Pro.
 */
export function isPurchased(): boolean {
  try {
    return localStorage.getItem(POLAR_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Clear purchase status (for debugging / sign-out).
 */
export function clearPurchase(): void {
  try {
    localStorage.removeItem(POLAR_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
