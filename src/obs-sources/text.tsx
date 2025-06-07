import { useParams } from "react-router-dom";
import classNames from "classnames";

import { drawingSelectors, getSetSelector } from "../state/drawings.slice";
import { useAppState } from "../state/store";
import { getAllPlayers, playerNameByIndex } from "../models/Drawing";
import { useCurrentTime } from "../hooks/useCurrentTime";

import styles from "./text.css";

export function CabTitle({ type = "match" }: { type?: "set" | "match" }) {
  const params = useParams<"roomName" | "cabId">();
  const text = useAppState((s) => {
    if (type === "match") {
      const drawingId = s.event.cabs[params.cabId!].activeMatch;
      if (!drawingId) return null;
      const drawing = drawingSelectors.selectById(s, drawingId);
      if (!drawing) return null;
      return drawing.meta.title;
    }

    if (type === "set") {
      const setId = s.event.cabs[params.cabId!].activeSet;
      if (!setId) {
        return null;
      }

      const drawings = getSetSelector(setId)(s);
      if (!drawings || drawings.length === 0) {
        return null;
      }

      return drawings[0].meta.title;
    }
  });
  return <h1>{text}</h1>;
}

export function CabPlayers({ type = "match" }: { type?: "set" | "match" }) {
  const params = useParams<"roomName" | "cabId">();
  const text = useAppState((s) => {
    if (type === "match") {
      const drawingId = s.event.cabs[params.cabId!].activeMatch;
      if (!drawingId) return null;
      const drawing = drawingSelectors.selectById(s, drawingId);
      if (!drawing) return null;
      return getAllPlayers(drawing).join(", ");
    }

    if (type === "set") {
      const setId = s.event.cabs[params.cabId!].activeSet;
      if (!setId) {
        return null;
      }

      const drawings = getSetSelector(setId)(s);
      if (!drawings) {
        return null;
      }

      const players = getAllPlayers(drawings[0]);
      if (players.length === 2) {
        return `${players[0]} vs. ${players[1]}`;
      }
      return players.join(", ");
    }
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
  const params = useParams<"poolPlayerIndex">();
  const poolPlayerIndex = parseInt(params.poolPlayerIndex ?? "");
  if (Number.isNaN(poolPlayerIndex)) {
    return null;
  }

  const poolPlayer = poolPlayers[poolPlayerIndex];
  if (!poolPlayer || poolPlayer.isDisabled) {
    return null;
  }

  const playerNameColor = classNames([
    styles[`poolPlayer${poolPlayerIndex}`],
    {
      [styles.poolPlayerEven]: poolPlayerIndex > 3 && poolPlayerIndex % 2 === 0,
      [styles.poolPlayerOdd]: poolPlayerIndex > 3 && poolPlayerIndex % 2 === 1,
    },
  ]);

  return <h1 className={playerNameColor}>{poolPlayer.playerName}</h1>;
}

export function CurrentTime() {
  const [time] = useCurrentTime();
  return <h1>{time}</h1>;
}

export function StreamString() {
  const params = useParams<{ slug: string }>();
  const strings = useAppState((s) => s.event.streamDashboard.strings);

  if (!params.slug) {
    return null;
  }

  const currentString = strings.find((string) => string.slug === params.slug);
  if (!currentString) {
    return null;
  }

  return (
    <h1
      className={classNames({
        [styles.stretchDialog]: currentString.stretch === "dialog",
        [styles.stretchTitle]: currentString.stretch === "title",
      })}
    >
      {currentString.value}
    </h1>
  );
}
