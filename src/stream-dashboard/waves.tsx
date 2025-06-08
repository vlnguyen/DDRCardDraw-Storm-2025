import React, { useCallback, useMemo, useState } from "react";
import Papa from "papaparse";
import { Button, HTMLSelect, OverlayToaster } from "@blueprintjs/core";

import { useAppDispatch, useAppState } from "../state/store";
import { eventSlice, WavesData } from "../state/event.slice";
import { format } from "date-fns";
import { copyPlainTextToClipboard } from "../utils/share";
import { Duplicate } from "@blueprintjs/icons";

const DATE_FORMAT = "yyyy-MM-dd (hh:mm a)";

interface WavePlayer {
  playerName: string;
  wave: number;
  pool: string;
  didPlayerAdvance: boolean;
}

export function unique<T>(value: T, index: number, array: T[]) {
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
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date>();
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
      "Last Updated": wavesDataState.lastUpdated
        ? format(new Date(wavesDataState.lastUpdated), DATE_FORMAT)
        : "-",
      "Last Fetched": lastFetched ? format(lastFetched, DATE_FORMAT) : "-",
    };
  }, [wavesData, wavesDataState, lastFetched]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      dispatch(
        eventSlice.actions.updateWavesData({
          ...wavesData,
          lastUpdated: new Date().toISOString(),
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

  const fetchWavesData = useCallback(async () => {
    try {
      setIsFetching(true);
      const spreadsheetId = "1bBmSzHpBUQXdCXUJGADTOLjV9AwkztwRm-imC2a2x7s";
      const groupId = "1369706305";
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${groupId}`;

      const response = await (await fetch(url)).text();
      const jsonString = Papa.parse<string[]>(response, {
        header: false,
        delimiter: ",",
      }).data[0][0];

      setWavesData((prev) => ({
        ...prev,
        players: parseWavesDataText(jsonString).toSorted((a, b) => {
          if (a.didPlayerAdvance === b.didPlayerAdvance) {
            return 0;
          }
          return a.didPlayerAdvance ? -1 : 1;
        }),
      }));
      setLastFetched(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetching(false);
    }
  }, []);

  const handleCopyWavesSource = useCallback(async () => {
    const sourcePath = `${window.location.pathname}/source/waves`;
    const sourceUrl = new URL(sourcePath, window.location.href);
    copyPlainTextToClipboard(sourceUrl.href);

    const toaster = await OverlayToaster.createAsync({ position: "top" });
    toaster.show({
      message: "Waves source copied to clipboard.",
      intent: "success",
      timeout: 5000,
    });
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit} style={{ minWidth: 300 }}>
        <h1>
          Waves{" "}
          <Button type="button" onClick={handleCopyWavesSource} tabIndex={-1}>
            <Duplicate />
          </Button>
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {wavePlayersStats && (
            <ul>
              {Object.entries(wavePlayersStats).map(([label, value]) => (
                <li key={label}>
                  {label}: {value}
                </li>
              ))}
            </ul>
          )}
          <HTMLSelect
            value={wavesData.selectedWave}
            onChange={(e) => {
              const selectedWave = parseInt(e.target.value);
              setWavesData((prev) => ({
                ...prev,
                selectedWave:
                  isNaN(selectedWave) || selectedWave === 0
                    ? undefined
                    : selectedWave,
              }));
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((waveNum) => (
              <option key={waveNum} value={waveNum}>
                {waveNum ? `Wave ${waveNum}` : "None"}
              </option>
            ))}
          </HTMLSelect>
          <div>
            <Button tabIndex={-1} type="submit" disabled={isFetching}>
              Save
            </Button>{" "}
            <Button tabIndex={-1} onClick={fetchWavesData} loading={isFetching}>
              Fetch
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
