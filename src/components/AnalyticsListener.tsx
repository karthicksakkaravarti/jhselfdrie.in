"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function AnalyticsListener() {
  useEffect(() => { track("page_view"); }, []);
  return null;
}
