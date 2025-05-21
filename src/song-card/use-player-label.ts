import { useDrawing } from "../drawing-context";
import { playerNameByIndex } from "../models/Drawing";

export function usePlayerLabelForIndex(pIdx: number, fallback?: string) {
  return useDrawing((d) => playerNameByIndex(d.meta, pIdx, fallback));
}
