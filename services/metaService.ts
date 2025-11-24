
// Meta / Facebook Pixel & Conversion API Configuration
const PIXEL_ID = '4784202835002921';
const ACCESS_TOKEN = 'EACDxSkY6qHkBP5pGGy6b22WaWpTboWEp7FkVyWsBWbOK79PxwfxAxzStykT7capWdaIWhJZBMc8pr5MC0eaomGj5ZAINjj41WQ3KXWzHZCjuyBVnkC9AkepejwWgIKxG85A5LWEVA8MBluTMbG0ybtpt1CYtH8aQbgymj2ZARYQZB9gScUrN8b0gefxDkTwZDZD';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Helper to hash data (SHA-256) for CAPI privacy compliance
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Initialize the Browser Pixel
 * NOTE: The actual script injection now happens in index.html for robustness.
 * This function serves as a placeholder or for re-initialization if needed.
 */
export const initMetaTracking = () => {
  if (window.fbq) {
      // Ensure tracking is active if loaded
      // window.fbq('track', 'PageView'); // Already tracked in index.html
  }
};

interface UserData {
  em?: string; // email
  ph?: string; // phone
  fn?: string; // first name
  ln?: string; // last name
  client_ip_address?: string;
  client_user_agent?: string;
}

interface EventData {
  eventName: string;
  eventId: string; // For deduplication
  userData?: UserData;
  customData?: any;
  sourceUrl?: string;
}

/**
 * Send event via Conversion API (Server-Side simulation)
 */
const sendToCAPI = async (event: EventData) => {
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Hash PII data if present
  const hashedUserData: any = {};
  if (event.userData) {
    if (event.userData.em) hashedUserData.em = await sha256(event.userData.em);
    if (event.userData.ph) hashedUserData.ph = await sha256(event.userData.ph);
    if (event.userData.fn) hashedUserData.fn = await sha256(event.userData.fn);
  }

  // Add standard CAPI fields
  hashedUserData.client_user_agent = navigator.userAgent;
  // Note: IP address usually requires a backend to capture reliably, 
  // but strictly client-side CAPI calls might send null or rely on Meta to infer.

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: timestamp,
        event_id: event.eventId,
        event_source_url: window.location.href,
        action_source: 'website',
        user_data: hashedUserData,
        custom_data: event.customData,
      }
    ],
    // test_event_code: 'TEST12345' // Optional: Use for testing in Events Manager
  };

  try {
    await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn('Meta CAPI Error:', error);
  }
};

/**
 * Main Tracking Function
 * Sends to both Pixel (Browser) and CAPI (Graph API) with Deduplication
 */
export const trackMetaEvent = async (
  eventName: 'PageView' | 'Lead' | 'Contact' | 'InitiateCheckout' | 'ViewContent' | 'Purchase' | 'CompleteRegistration',
  userData?: { email?: string; phone?: string; name?: string },
  customData?: any
) => {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 1. Browser Pixel Track
  if (window.fbq) {
    window.fbq('track', eventName, customData, { eventID: eventId });
  }

  // 2. Conversion API Track
  await sendToCAPI({
    eventName,
    eventId,
    userData: {
      em: userData?.email,
      ph: userData?.phone,
      fn: userData?.name?.split(' ')[0],
    },
    customData
  });
};