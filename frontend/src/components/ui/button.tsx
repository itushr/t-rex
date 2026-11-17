import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon" | "icon-sm";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50";
    const v = variant === "outline"
      ? "border border-border bg-transparent hover:bg-muted/40 text-foreground"
      : variant === "ghost"
      ? "bg-transparent hover:opacity-80 text-white"
      : "bg-primary text-primary-foreground hover:opacity-90";
    const s = size === "icon-sm" ? "size-8 p-0" : size === "icon" ? "size-9 p-0" : "px-3 py-1.5 text-xs rounded-lg";
    return <button ref={ref} className={`${base} ${v} ${s} ${className}`} {...props} />;
  }
);
Button.displayName = "Button";
export default Button;
