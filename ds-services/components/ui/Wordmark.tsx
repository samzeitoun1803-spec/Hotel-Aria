import { cn } from "@/lib/cn";

/** Wordmark typographique : « DS » plein, filet de cartouche, « SERVICES » espacé. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("wordmark", className)}>
      <span className="wordmark-ds">DS</span>{" "}
      <span className="wordmark-rule" aria-hidden="true" />{" "}
      <span className="wordmark-services">SERVICES</span>
    </span>
  );
}
