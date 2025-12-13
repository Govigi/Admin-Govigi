"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function Breadcrumbs() {
    const pathname = usePathname();

    // Remove trailing headers, split by /
    const segments = pathname.split("/").filter((item) => item !== "");

    const formatSegment = (segment: string) => {
        // Replace hyphens with spaces
        // Remove query params if any (though usePathname usually gives path only)
        return segment.replace(/-/g, " ").toUpperCase();
    };

    return (
        <nav className="flex items-center text-xs font-mono tracking-widest uppercase" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-2">
                <li className="inline-flex items-center">
                    <Link
                        href="/"
                        className="text-gray-400 hover:text-black transition-colors"
                    >
                        HOME
                    </Link>
                </li>
                {segments.map((segment, index) => {
                    // Build the path up to this segment
                    const path = `/${segments.slice(0, index + 1).join("/")}`;
                    const isLast = index === segments.length - 1;

                    return (
                        <li key={path} className="inline-flex items-center">
                            <span className="mx-2 text-gray-300">/</span>
                            {isLast ? (
                                <span className="text-black font-bold">
                                    {formatSegment(segment)}
                                </span>
                            ) : (
                                <Link
                                    href={path}
                                    className="text-gray-400 hover:text-black transition-colors"
                                >
                                    {formatSegment(segment)}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
