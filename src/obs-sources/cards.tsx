import { useParams } from "react-router-dom";
import { ChartsOnly } from "../drawn-set";
import { useAppState } from "../state/store";

import styles from "./cards.css";

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
  const draws = useAppState((s) => {
    const activeSetId = s.event.cabs[params.cabId!].activeSet
    if (activeSetId === undefined) {
      return undefined
    }
    return Object.values(s.drawings.entities)
      .filter(d => d.setId === activeSetId)
      .toReversed()
  });

  if (!draws) {
    return null;
  }

  return (
    <div className={styles.cardsBracketContainer}>
      <div className={styles.cardsBracketDrawsContainer}>
        {draws.map((drawing) => (
          <div>
            <h1 className={styles.title}>
              {drawing.meta.title} [Set {drawing.setNumber}/{drawing.totalSets}]
            </h1>
            <ChartsOnly key={drawing.id} drawingId={drawing.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
