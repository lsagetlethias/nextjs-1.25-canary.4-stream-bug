"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { PropsWithChildren } from 'react';

export const ClientAnimate = ({children}: PropsWithChildren) => {
  const [animationParent] = useAutoAnimate<HTMLDivElement>();

  return <div ref={animationParent}>{children}</div>;
};
