import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default behavior for functional application keys
      if (["F1", "F5", "F8", "F9"].includes(e.key)) {
        e.preventDefault();
      }

      // 1. Global Navigation Route Shortcuts
      if (e.key === "F1") router.push("/dashboard/companies"); // Company Selection
      if (e.key === "Escape") window.history.back(); // Previous Screen

      if (e.ctrlKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        router.push("/dashboard"); // Home Dashboard
      }

      if (e.ctrlKey && e.key.toLowerCase() === "q") {
        e.preventDefault();
        localStorage.clear();
        router.push("/login"); // Logout Sequence
      }

      // 2. Functional Application Module Shortcuts
      if (e.altKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        router.push("/dashboard/masters"); // Go to Ledger Masters
      }

      if (e.key === "F8") {
        // Sales Voucher Shortcut
        router.push("/dashboard/vouchers?type=SALES");
      }

      if (e.key === "F9") {
        // Purchase Voucher Shortcut
        router.push("/dashboard/vouchers?type=PURCHASE");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);
}
