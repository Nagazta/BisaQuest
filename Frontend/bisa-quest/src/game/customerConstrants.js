// ─────────────────────────────────────────────────────────────────────────────
//  customerConstants.js  —  generic customer sprite pool
//  Import getCustomerForRound(roundIndex) in any scene page that needs
//  a customer sprite to appear during item_association rounds.
// ─────────────────────────────────────────────────────────────────────────────

import Customer1 from "../assets/images/customer/customer1.png";
import Customer2 from "../assets/images/customer/customer2.png";
import Customer3 from "../assets/images/customer/customer3.png";

// Add more customers here in the future — getCustomerForRound will cycle through them
export const CUSTOMER_IMAGES = [Customer1, Customer2, Customer3];

/**
 * Returns the customer image for a given round index.
 * Cycles back to the start if roundIndex exceeds the pool size.
 * @param {number} roundIndex — 0-based round index
 * @returns {string} image src
 */
export const getCustomerForRound = (roundIndex) =>
  CUSTOMER_IMAGES[roundIndex % CUSTOMER_IMAGES.length];