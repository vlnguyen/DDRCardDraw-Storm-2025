import * as OfflinePluginRuntime from "@lcdp/offline-plugin/runtime";
import { useEffect } from "react";

export function UpdateManager() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      OfflinePluginRuntime.install({
        onUpdateReady() {
          OfflinePluginRuntime.applyUpdate();
          window.location.reload();
        },
      });
    }
  }, []);

  return null;
}
