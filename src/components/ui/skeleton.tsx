import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
  className={cn(
    "relative overflow-hidden rounded-md shadow-sm animate-pulse " +
    "bg-gradient-to-r from-white/20 via-white/40 to-white/20 " + // light mode
    "ring-1 ring-border/40 " +
    "dark:from-white/20 dark:via-white/40 dark:to-white/20 dark:ring-white/60", // dark mode
    className
  )}
  {...props}
/>

  );
}

export { Skeleton };
