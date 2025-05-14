import { useCallback, useState } from "react";
import { eventSlice, PoolPlayer } from "../state/event.slice";
import { useAppDispatch, useAppState } from "../state/store";

import styles from "./pools-scores.css"

export function PoolsScores() {
  const poolPlayersState = useAppState(state => state.event.streamDashboard.poolPlayers)
  const dispatch = useAppDispatch()

  const [poolPlayers, setPoolPlayers] = useState<PoolPlayer[]>(poolPlayersState)
  const maxSongs = poolPlayers.reduce(
    (prevMax, poolPlayer) => poolPlayer.scores.length > prevMax ? poolPlayer.scores.length : prevMax,
    0,
  )

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(eventSlice.actions.updatePoolPlayers(poolPlayers))
  }, [dispatch, poolPlayers])

  const handleNameChange = useCallback((poolPlayerIndex: number) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setPoolPlayers(prevPoolPlayers => prevPoolPlayers.map((prevPlayer, prevPlayerIndex) => {
        if (prevPlayerIndex === poolPlayerIndex) {
          return {
            ...prevPlayer,
            playerName: e.target.value
          }
        }
        return prevPlayer
      }))
    }
  }, [])

  const handleScoreChange = useCallback((poolPlayerIndex: number, scoreIndex: number) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setPoolPlayers(prevPoolPlayers => prevPoolPlayers.map((prevPlayer, prevPlayerIndex) => {
        if (prevPlayerIndex === poolPlayerIndex) {
          return {
            ...prevPlayer,
            scores: prevPlayer.scores.map((prevScore, prevScoreIndex) => {
              if (prevScoreIndex === scoreIndex) {
                return parseInt(e.target.value, 10)
              }
              return prevScore
            })
          }
        }
        return prevPlayer
      }))
    }
  }, [])

  return (
    <form onSubmit={handleSubmit}>
      <h1>Pools Scores</h1>
      <table className={styles.poolsScoresTable}>
        <colgroup>
          <col />
          {Array.from({ length: maxSongs }).map((_, scoreIndex) => (
            <col key={scoreIndex} className={styles.scoreCol} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className={styles.playerNameColumn}>Player</th>
            {Array.from({ length: maxSongs }).map((_, index) => (
              <th key={index}>
                Score {index + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {poolPlayers.map(({ playerName, scores }, playerIndex) => (
            <tr key={playerIndex}>
              <td>
                <input
                  value={playerName}
                  onChange={handleNameChange(playerIndex)}
                />
              </td>
              {scores.map((score, scoreIndex) => (
                <td key={scoreIndex}>
                  <input
                    type="number"
                    value={score}
                    onChange={handleScoreChange(playerIndex, scoreIndex)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button>
        Save
      </button>
    </form>
  )
}