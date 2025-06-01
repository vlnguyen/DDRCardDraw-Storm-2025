import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";

export interface CabInfo {
  /** drawing id if active */
  activeMatch: string | null;
  /* set id if active */
  activeSet: string | null;
  name: string;
  id: string;
}

export interface PoolPlayer {
  playerName: string;
  scores: number[];
  isEliminated: boolean;
}

export interface StringSlug {
  slug: string;
  value: string;
}

interface StreamDashboard {
  poolPlayers: PoolPlayer[];
  upNextText: string;
  strings: StringSlug[];
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
      activeSet: null,
    },
  },
  streamDashboard: {
    poolPlayers: [
      {
        playerName: "VincentITG",
        scores: [9975, 9684, 9789, 9854],
        isEliminated: false,
      },
      {
        playerName: "BlizzrdBall",
        scores: [9674, 9739, 9485, 9769],
        isEliminated: false,
      },
    ],
    upNextText: "Wave 5B - VincentITG, TommyDoesntMiss, VivaLaMoo, Twix",
    strings: [
      {
        slug: "commentator-1",
        value: "Kenji",
      },
      {
        slug: "commentator-2",
        value: "Mr3Dimensional",
      },
    ],
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
        activeSet: null,
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
    assignSetToCab(
      state,
      action: PayloadAction<{ cabId: string; setId: string | null }>,
    ) {
      const cab = state.cabs[action.payload.cabId];
      if (!cab) return;
      cab.activeSet = action.payload.setId;
    },
    updatePoolPlayers(state, action: PayloadAction<PoolPlayer[]>) {
      state.streamDashboard.poolPlayers = action.payload;
    },
    updateUpNextText(state, action: PayloadAction<{ upNextText: string }>) {
      state.streamDashboard.upNextText = action.payload.upNextText;
    },
    updateStrings(state, action: PayloadAction<StringSlug[]>) {
      state.streamDashboard.strings = action.payload;
    },
  },
  selectors: {
    allCabs: createSelector([(state: EventState) => state.cabs], (cabs) => {
      return Object.values(cabs);
    }),
  },
});
