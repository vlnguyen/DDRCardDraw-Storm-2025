import { useParams } from "react-router-dom";
import { ChartsOnly } from "../drawn-set";
import { useAppState } from "../state/store";

import styles from "./cards.css";
import { getSetSelector } from "../state/drawings.slice";
import { useMemo } from "react";
import { CardLabel, LabelType } from "../song-card/card-label";

export function CabCards() {
  const params = useParams<"roomName" | "cabId">();
  const drawingId = useAppState((s) => s.event.cabs[params.cabId!].activeMatch);
  if (!drawingId) {
    return null;
  }
  return <ChartsOnly drawingId={drawingId} />;
}

export function CabSet() {
  const params = useParams<"roomName" | "cabId">();
  const activeSetId = useAppState((s) => s.event.cabs[params.cabId!].activeSet);
  const setSelector = useMemo(() => {
    return getSetSelector(activeSetId ?? undefined);
  }, [activeSetId]);
  const draws = useAppState(setSelector);
  if (!draws) {
    return null;
  }

  return (
    <div className={styles.cardsBracketContainer}>
      <div className={styles.cardsBracketDrawsContainer}>
        {draws.map((drawing) => {
          const setBannedByLabel = ((): string | undefined => {
            const { setBannedBy, meta } = drawing;
            if (setBannedBy === undefined) {
              return undefined;
            }
            switch (meta.type) {
              case "simple":
                return meta.players[setBannedBy] || undefined;
              case "startgg":
                return meta.entrants[setBannedBy].name || undefined;
            }
          })();

          return (
            <div key={drawing.id}>
              <h1 className={styles.title}>
                {drawing.meta.title} [Set {drawing.setNumber}/
                {drawing.totalSets}]{" "}
                {drawing.setBannedBy !== undefined && (
                  <CardLabel
                    playerIdx={drawing.setBannedBy}
                    labelOverride={setBannedByLabel}
                    type={LabelType.Ban}
                    component="span"
                    ignoreDefaultStyles
                  />
                )}
              </h1>
              <ChartsOnly key={drawing.id} drawingId={drawing.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
