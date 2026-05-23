"use client";

import React from "react";

interface MotionDivProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function MotionDiv({ children, ...props }: MotionDivProps) {
  return <div {...props}>{children}</div>;
}