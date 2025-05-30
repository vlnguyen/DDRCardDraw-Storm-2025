import { useMemo } from "react";
import { PoolPlayer } from "../state/event.slice";
import { useAppState } from "../state/store";

import styles from "./pools.css";

interface PoolPlayerResult extends PoolPlayer {
  wins: number;
  rank: number;
  averageEx: number;
}

function getPoolPlayersResults(poolPlayers: PoolPlayer[]): PoolPlayerResult[] {
  const numSongs = poolPlayers[0].scores.length;
  const poolPlayersResults: PoolPlayerResult[] = poolPlayers.map(
    (poolPlayer) => {
      const scoresSum = poolPlayer.scores.reduce(
        (sum, score) => sum + score,
        0,
      );
      return {
        ...poolPlayer,
        averageEx: scoresSum / poolPlayer.scores.length,
        wins: 0,
        rank: 0,
      };
    },
  );

  for (let songIndex = 0; songIndex < numSongs; songIndex++) {
    poolPlayersResults.sort(
      (a, b) => b.scores[songIndex] - a.scores[songIndex],
    );
    const allSongScores = poolPlayers.reduce(
      (prevScores, currentPoolPlayer) => {
        return [...prevScores, currentPoolPlayer.scores[songIndex]];
      },
      [] as number[],
    );

    for (
      let playerIndex = 0;
      playerIndex < poolPlayersResults.length;
      playerIndex++
    ) {
      // ties are broken by giving players points for each player they tied with (highest points)
      poolPlayersResults[playerIndex].wins +=
        // exclude oneself from their win count
        allSongScores.filter(
          (songScore) =>
            poolPlayersResults[playerIndex].scores[songIndex] >= songScore,
        ).length - 1;
    }
  }

  poolPlayersResults.sort((a, b) => b.wins - a.wins);

  let currentWinTarget: number | null = null;
  for (
    let poolPlayerResultIndex = 0;
    poolPlayerResultIndex < poolPlayersResults.length;
    poolPlayerResultIndex++
  ) {
    const poolPlayerResult = poolPlayersResults[poolPlayerResultIndex];
    const expectedRank = poolPlayerResultIndex + 1;

    if (currentWinTarget === null) {
      poolPlayerResult.rank = expectedRank;
      currentWinTarget = poolPlayerResult.wins;
    } else if (currentWinTarget === poolPlayerResult.wins) {
      const prevPoolPlayerResult =
        poolPlayersResults[poolPlayerResultIndex - 1];
      poolPlayerResult.rank = prevPoolPlayerResult.rank;
    } else {
      poolPlayerResult.rank = expectedRank;
      currentWinTarget = poolPlayerResult.wins;
    }
  }

  poolPlayersResults.sort((a, b) => {
    const sortByWins = b.wins - a.wins;
    if (sortByWins !== 0) {
      return sortByWins;
    }
    return b.averageEx - a.averageEx;
  });

  return poolPlayersResults;
}

function getDisplayScore(score: number): string {
  return `${(score / 100).toFixed(2)}%`;
}

export function PoolsScoresSource() {
  const poolPlayers = useAppState((s) => s.event.streamDashboard.poolPlayers);
  const numSongs = poolPlayers[0].scores.length;
  const poolPlayersResults = useMemo(() => {
    return getPoolPlayersResults(poolPlayers);
  }, [poolPlayers]);

  return (
    <table className={styles.poolsScoresTable}>
      <thead>
        <tr>
          <th></th>
          {Array.from({ length: numSongs }).map((_, index) => (
            <th key={index}>Song {index + 1}</th>
          ))}
          <th>Wins</th>
        </tr>
      </thead>
      <tbody>
        {poolPlayersResults.map(
          (
            { playerName, scores, wins, rank, averageEx, isEliminated },
            poolPlayerResultIndex,
          ) => {
            const medal = ((): string | null => {
              if (isEliminated) {
                return "💀";
              }

              switch (rank) {
                case 1:
                  return "🥇";
                case 2:
                  return "🥈";
                // only two players advance from pools
                default:
                  return null;
              }
            })();

            return (
              <tr key={poolPlayerResultIndex}>
                <td>
                  {medal}{" "}
                  <b>
                    {rank}. {playerName}
                  </b>
                </td>
                {scores.map((score, scoreIndex) => (
                  <td key={scoreIndex}>{getDisplayScore(score)}</td>
                ))}
                <td>
                  <b>{wins} wins</b> (<i>Avg. {getDisplayScore(averageEx)}</i>)
                </td>
              </tr>
            );
          },
        )}
      </tbody>
    </table>
  );
}
