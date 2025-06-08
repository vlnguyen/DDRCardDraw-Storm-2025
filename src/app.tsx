import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/table/lib/css/table.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "@blueprintjs/datetime2/lib/css/blueprint-datetime2.css";

import { FocusStyleManager } from "@blueprintjs/core";

FocusStyleManager.onlyShowFocusOnTabs();

import { UpdateManager } from "./update-manager";
import { IntlProvider } from "./intl-provider";
import { ThemeSyncWidget } from "./theme-toggle";
import { Provider } from "react-redux";
import { store } from "./state/store";
import { PartySocketManager } from "./party/client";

import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useParams,
  Link,
} from "react-router-dom";
import { nanoid } from "nanoid";
import { ClassicModeShell } from "./classic-mode";
import styles from "./app.css";

const router = createBrowserRouter([
  {
    path: "/",
    Component: () => {
      return (
        <div style={{ padding: "1em" }}>
          <h1>DDR Tools Event Mode</h1>
          <h2 style={{ fontStyle: "italic" }}>Alpha Preview</h2>
          <p>
            You need to pick an event first. Would you like to:{" "}
            <Link to={`/e/${nanoid()}`}>Create New Event?</Link>
          </p>
          <p>
            Or... perhaps just use the app in{" "}
            <Link to="/classic">Classic Mode</Link>
          </p>
          <p>
            No idea what this is?{" "}
            <a href="https://youtu.be/4Gpj9jTNcfM">Here's a video</a> trying to
            explain how to use it!
          </p>
        </div>
      );
    },
  },
  {
    path: "classic",
    Component: ClassicModeShell,
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import("./drawing-list");
          return { Component: mod.DrawingList };
        },
      },
      {
        path: "charts",
        lazy: async () => {
          const mod = await import("./eligible-charts");
          return { Component: mod.default };
        },
      },
    ],
  },
  {
    path: "e/:roomName",
    lazy: async () => ({
      Component: (await import("./tournament-mode")).TournamentModeApp,
    }),
  },
  {
    path: "e/:roomName/stream-dashboard",
    lazy: async () => ({
      Component: (await import("./stream-dashboard")).StreamDashboard,
    }),
  },
  {
    path: "e/:roomName/stream-dashboard/source",
    element: <ObsSource />,
    children: [
      {
        path: "pools-scores",
        lazy: async () => {
          const { PoolsScoresSource } = await import("./obs-sources/pools");
          return { Component: PoolsScoresSource };
        },
      },
      {
        path: "pools-player-name/:poolPlayerIndex",
        lazy: async () => {
          const { PoolPlayerName } = await import("./obs-sources/text");
          return { Component: PoolPlayerName };
        },
      },
      {
        path: "current-time",
        lazy: async () => {
          const { CurrentTime } = await import("./obs-sources/text");
          return { Component: CurrentTime };
        },
      },
      {
        path: "waves",
        lazy: async () => {
          const { WavesSource } = await import("./obs-sources/waves");
          return { Component: WavesSource };
        },
      },
      {
        path: "string/:slug",
        lazy: async () => {
          const { StreamString } = await import("./obs-sources/text");
          return { Component: StreamString };
        },
      },
    ],
  },
  {
    path: "e/:roomName/cab/:cabId/source",
    element: <ObsSource />,
    children: [
      {
        path: "cards",
        lazy: async () => {
          const { CabCards } = await import("./obs-sources/cards");
          return { Component: CabCards };
        },
      },
      {
        path: "cards-set",
        lazy: async () => {
          const { CabSet } = await import("./obs-sources/cards");
          return { Component: CabSet };
        },
      },
      {
        path: "title",
        lazy: async () => {
          const { CabTitle } = await import("./obs-sources/text");
          return { Component: CabTitle };
        },
      },
      {
        path: "title-set",
        lazy: async () => {
          const { CabTitle } = await import("./obs-sources/text");
          return { Component: () => <CabTitle type="set" /> };
        },
      },
      {
        path: "players",
        lazy: async () => {
          const { CabPlayers } = await import("./obs-sources/text");
          return { Component: CabPlayers };
        },
      },
      {
        path: "players-set",
        lazy: async () => {
          const { CabPlayers } = await import("./obs-sources/text");
          return { Component: () => <CabPlayers type="set" /> };
        },
      },
      {
        path: "p1",
        lazy: async () => {
          const { CabPlayer } = await import("./obs-sources/text");
          return { element: <CabPlayer p={1} /> };
        },
      },
      {
        path: "p1-name",
        lazy: async () => {
          const { CabPlayer } = await import("./obs-sources/text");
          return { element: <CabPlayer p={1} displayType="Name" /> };
        },
      },
      {
        path: "p1-score",
        lazy: async () => {
          const { CabPlayer } = await import("./obs-sources/text");
          return { element: <CabPlayer p={1} displayType="Score" /> };
        },
      },
      {
        path: "p2",
        lazy: async () => {
          const { CabPlayer } = await import("./obs-sources/text");
          return { element: <CabPlayer p={2} /> };
        },
      },
      {
        path: "p2-name",
        lazy: async () => {
          const { CabPlayer } = await import("./obs-sources/text");
          return { element: <CabPlayer p={2} displayType="Name" /> };
        },
      },
      {
        path: "p2-score",
        lazy: async () => {
          const { CabPlayer } = await import("./obs-sources/text");
          return { element: <CabPlayer p={2} displayType="Score" /> };
        },
      },
    ],
  },
]);

function ObsSource() {
  const params = useParams<"roomName" | "cabId">();
  if (!params.roomName) {
    return null;
  }
  return (
    <Provider store={store}>
      <PartySocketManager roomName={params.roomName}>
        <IntlProvider>
          <div className={styles.obsSource}>
            <Outlet />
          </div>
        </IntlProvider>
      </PartySocketManager>
    </Provider>
  );
}

export function App() {
  return (
    <IntlProvider>
      <ThemeSyncWidget />
      <UpdateManager />
      <RouterProvider router={router} />
    </IntlProvider>
  );
}
