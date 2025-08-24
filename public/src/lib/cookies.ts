// Cookie utility functions for partner ID storage

const PARTNER_ID_COOKIE = 'partner_id';
const COOKIE_EXPIRY_HOURS = 24;

export const setPartnerIdCookie = (partnerId: string): void => {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (COOKIE_EXPIRY_HOURS * 60 * 60 * 1000));
  
  const cookieValue = `${PARTNER_ID_COOKIE}=${partnerId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  document.cookie = cookieValue;
  
  console.log(`Cookie set: ${PARTNER_ID_COOKIE}=${partnerId}, expires: ${expiryDate.toUTCString()}`);
  console.log(`Full cookie string: ${cookieValue}`);
  console.log(`All cookies after setting: ${document.cookie}`);
};

export const getPartnerIdCookie = (): string | null => {
  console.log(`Getting cookie. All cookies: ${document.cookie}`);
  const cookies = document.cookie.split(';');
  console.log(`Split cookies:`, cookies);
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    console.log(`Checking cookie: name="${name}", value="${value}"`);
    if (name === PARTNER_ID_COOKIE && value) {
      console.log(`Cookie found: ${PARTNER_ID_COOKIE}=${value}`);
      return value;
    }
  }
  
  console.log(`No cookie found for: ${PARTNER_ID_COOKIE}`);
  return null;
};

export const clearPartnerIdCookie = (): void => {
  const cookieValue = `${PARTNER_ID_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = cookieValue;
  console.log(`Cookie cleared: ${PARTNER_ID_COOKIE}`);
};
