"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

type Props = {
  className?: string;
};

export function LogoutButton({ className = "" }: Props) {
  const m = t("it");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onLogout()}
      disabled={busy}
      className={className}
      aria-busy={busy}
    >
      {busy ? "Uscita…" : m.logout}
    </button>
  );
}
