import { Duplicate } from "@blueprintjs/icons";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { useCallback } from "react";
import { Button, OverlayToaster } from "@blueprintjs/core";
import { copyPlainTextToClipboard } from "../utils/share";

export function UpNext() {
  const [time, timezone] = useCurrentTime();

  const handleCopyCurrentTimeSource = useCallback(async () => {
    const sourcePath = `${window.location.pathname}/source/current-time`;
    const sourceUrl = new URL(sourcePath, window.location.href);
    copyPlainTextToClipboard(sourceUrl.href);

    const toaster = await OverlayToaster.createAsync({ position: "top" });
    toaster.show({
      message: "Current time source copied to clipboard.",
      intent: "success",
      timeout: 5000,
    });
  }, []);

  return (
    <div style={{ minWidth: 500 }}>
      <h1>Current Time</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button
            type="button"
            onClick={handleCopyCurrentTimeSource}
            tabIndex={-1}
          >
            <Duplicate />
          </Button>
          <div>
            {time} ({timezone})
          </div>
        </div>
      </div>
    </div>
  );
}
