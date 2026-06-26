"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items?: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    const pathname = usePathname();

    const breadcrumbItems: BreadcrumbItem[] = React.useMemo(() => {
        if (items) return items;

        const segments = pathname.split("/").filter((item) => item !== "");
        const mapped: BreadcrumbItem[] = [
            { label: "HOME", href: "/" }
        ];

        segments.forEach((segment, index) => {
            const href = `/${segments.slice(0, index + 1).join("/")}`;
            mapped.push({
                label: segment.replace(/-/g, " ").toUpperCase(),
                href: index === segments.length - 1 ? undefined : href,
            });
        });

        return mapped;
    }, [items, pathname]);

    return (
        <nav className="flex items-center text-[10px] font-bold tracking-wider uppercase font-sans text-gray-400" aria-label="Breadcrumb">
            <ol className="inline-flex items-center">
                {breadcrumbItems.map((item, index) => {
                    const isLast = index === breadcrumbItems.length - 1;

                    return (
                        <li key={index} className="inline-flex items-center">
                            {index > 0 && (
                                <ChevronRightIcon className="mx-2 h-2.5 w-2.5 text-gray-300 stroke-[3.5]" />
                            )}
                            {isLast || !item.href ? (
                                <span className={isLast ? "text-[#10b981] font-bold" : "text-gray-900"}>
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="text-gray-400 hover:text-black transition-colors"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
