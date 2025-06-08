import React, { useCallback, useMemo, useState } from "react";
import { Button, OverlayToaster } from "@blueprintjs/core";

import { useAppDispatch, useAppState } from "../state/store";
import { useTextEdit } from "../hooks/useTextEdit";
import { eventSlice, WavesData } from "../state/event.slice";
import { format } from "date-fns";

interface WavePlayer {
  playerName: string;
  wave: number;
  pool: string;
  didPlayerAdvance: boolean;
}

function unique<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}

function parseWavesDataText(wavesDataText?: string): WavePlayer[] {
  try {
    const data = JSON.parse(wavesDataText ?? "[]");
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((row) => ({
      playerName: row.playerName,
      wave: row.wave,
      pool: row.pool,
      didPlayerAdvance: row.didPlayerAdvance,
    }));
  } catch {
    return [];
  }
}

export function Waves() {
  const dispatch = useAppDispatch();
  const [editDialog, openEditDialog] = useTextEdit();
  const wavesDataState = useAppState((s) => s.event.streamDashboard.wavesData);
  const [wavesData, setWavesData] = useState<WavesData>(wavesDataState);

  const wavePlayersStats = useMemo(() => {
    return {
      Waves: wavesData.players
        .map((wp) => wp.wave)
        .filter(unique)
        .sort()
        .join(", "),
      Rows: wavesData.players.length,
      "Last Updated": wavesData.lastUpdated
        ? format(wavesData.lastUpdated, "yyyy-mm-dd (hh:mm zz)")
        : "-",
    };
  }, [wavesData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      dispatch(
        eventSlice.actions.updateWavesDate({
          players: wavesData.players,
          lastUpdated: new Date(),
        }),
      );

      const toaster = await OverlayToaster.createAsync({ position: "top" });
      toaster.show({
        message: "Waves data updated.",
        intent: "success",
        timeout: 5000,
      });
    },
    [dispatch, wavesData],
  );

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1>Waves</h1>
        {wavePlayersStats && (
          <ul>
            {Object.entries(wavePlayersStats).map(([label, value]) => (
              <li key={label}>
                {label}: {value}
              </li>
            ))}
          </ul>
        )}
        <div>
          <Button tabIndex={-1} type="submit">
            Save
          </Button>{" "}
          <Button
            tabIndex={-1}
            onClick={() =>
              openEditDialog({
                title: "Paste waves data from Google Sheets",
                onConfirm: (value: string) =>
                  setWavesData((prev) => ({
                    ...prev,
                    players: parseWavesDataText(value),
                  })),
              })
            }
          >
            Edit
          </Button>
        </div>
      </form>
      {editDialog}
    </>
  );
}
