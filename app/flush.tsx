"use client";

import { useEffect } from "react";
import { clearStorageIfNewBuildVersion } from "@/lib/storage-flush";

export function StorageVersionCheck() {
  useEffect(() => {
    clearStorageIfNewBuildVersion();
  }, []);

  return null;
}
