"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function PwaInstallCard() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIsInstalled(standalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="mt-5 rounded-lg border border-white/8 bg-white/[0.03] p-4">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 size-4 text-red-300" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">Installed</p>
            <p className="mt-1 text-sm font-medium text-white/60">Solakuti is ready from your home screen.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-lg border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-start gap-3">
        <Smartphone className="mt-0.5 size-4 text-red-300" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">Install Solakuti</p>
          <p className="mt-1 text-sm font-medium text-white/60">
            {installPrompt
              ? "Add Solakuti to your device for faster access."
              : "Use your browser menu to add Solakuti to your home screen."}
          </p>
        </div>
      </div>

      {installPrompt && (
        <button
          type="button"
          onClick={handleInstall}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black"
        >
          <Download className="size-4" aria-hidden="true" />
          Install app
        </button>
      )}
    </div>
  );
}
