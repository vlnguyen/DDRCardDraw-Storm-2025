import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";

export interface CabInfo {
  /** drawing id if active */
  activeMatch: string | null;
  name: string;
  id: string;
}

export interface PoolPlayer {
  playerName: string;
  scores: number[];
}

interface StreamDashboard {
  poolPlayers: PoolPlayer[]
}

interface EventState {
  eventName: string;
  cabs: Record<string, CabInfo>;
  streamDashboard: StreamDashboard;
}

const initialState: EventState = {
  eventName: "",
  cabs: {
    default: {
      id: "default",
      name: "Primary Cab",
      activeMatch: null,
    },
  },
  streamDashboard: {
    poolPlayers: [
      {
        playerName: "VincentITG",
        scores: [9975, 9684, 9789, 9854],
      },
      {
        playerName: "BlizzrdBall",
        scores: [9674, 9739, 9485, 9769],
      }
    ]
  },
};

export const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    /** add a cab with its name */
    addCab(state, action: PayloadAction<string>) {
      const newCab: CabInfo = {
        id: nanoid(5),
        name: action.payload,
        activeMatch: null,
      };
      state.cabs[newCab.id] = newCab;
    },
    removeCab(state, action: PayloadAction<string>) {
      delete state.cabs[action.payload];
    },
    assignMatchToCab(
      state,
      action: PayloadAction<{ cabId: string; matchId: string | null }>,
    ) {
      const cab = state.cabs[action.payload.cabId];
      if (!cab) return;
      cab.activeMatch = action.payload.matchId;
    },
    updatePoolPlayers(state, action: PayloadAction<PoolPlayer[]>) {
      state.streamDashboard.poolPlayers = action.payload
    },
  },
  selectors: {
    allCabs: createSelector([(state: EventState) => state.cabs], (cabs) => {
      return Object.values(cabs);
    }),
  },
});
