import { useAppState } from "../state/store";

import styles from "./waves.css";
import { unique } from "../stream-dashboard/waves";
import { WavePlayer } from "../state/event.slice";

export function WavesSource() {
  const { players, selectedWave } = useAppState(
    (s) => s.event.streamDashboard.wavesData,
  );

  const playersByPool = players.reduce(
    (prev, current) => {
      if (!prev[current.pool]) {
        return {
          ...prev,
          [current.pool]: [current],
        };
      }
      return {
        ...prev,
        [current.pool]: [...(prev[current.pool] ?? []), current],
      };
    },
    {} as Record<string, WavePlayer[] | undefined>,
  );

  const pools = players
    .filter((p) => p.wave === selectedWave)
    .map((p) => p.pool)
    .filter(unique)
    .sort();

  const maxPlayersInPool = pools.reduce((prevMax, currentPool) => {
    if ((playersByPool[currentPool]?.length ?? 0) > prevMax) {
      return playersByPool[currentPool]?.length ?? 0;
    }
    return prevMax;
  }, 0);

  return (
    <table className={styles.wavesTable}>
      <thead>
        <tr>
          {pools.map((pool) => (
            <th key={pool}>
              <h3>Pool {pool}</h3>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: maxPlayersInPool }).map((_, playerIndex) => (
          <tr key={playerIndex}>
            {pools.map((pool) => {
              const player = playersByPool[pool]?.[playerIndex];
              if (!player) {
                return <td key={pool} />;
              }

              return (
                <td key={pool}>
                  {player.playerName}
                  {player.didPlayerAdvance && " 👑"}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
