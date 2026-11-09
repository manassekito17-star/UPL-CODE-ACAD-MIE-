import { describe, expect, it } from "vitest";
import { chromeIntentUrl, detectInApp } from "./in-app";

const CHROME_ANDROID = "Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const WHATSAPP_ANDROID = "Mozilla/5.0 (Linux; Android 13; SM-A135F; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 WhatsApp/2.23.20";
const SAFARI_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const FB_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/440.0]";
const TELEGRAM_ANDROID = "Mozilla/5.0 (Linux; Android 12; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0 Mobile Safari/537.36 Telegram-Android/10.2";

describe("navigateurs intégrés", () => {
  it("reconnaît les vrais navigateurs", () => {
    expect(detectInApp(CHROME_ANDROID).inApp).toBe(false);
    expect(detectInApp(SAFARI_IOS).inApp).toBe(false);
    expect(detectInApp("").inApp).toBe(false);
  });
  it("reconnaît WhatsApp, Telegram et Facebook", () => {
    expect(detectInApp(WHATSAPP_ANDROID)).toEqual({ inApp: true, app: "WhatsApp", os: "android" });
    expect(detectInApp(TELEGRAM_ANDROID)).toEqual({ inApp: true, app: "Telegram", os: "android" });
    expect(detectInApp(FB_IOS)).toEqual({ inApp: true, app: "Facebook", os: "ios" });
  });
  it("construit l'adresse d'ouverture dans Chrome", () => {
    const u = chromeIntentUrl("https://exemple.app/connexion?suite=%2Fide");
    expect(u.startsWith("intent://exemple.app/connexion?suite=%2Fide#Intent;scheme=https;package=com.android.chrome;")).toBe(true);
    expect(u.endsWith(";end")).toBe(true);
  });
});
