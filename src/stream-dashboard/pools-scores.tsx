import { useCallback, useState } from "react";
import {
  Add,
  BanCircle,
  ArrowUp,
  ArrowDown,
  Duplicate,
} from "@blueprintjs/icons";
import { Button, OverlayToaster } from "@blueprintjs/core";

import { eventSlice, PoolPlayer } from "../state/event.slice";
import { useAppDispatch, useAppState } from "../state/store";

import styles from "./pools-scores.css";
import { copyPlainTextToClipboard } from "../utils/share";

export function PoolsScores() {
  const poolPlayersState = useAppState(
    (state) => state.event.streamDashboard.poolPlayers,
  );
  const dispatch = useAppDispatch();

  const [poolPlayers, setPoolPlayers] =
    useState<PoolPlayer[]>(poolPlayersState);
  // List of players and scores are both guaranteed to be non-empty
  const numSongs = poolPlayers[0].scores.length;

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      dispatch(eventSlice.actions.updatePoolPlayers(poolPlayers));

      const toaster = await OverlayToaster.createAsync({ position: "top" });
      toaster.show({
        message: "Pools scores updated.",
        intent: "success",
        timeout: 5000,
      });
    },
    [dispatch, poolPlayers],
  );

  const handleReset = useCallback(() => {
    setPoolPlayers((prevPoolPlayers) =>
      prevPoolPlayers.map((_, poolPlayerIndex) => ({
        playerName: `Player ${poolPlayerIndex + 1}`,
        scores: Array(numSongs).fill(0),
        isEliminated: false,
        isDisabled: false,
      })),
    );
  }, [numSongs]);

  const handleNameChange = useCallback((poolPlayerIndex: number) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setPoolPlayers((prevPoolPlayers) =>
        prevPoolPlayers.map((prevPlayer, prevPlayerIndex) => {
          if (prevPlayerIndex === poolPlayerIndex) {
            return {
              ...prevPlayer,
              playerName: e.target.value,
            };
          }
          return prevPlayer;
        }),
      );
    };
  }, []);

  const handleScoreChange = useCallback(
    (poolPlayerIndex: number, scoreIndex: number) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        setPoolPlayers((prevPoolPlayers) =>
          prevPoolPlayers.map((prevPlayer, prevPlayerIndex) => {
            if (prevPlayerIndex === poolPlayerIndex) {
              return {
                ...prevPlayer,
                scores: prevPlayer.scores.map((prevScore, prevScoreIndex) => {
                  if (prevScoreIndex === scoreIndex) {
                    return parseInt(e.target.value, 10);
                  }
                  return prevScore;
                }),
              };
            }
            return prevPlayer;
          }),
        );
      };
    },
    [],
  );

  const handleAddScore = useCallback(() => {
    setPoolPlayers((prevPoolPlayers) =>
      prevPoolPlayers.map((prevPlayer) => {
        return {
          ...prevPlayer,
          scores: [...prevPlayer.scores, 0],
        };
      }),
    );
  }, []);

  const handleRemoveScore = useCallback((scoreIndex: number) => {
    return () => {
      setPoolPlayers((prevPoolPlayers) => {
        return prevPoolPlayers.map((prevPlayer) => {
          return {
            ...prevPlayer,
            scores: prevPlayer.scores.filter(
              (_, prevScoreIndex) => prevScoreIndex !== scoreIndex,
            ),
          };
        });
      });
    };
  }, []);

  const handleAddPlayer = useCallback(() => {
    setPoolPlayers((prevPoolPlayers) => {
      return [
        ...prevPoolPlayers,
        {
          playerName: `Player ${prevPoolPlayers.length + 1}`,
          scores: Array(numSongs).fill(0),
          isEliminated: false,
          isDisabled: false,
        },
      ];
    });
  }, [numSongs]);

  const handleRemovePlayer = useCallback((playerIndex: number) => {
    return () => {
      setPoolPlayers((prevPoolPlayers) => {
        return prevPoolPlayers.filter(
          (_, prevPlayerIndex) => prevPlayerIndex !== playerIndex,
        );
      });
    };
  }, []);

  const handleEliminatedChange = useCallback((poolPlayerIndex: number) => {
    return () => {
      setPoolPlayers((prevPoolPlayers) =>
        prevPoolPlayers.map((prevPlayer, prevPlayerIndex) => {
          if (prevPlayerIndex === poolPlayerIndex) {
            return {
              ...prevPlayer,
              isEliminated: !prevPlayer.isEliminated,
            };
          }
          return prevPlayer;
        }),
      );
    };
  }, []);

  const handleDisabledChange = useCallback((poolPlayerIndex: number) => {
    return () => {
      setPoolPlayers((prevPoolPlayers) =>
        prevPoolPlayers.map((prevPlayer, prevPlayerIndex) => {
          if (prevPlayerIndex === poolPlayerIndex) {
            return {
              ...prevPlayer,
              isDisabled: !prevPlayer.isDisabled,
            };
          }
          return prevPlayer;
        }),
      );
    };
  }, []);

  const handleMovePlayer = useCallback(
    (poolPlayerIndex: number, direction: "up" | "down") => {
      const newPoolPlayerIndex =
        poolPlayerIndex + (direction === "up" ? -1 : 1);
      return () => {
        setPoolPlayers((prevPoolPlayers) => {
          const newPoolPlayers = [...prevPoolPlayers];
          newPoolPlayers.splice(
            newPoolPlayerIndex,
            0,
            newPoolPlayers.splice(poolPlayerIndex, 1)[0],
          );
          return newPoolPlayers;
        });
      };
    },
    [],
  );

  const handleCopyPlayerNameSource = useCallback((poolPlayerIndex: number) => {
    return async () => {
      const sourcePath = `${window.location.pathname}/source/pools-player-name/${poolPlayerIndex}`;
      const sourceUrl = new URL(sourcePath, window.location.href);
      copyPlainTextToClipboard(sourceUrl.href);

      const toaster = await OverlayToaster.createAsync({ position: "top" });
      toaster.show({
        message: "Pool player name source copied to clipboard.",
        intent: "success",
        timeout: 5000,
      });
    };
  }, []);

  const handleCopyPoolsScoresSource = useCallback(async () => {
    const sourcePath = `${window.location.pathname}/source/pools-scores`;
    const sourceUrl = new URL(sourcePath, window.location.href);
    copyPlainTextToClipboard(sourceUrl.href);

    const toaster = await OverlayToaster.createAsync({ position: "top" });
    toaster.show({
      message: "Pools scores source copied to clipboard.",
      intent: "success",
      timeout: 5000,
    });
  }, []);

  const numPlayers = poolPlayers.length;

  return (
    <form onSubmit={handleSubmit}>
      <h1>
        Pools Scores{" "}
        <Button
          type="button"
          onClick={handleCopyPoolsScoresSource}
          tabIndex={-1}
        >
          <Duplicate />
        </Button>
      </h1>
      <table className={styles.poolsScoresTable}>
        <colgroup>
          <col />
          <col />
          <col />
          <col />
          {Array.from({ length: numSongs }).map((_, scoreIndex) => (
            <col key={scoreIndex} className={styles.scoreCol} />
          ))}
          <col />
        </colgroup>
        <thead>
          <tr>
            <th></th>
            <th className={styles.playerNameColumn}>Player</th>
            <th>💀</th>
            <th>🚫</th>
            {Array.from({ length: numSongs }).map((_, index) => (
              <th key={index}>
                Score {index + 1}
                {numSongs > 1 && (
                  <>
                    {" "}
                    <Button
                      type="button"
                      onClick={handleRemoveScore(index)}
                      tabIndex={-1}
                    >
                      <BanCircle />
                    </Button>
                  </>
                )}
              </th>
            ))}
            <th>
              Add Score{" "}
              <Button type="button" onClick={handleAddScore} tabIndex={-1}>
                <Add />
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {poolPlayers.map(
            ({ playerName, scores, isEliminated, isDisabled }, playerIndex) => (
              <tr key={playerIndex}>
                <td className={styles.buttonContainer}>
                  {numPlayers > 1 && (
                    <>
                      <Button
                        type="button"
                        onClick={handleCopyPlayerNameSource(playerIndex)}
                        tabIndex={-1}
                      >
                        <Duplicate />
                      </Button>{" "}
                      <Button
                        type="button"
                        onClick={handleRemovePlayer(playerIndex)}
                        tabIndex={-1}
                      >
                        <BanCircle />
                      </Button>{" "}
                      <Button
                        type="button"
                        onClick={handleMovePlayer(playerIndex, "down")}
                        disabled={playerIndex === numPlayers - 1}
                        tabIndex={-1}
                      >
                        <ArrowDown />
                      </Button>{" "}
                      <Button
                        type="button"
                        onClick={handleMovePlayer(playerIndex, "up")}
                        disabled={playerIndex === 0}
                        tabIndex={-1}
                      >
                        <ArrowUp />
                      </Button>
                    </>
                  )}
                </td>
                <td className={styles.nameContainer}>
                  <input
                    value={playerName}
                    onChange={handleNameChange(playerIndex)}
                    tabIndex={0 * numPlayers + playerIndex + 1}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={isEliminated}
                    onChange={handleEliminatedChange(playerIndex)}
                    tabIndex={-1}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={isDisabled}
                    onChange={handleDisabledChange(playerIndex)}
                    tabIndex={-1}
                  />
                </td>
                {scores.map((score, scoreIndex) => (
                  <td key={scoreIndex}>
                    <input
                      type="number"
                      value={score}
                      onChange={handleScoreChange(playerIndex, scoreIndex)}
                      tabIndex={(scoreIndex + 1) * numPlayers + playerIndex + 1}
                    />
                  </td>
                ))}
              </tr>
            ),
          )}
        </tbody>
      </table>
      <div>
        <b>
          Add Player{" "}
          <Button type="button" onClick={handleAddPlayer} tabIndex={-1}>
            <Add />
          </Button>
        </b>
      </div>
      <div
        style={{ display: "flex", flexDirection: "row", gap: 8, paddingTop: 8 }}
      >
        <Button type="submit">Save</Button>
        <Button type="button" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </form>
  );
}
