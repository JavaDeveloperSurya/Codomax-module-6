import { cn, initials } from "@/lib/utils";

const SIZES = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
} as const;

const GRADIENTS = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-cyan-500",
  "from-rose-500 to-orange-400",
  "from-emerald-500 to-lime-500",
  "from-fuchsia-500 to-purple-500",
  "from-amber-500 to-red-500",
];

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ring-1 ring-white/10",
        GRADIENTS[hash % GRADIENTS.length],
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
