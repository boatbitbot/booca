import type { Offer } from "../types.js";
import { truncateForX } from "./utils.js";

export function maybeAttachOffer(baseText: string, offer: Offer | undefined, slot: number): {
  text: string;
  offerName?: string;
} {
  if (!offer) {
    return { text: truncateForX(baseText) };
  }

  const shouldAttach = slot % 3 === 2;
  if (!shouldAttach) {
    return { text: truncateForX(baseText) };
  }

  const suffix = `\n\n${offer.cta}: ${offer.url}`;
  const maxBaseLength = Math.max(0, 280 - suffix.length);
  const safeBase = truncateForX(baseText, maxBaseLength);
  const withOffer = `${safeBase}${suffix}`;
  return {
    text: truncateForX(withOffer),
    offerName: offer.name
  };
}
