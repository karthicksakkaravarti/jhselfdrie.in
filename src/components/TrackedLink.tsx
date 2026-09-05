"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { track, type EventName } from "@/lib/analytics";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { event: EventName; children: ReactNode };

export function TrackedLink({ event, children, onClick, ...props }: Props) {
  return <a {...props} onClick={(e) => { track(event); onClick?.(e); }}>{children}</a>;
}
