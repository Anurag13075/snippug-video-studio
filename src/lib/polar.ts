/**
 * Polar checkout integration for SnipPug Pro ($4 one-time).
 */

const POLAR_STORAGE_KEY = "snippug-pro-purchased";

/**
 * Build a Polar checkout URL for SnipPug Pro.
 * Gracefully accepts either full checkout URLs, checkout IDs (polar_cl_...), or product IDs.
 */
export function createCheckoutUrl(userEmail?: string): string {
  const checkoutUrlEnv = (
    import.meta.env.VITE_POLAR_CHECKOUT_URL as string | undefined
  )?.trim();
  const productIdEnv = (
    import.meta.env.VITE_POLAR_PRODUCT_ID as string | undefined
  )?.trim();

  const successUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/studio?purchase=success`
      : "https://snippug.vercel.app/studio?purchase=success";

  let targetUrl: string;

  if (checkoutUrlEnv && checkoutUrlEnv.startsWith("http")) {
    targetUrl = checkoutUrlEnv;
  } else if (productIdEnv && productIdEnv.startsWith("http")) {
    targetUrl = productIdEnv;
  } else if (productIdEnv) {
    if (productIdEnv.startsWith("polar_cl_")) {
      targetUrl = `https://buy.polar.sh/${productIdEnv}`;
    } else {
      targetUrl = `https://buy.polar.sh/${productIdEnv}`;
    }
  } else {
    targetUrl = "https://buy.polar.sh/snippug-pro";
  }

  try {
    const url = new URL(targetUrl);
    if (userEmail) url.searchParams.set("email", userEmail);
    if (!url.searchParams.has("success_url")) {
      url.searchParams.set("success_url", successUrl);
    }
    return url.toString();
  } catch {
    return targetUrl;
  }
}

/**
 * Open Polar checkout directly in a new tab or trigger purchase flow.
 */
export function openPolarCheckout(userEmail?: string): void {
  const url = createCheckoutUrl(userEmail);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
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
