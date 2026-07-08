"use client";

import { useRouter } from "next/navigation";
import { ScanCtaButton } from "@/components/brand/scan-cta-button";

// Marks onboarding as seen so "/" stops redirecting here (see app/page.tsx).
export function GetStarted() {
  const router = useRouter();
  return (
    <ScanCtaButton
      onClick={() => {
        document.cookie = "recly_onboarded=1; path=/; max-age=31536000";
        router.push("/");
      }}
      className="w-full"
    >
      Get started
    </ScanCtaButton>
  );
}
