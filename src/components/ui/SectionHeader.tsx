"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string | ReactNode;
  subtitle?: string;
  href?: string;
  linkText?: string;
}

export function SectionHeader({
  title,
  subtitle,
  href,
  linkText = "View All",
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors shrink-0"
        >
          {linkText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}