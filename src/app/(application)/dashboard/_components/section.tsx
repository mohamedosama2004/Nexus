import { Suspense, type ReactNode } from "react";

type Props = {
  label: string;
  fallback?: ReactNode;
  children: ReactNode;
};

export default function Section({ label, fallback, children }: Props) {
  return (
    <Suspense fallback={fallback ?? <p>Loading {label}...</p>}>
      {children}
    </Suspense>
  );
}
