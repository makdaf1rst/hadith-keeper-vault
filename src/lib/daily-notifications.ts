import type { AnyRouter } from "@tanstack/react-router";

const ENABLED_KEY = "jami-daily-hadith-enabled";
const TIME_KEY = "jami-daily-hadith-time";
const FIRST_ID = 20_000;
const COUNT = 30;

type DailyHadith = { n: number; en: string; bn: string };

export function dailyNotificationSettings() {
  if (typeof localStorage === "undefined") return { enabled: false, time: "08:00" };
  return {
    enabled: localStorage.getItem(ENABLED_KEY) === "1",
    time: localStorage.getItem(TIME_KEY) || "08:00",
  };
}

async function cancelScheduled() {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.cancel({ notifications: Array.from({ length: COUNT }, (_, index) => ({ id: FIRST_ID + index })) });
}

async function schedule(time: string) {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const entries = (await fetch("/daily-hadith.json").then((response) => response.json())) as DailyHadith[];
  if (entries.length !== 366) throw new Error("Daily hadith data is unavailable");
  await cancelScheduled();
  const [hour, minute] = time.split(":").map(Number);
  const language = localStorage.getItem("jami-content-language") === "bn" ? "bn" : "en";
  const first = new Date();
  first.setHours(hour || 0, minute || 0, 0, 0);
  if (first.getTime() <= Date.now()) first.setDate(first.getDate() + 1);
  const notifications = Array.from({ length: COUNT }, (_, index) => {
    const at = new Date(first);
    at.setDate(first.getDate() + index);
    const start = new Date(at.getFullYear(), 0, 0);
    const day = Math.floor((at.getTime() - start.getTime()) / 86_400_000);
    const entry = entries[(day - 1) % entries.length]!;
    return {
      id: FIRST_ID + index,
      title: language === "bn" ? `হাদিস ${entry.n}` : `Hadith ${entry.n}`,
      body: entry[language],
      schedule: { at, allowWhileIdle: true },
      extra: { hadithNumber: entry.n },
    };
  });
  await LocalNotifications.schedule({ notifications });
}

export async function setDailyNotifications(enabled: boolean, time: string) {
  if (!enabled) {
    localStorage.removeItem(ENABLED_KEY);
    localStorage.setItem(TIME_KEY, time);
    await cancelScheduled();
    return { ok: true };
  }
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") return { ok: false };
  await schedule(time);
  localStorage.setItem(ENABLED_KEY, "1");
  localStorage.setItem(TIME_KEY, time);
  return { ok: true };
}

export async function initializeDailyNotifications(router: AnyRouter) {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.addListener("localNotificationActionPerformed", ({ notification }) => {
    const number = Number(notification.extra?.hadithNumber);
    if (Number.isSafeInteger(number) && number > 0) {
      void router.navigate({ to: "/hadith/$number", params: { number: String(number) } });
    }
  });
  const settings = dailyNotificationSettings();
  if (settings.enabled) await schedule(settings.time).catch(() => undefined);
}
