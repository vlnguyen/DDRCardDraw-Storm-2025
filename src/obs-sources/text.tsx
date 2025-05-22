import { useParams } from "react-router-dom";
import { drawingSelectors } from "../state/drawings.slice";
import { useAppState } from "../state/store";
import { getAllPlayers, playerNameByIndex } from "../models/Drawing";

import classNames from "classnames";
import styles from './text.css'

export function CabTitle() {
  const params = useParams<"roomName" | "cabId">();
  const text = useAppState((s) => {
    const drawingId = s.event.cabs[params.cabId!].activeMatch;
    if (!drawingId) return null;
    const drawing = drawingSelectors.selectById(s, drawingId);
    if (!drawing) return null;
    return drawing.meta.title;
  });
  return <h1>{text}</h1>;
}

export function CabPlayers() {
  const params = useParams<"roomName" | "cabId">();
  const text = useAppState((s) => {
    const drawingId = s.event.cabs[params.cabId!].activeMatch;
    if (!drawingId) return null;
    const drawing = drawingSelectors.selectById(s, drawingId);
    if (!drawing) return null;
    return getAllPlayers(drawing).join(", ");
  });
  return <h1>{text}</h1>;
}

export function CabPlayer(props: {
  p: number;
  displayType?: "NameAndScore" | "Name" | "Score";
}) {
  const { displayType = "NameAndScore " } = props;
  const params = useParams<"roomName" | "cabId">();
  const text = useAppState((s) => {
    const drawingId = s.event.cabs[params.cabId!].activeMatch;
    if (!drawingId) return null;
    const drawing = drawingSelectors.selectById(s, drawingId);
    if (!drawing) return null;
    const playerIndex = drawing.playerDisplayOrder[props.p - 1];
    const name = playerNameByIndex(drawing.meta, playerIndex, "");
    const hideWins =
      drawing.meta.type === "startgg" && drawing.meta.subtype === "gauntlet";
    if (hideWins) {
      return name;
    }
    const score = Object.values(drawing.winners).reduce<number>(
      (prev, curr) => {
        if (curr === playerIndex) return prev + 1;
        return prev;
      },
      0,
    );
    if (displayType === "Name") {
      return name;
    }
    if (displayType === "Score") {
      return score;
    }
    return `${name} (${score})`;
  });
  return <h1>{text}</h1>;
}

export function PoolPlayerName() {
  const poolPlayers = useAppState((s) => s.event.streamDashboard.poolPlayers);
  const params = useParams<"poolPlayerIndex">()
  const poolPlayerIndex = parseInt(params.poolPlayerIndex ?? '')
  if (Number.isNaN(poolPlayerIndex)) {
    return null
  }

  const playerNameColor = classNames([
    styles[`poolPlayer${poolPlayerIndex}`],
    {
      [styles.poolPlayerEven]: poolPlayerIndex > 3 && poolPlayerIndex % 2 === 0,
      [styles.poolPlayerOdd]: poolPlayerIndex > 3 && poolPlayerIndex % 2 === 1,
    },
  ])

  return (
    <h1 className={playerNameColor}>
      {poolPlayers[poolPlayerIndex].playerName}
    </h1>
  )
}
