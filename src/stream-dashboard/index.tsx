import { ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { useParams } from "react-router-dom";
import { Provider as UrqlProvider } from "urql";
import { Header } from "../header";
import { PartySocketManager } from "../party/client";
import { urqlClient } from "../startgg-gql";
import { store } from "../state/store";
import { PoolsScores } from "./pools-scores";
import { UpNext } from "./current-time";
import { Strings } from "./strings";
import { Waves } from "./waves";

import styles from "./stream-dashboard.css";

function DashboardItem(props: { children: ReactNode }) {
  return <div className={styles.dashboardItem}>{props.children}</div>;
}

export function StreamDashboard() {
  const params = useParams<"roomName">();
  if (!params.roomName) {
    return null;
  }

  return (
    <ReduxProvider store={store}>
      <PartySocketManager roomName={params.roomName}>
        <UrqlProvider value={urqlClient}>
          <Header />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "stretch",
              flex: "1 1 0px",
              margin: 16,
              gap: 8,
            }}
          >
            <DashboardItem>
              <PoolsScores />
            </DashboardItem>
            <div style={{ display: "flex", gap: 8 }}>
              <DashboardItem>
                <Strings />
              </DashboardItem>
              <DashboardItem>
                <Waves />
              </DashboardItem>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <DashboardItem>
                <UpNext />
              </DashboardItem>
            </div>
          </div>
        </UrqlProvider>
      </PartySocketManager>
    </ReduxProvider>
  );
}
