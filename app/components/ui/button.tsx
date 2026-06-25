import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A88A]/50 disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-[#C4A88A] text-[#0C0A09] hover:bg-[#D4B896]",
          variant === "outline" && "border border-[#3D352D] bg-transparent hover:bg-[#292524] text-[#EDE4D8]",
          variant === "secondary" && "bg-[#292524] text-[#C4A88A] hover:bg-[#3D352D]",
          variant === "ghost" && "hover:bg-[#292524] text-[#EDE4D8]",
          variant === "destructive" && "bg-[#9F391B]/10 text-[#9F391B] hover:bg-[#9F391B]/20",
          size === "default" && "h-9 px-4 py-2",
          size === "sm" && "h-8 px-3 text-xs",
          size === "lg" && "h-10 px-6",
          size === "icon" && "h-9 w-9",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
