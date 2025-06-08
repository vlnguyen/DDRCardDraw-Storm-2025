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
  isDisabled: boolean;
}

export interface StringSlug {
  slug: string;
  value: string;
  stretch?: "title" | "dialog";
}

export interface WavePlayer {
  playerName: string;
  wave: number;
  pool: string;
  didPlayerAdvance: boolean;
}

export interface WavesData {
  players: WavePlayer[];
  lastUpdated?: string;
  selectedWave?: number;
}

interface StreamDashboard {
  poolPlayers: PoolPlayer[];
  strings: StringSlug[];
  wavesData: WavesData;
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
        playerName: "VivaLaMoo",
        scores: [9987, 9867, 9748, 10000],
        isEliminated: false,
        isDisabled: false,
      },
      {
        playerName: "Twix",
        scores: [9964, 9834, 9820, 9995],
        isEliminated: false,
        isDisabled: false,
      },
      {
        playerName: "VincentITG",
        scores: [9856, 9615, 9534, 9910],
        isEliminated: false,
        isDisabled: false,
      },
      {
        playerName: "TommyDoesntMiss",
        scores: [9829, 9614, 9587, 9943],
        isEliminated: false,
        isDisabled: false,
      },
    ],
    strings: [
      {
        slug: "up-next",
        value: "Wave 5B - VincentITG, TommyDoesntMiss, VivaLaMoo, Twix",
      },
      {
        slug: "commentator-1",
        value: "Kenji",
      },
      {
        slug: "commentator-2",
        value: "Mr3Dimensional",
      },
      {
        slug: "intermission",
        value: "We'll be right back!",
      },
    ],
    wavesData: {
      players: [],
      lastUpdated: undefined,
      selectedWave: undefined,
    },
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
    updateStrings(state, action: PayloadAction<StringSlug[]>) {
      state.streamDashboard.strings = action.payload;
    },
    updateWavesData(state, action: PayloadAction<WavesData>) {
      state.streamDashboard.wavesData = action.payload;
    },
  },
  selectors: {
    allCabs: createSelector([(state: EventState) => state.cabs], (cabs) => {
      return Object.values(cabs);
    }),
  },
});
