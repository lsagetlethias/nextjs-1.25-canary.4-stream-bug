"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Uses `useSearchParams()` internally, must be Suspense-d in server component.
 */
export const NextPageLink = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const nextPage = String((parseInt(searchParams?.get("page") ?? "0") || 0) + 1);
  const cleanSearchParams = new URLSearchParams(searchParams as any ?? {});
  cleanSearchParams.set("page", nextPage);

  return (
    <a onClick={evt => {
      evt.preventDefault();
      router.push(`${pathname}?${cleanSearchParams.toString()}`)
    }} style={{fontSize: "18px", cursor: "pointer"}}>
      See next results
    </a>
  );
};
