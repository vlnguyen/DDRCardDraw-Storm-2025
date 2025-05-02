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

export function CardsBracket() {
  const draws = useAppState((s) => {
    const { drawings } = s;
    const drawingIds = drawings.ids.slice(drawings.ids.length - 3).toReversed();
    return drawingIds.map((drawingId) => drawings.entities[drawingId]);
  });

  return (
    <div className={styles.cardsBracketContainer}>
      <div>
        {draws.map((drawing) => (
          <div>
            <h1 className={styles.title}>{drawing.meta.title}</h1>
            <ChartsOnly key={drawing.id} drawingId={drawing.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
