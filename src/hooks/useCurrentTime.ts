import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useEffect, useState } from "react";

export const DEFAULT_TIMEZONE = "America/New_York";

export function useCurrentTime(timezone = DEFAULT_TIMEZONE): [string, string] {
  const [date, setDate] = useState(toZonedTime(new Date(), timezone));

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(toZonedTime(new Date(), timezone));
    }, 1000);

    return function cleanup() {
      clearInterval(timer);
    };
  }, [timezone]);

  return [format(date, "h:mm:ss a"), timezone];
}
