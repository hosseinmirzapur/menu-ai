import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "destructive";
  className?: string;
}

function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-[#C4A88A] text-[#0C0A09]",
        variant === "secondary" && "bg-[#292524] text-[#C4A88A]",
        variant === "outline" && "border border-[#3D352D] text-[#EDE4D8]",
        variant === "destructive" && "bg-[#9F391B]/10 text-[#9F391B]",
        className
      )}
    >
      {children}
    </span>
  );
}

export { Badge };
