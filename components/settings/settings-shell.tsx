"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  LineChart,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type SettingsShellProps = {
  firstName: string;
  email: string | null | undefined;
};

type NotificationSetting = {
  id: "marketRecaps" | "wishlistNews" | "productUpdates";
  title: string;
  description: string;
  icon: typeof Mail;
};

const notificationOptions: NotificationSetting[] = [
  {
    id: "marketRecaps",
    title: "Market recaps",
    description: "Daily or weekly summaries for broad market activity.",
    icon: LineChart,
  },
  {
    id: "wishlistNews",
    title: "Wishlist news",
    description: "Updates when saved names have fresh headlines worth reviewing.",
    icon: Bell,
  },
  {
    id: "productUpdates",
    title: "Product updates",
    description: "Occasional notes when new tools or workflows ship inside TapeDeck.",
    icon: Sparkles,
  },
] as const;

export function SettingsShell({ firstName, email }: SettingsShellProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [settings, setSettings] = useState({
    marketRecaps: true,
    wishlistNews: true,
    productUpdates: false,
  });

  function toggleSetting(key: keyof typeof settings) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: !currentSettings[key],
    }));
  }

  const enabledCount = Object.values(settings).filter(Boolean).length;

  return (
    <div className="space-y-8">
      <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
        <div className="badge badge-outline gap-2 rounded-full border-primary/30 bg-base-100/80 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
          <ShieldCheck className="h-4 w-4" />
          Account settings
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                Preferences
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold text-base-content sm:text-5xl">
                Shape how {firstName} hears from TapeDeck.
              </h1>
            </div>

            <p className="max-w-3xl text-base leading-8 text-base-content/68 sm:text-lg">
              This first pass is UI-only. You can toggle preferences here now,
              and persistence plus delivery wiring can land next.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/78 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
              Account
            </p>
            <p className="mt-3 text-lg font-semibold text-base-content">
              {email ?? "Signed-in user"}
            </p>
            <p className="mt-2 text-sm leading-6 text-base-content/58">
              Preview changes reset on refresh until notification storage is
              connected.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
        <section className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                Notifications
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-base-content">
                Notification center
              </h2>
            </div>

            <label className="flex items-center gap-3 rounded-full border border-base-300/70 bg-base-100/78 px-4 py-3">
              <span className="text-sm font-medium text-base-content">
                {notificationsEnabled ? "On" : "Off"}
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={notificationsEnabled}
                onChange={() =>
                  setNotificationsEnabled((enabled) => !enabled)
                }
                aria-label="Toggle all notifications"
              />
            </label>
          </div>

          <div className="mt-8 space-y-4">
            {notificationOptions.map((option) => {
              const Icon = option.icon;

              return (
                <article
                  key={option.id}
                  className={[
                    "rounded-[1.75rem] border border-base-300/70 p-5 transition-opacity",
                    notificationsEnabled ? "bg-base-100/80" : "bg-base-100/58 opacity-68",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-base-content">
                          {option.title}
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-base-content/62">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      className="toggle toggle-secondary"
                      checked={notificationsEnabled && settings[option.id]}
                      disabled={!notificationsEnabled}
                      onChange={() => toggleSetting(option.id)}
                      aria-label={`Toggle ${option.title}`}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-panel rounded-4xl border border-base-300/70 p-6 shadow-lg shadow-primary/5 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/12 text-secondary">
                {notificationsEnabled ? (
                  <Bell className="h-5 w-5" />
                ) : (
                  <BellOff className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
                  Current state
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-base-content">
                  {notificationsEnabled ? "Listening mode" : "Quiet mode"}
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <article className="rounded-3xl border border-base-300/70 bg-base-100/78 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                  Active toggles
                </p>
                <p className="mt-3 text-3xl font-semibold text-base-content">
                  {notificationsEnabled ? enabledCount : 0}
                </p>
              </article>
              <article className="rounded-3xl border border-base-300/70 bg-base-100/78 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-base-content/42">
                  Save status
                </p>
                <p className="mt-3 text-lg font-semibold text-base-content">
                  Preview only
                </p>
              </article>
            </div>
          </div>

          <div className="glass-panel rounded-4xl border border-dashed border-base-300/80 p-6 shadow-lg shadow-primary/5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/42">
              Next step
            </p>
            <p className="mt-3 text-base leading-8 text-base-content/68">
              When you are ready, these toggles can be backed by MongoDB and
              used to drive email, push, or in-app notification delivery.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}