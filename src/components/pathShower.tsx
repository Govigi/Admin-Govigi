"use client";
import React from "react";
import { HomeIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function PathShower({ pathList }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
      <HomeIcon className="h-5 w-5 text-gray-500" />
      {console.log(pathList)}
      {pathList.map(([path, label], index) => {
        const isLast = index === pathList.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            <span>&gt;</span>
            <span
              className={`${
                isLast ? "text-gray-500" : "cursor-pointer hover:text-black"
              }`}
              onClick={() => {
                if (!isLast) router.push("/" + path);
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
