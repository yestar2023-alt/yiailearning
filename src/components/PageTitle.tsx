import React from 'react';

interface PageTitleProps {
  children: React.ReactNode;
}

export default function PageTitle({ children }: PageTitleProps) {
  return (
    <h1 className="relative text-4xl font-bold mb-10 inline-block">
      <span className="relative z-10">{children}</span>
      <span className="absolute left-0 bottom-0 w-full h-3 rounded-sm bg-primary/18 -z-0"></span>
    </h1>
  );
}
