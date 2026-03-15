import { badge } from "@/app/lib/constants/ui";

type BadgeVariant = keyof typeof badge;

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span className={`${badge[variant]} ${className}`}>
      {children}
    </span>
  );
}
