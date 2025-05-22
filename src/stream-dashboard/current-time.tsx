import { useCurrentTime } from "../hooks/useCurrentTime";

export function CurrentTime() {
  const [time, timezone] = useCurrentTime()

  return (
    <div>
      <h1>Current Time ({timezone})</h1>
      <div>{time}</div>
    </div>
  )
}