/** Shop identity — replace placeholders before go-live where needed */
const SHOP_CONFIG = {
  name: 'Tholan Frames and Gifts Shop',
  tagline: 'Frames & Gift Shop — Retail & Wholesale',
  yearsExperience: '10+',

  /** E.164 without + for wa.me, e.g. 919876543210 */
  whatsappDigits: '919865815158',
  phoneDisplay: '+91 98658 15158',

  /** UPI: set your merchant VPA and display name */
  upiId: 'merchant@paytm',
  upiPayeeName: 'Tholan Frames and Gifts Shop',

  /** Google Maps embed src — replace with your place embed URL */
  mapsEmbedSrc:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.89!2d79.487!3d11.123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDA3JzIyLjgiTiA3OcKwMjknMTMuMiJF!5e0!3m2!1sen!2sin!4v1710000000000',

  addressLines: ['18 Andal Sannathi', 'Srivilliputtur, Tamil Nadu', 'India'],

  storageCatalogKey: 'krishna_shop_catalog_v1',
  storageAdminPinKey: 'krishna_shop_admin_pin_gate',

  /** First-time PIN until changed on admin page */
  adminDefaultPin: '1234',
};

function whatsappHref(text) {
  const q = text ? '?text=' + encodeURIComponent(text) : '';
  return 'https://wa.me/' + SHOP_CONFIG.whatsappDigits + q;
}

function telHref() {
  return 'tel:' + SHOP_CONFIG.phoneDisplay.replace(/\s/g, '');
}
