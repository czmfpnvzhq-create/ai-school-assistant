import { useEffect, useState } from "react";

/** Returns false on server and first client paint, true after mount. Prevents hydration mismatches. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
