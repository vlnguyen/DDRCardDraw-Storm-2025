import { useMemo } from "react";
import { PoolPlayer } from "../state/event.slice";
import { useAppState } from "../state/store";

import styles from './pools.css'

interface PoolPlayerResult extends PoolPlayer {
  wins: number;
}

function getPoolPlayersResults(poolPlayers: PoolPlayer[]): PoolPlayerResult[] {
  const numSongs = poolPlayers[0].scores.length
  const poolPlayersResults: PoolPlayerResult[] = poolPlayers.map(poolPlayer => {
    return {
      ...poolPlayer,
      wins: 0
    }
  })

  for (let songIndex = 0; songIndex < numSongs; songIndex++) {
    poolPlayersResults.sort((a, b) => b.scores[songIndex] - a.scores[songIndex])
    for (let playerIndex = 0; playerIndex < poolPlayersResults.length; playerIndex++) {
      poolPlayersResults[playerIndex].wins += poolPlayersResults.length - playerIndex - 1
    }
  }

  return poolPlayersResults.sort((a, b) => b.wins - a.wins)
}

function getDisplayScore(score: number): string {
  return `${(score / 100).toFixed(2)}%`
}

export function PoolsScoresSource() {
  const poolPlayers = useAppState((s) => s.event.streamDashboard.poolPlayers);
  const numSongs = poolPlayers[0].scores.length
  const poolPlayersResults = useMemo(() => {
    return getPoolPlayersResults(poolPlayers)
  }, [poolPlayers])

  return (
    <table className={styles.poolsScoresTable}>
      <thead>
        <tr>
          <th></th>
          {Array.from({ length: numSongs }).map((_, index) => (
            <th key={index}>
              Song {index + 1}
            </th>
          ))}
          <th>Wins</th>
        </tr>
      </thead>
      <tbody>
        {poolPlayersResults.map(({ playerName, scores, wins }, poolPlayerResultIndex) => {
          const medal = ((): string | null => {
            switch (poolPlayerResultIndex) {
              case 0:
                return '🥇'
              case 1:
                return '🥈'
              // only two players advance from pools
              default:
                return null
            }
          })();

          return (
            <tr key={poolPlayerResultIndex}>
              <td>
                {medal} <b>{playerName}</b>
              </td>
              {scores.map((score, scoreIndex) => (
                <td key={scoreIndex}>{getDisplayScore(score)}</td>
              ))}
              <td>{wins}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}