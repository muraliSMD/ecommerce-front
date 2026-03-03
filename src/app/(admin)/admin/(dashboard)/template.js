"use client";

import { PageTransition } from "@/components/Skeleton";

export default function Template({ children }) {
  return <PageTransition>{children}</PageTransition>;
}
