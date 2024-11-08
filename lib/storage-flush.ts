// Flushes local storage if a new build version is detected
export function clearStorageIfNewBuildVersion() {
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;
  const storedBuildTime = localStorage.getItem("build_time");

  if (buildTime && storedBuildTime !== buildTime) {
    console.log("New build detected, clearing localStorage");
    localStorage.clear();
    localStorage.setItem("build_time", buildTime);
  }
}
