import {
  Alignment,
  Button,
  Dialog,
  Menu,
  MenuItem,
  Navbar,
  Popover,
} from "@blueprintjs/core";
import {
  Trash,
  InfoSign,
  Menu as MenuIcon,
  Help,
  Layers,
  Control,
} from "@blueprintjs/icons";
import { useCallback, useState } from "react";
import { About } from "./about";
import { HeaderControls } from "./controls";
import { useIntl } from "./hooks/useIntl";
import { LastUpdate } from "./last-update";
import { useAppDispatch, useAppState } from "./state/store";
import { drawingsSlice } from "./state/drawings.slice";
import { EventModeGated } from "./common-components/app-mode";
import { useMatch, useParams } from "react-router-dom";

export function Header() {
  const params = useParams<"roomName">();
  const [aboutOpen, setAboutOpen] = useState(false);
  const dispatch = useAppDispatch();
  const clearDrawings = useCallback(
    () => dispatch(drawingsSlice.actions.clearDrawings()),
    [dispatch],
  );
  const haveDrawings = useAppState(drawingsSlice.selectors.haveDrawings);
  const { t } = useIntl();
  const isStreamDashboard = !!useMatch("/e/:roomName/stream-dashboard");

  const menu = (
    <Menu>
      {params.roomName && (
        <>
          <MenuItem
            icon={<Control />}
            href={`/e/${params.roomName}/stream-dashboard`}
            text={t("hero.streamDashboard")}
          />
          <MenuItem
            icon={<Layers />}
            href={`/e/${params.roomName}`}
            text={t("draws")}
          />
        </>
      )}
      <MenuItem
        icon={<Trash />}
        onClick={clearDrawings}
        text={t("hero.clearDrawings")}
        disabled={!haveDrawings}
      />
      <MenuItem
        icon={<InfoSign />}
        onClick={() => setAboutOpen(true)}
        text={t("credits")}
        data-umami-event="about-open"
      />
      <MenuItem
        icon={<Help />}
        target="_blank"
        href="https://github.com/noahm/DDRCardDraw/blob/main/docs/readme.md"
        text={t("help")}
      />
      <LastUpdate />
    </Menu>
  );

  return (
    <Navbar
      style={{
        position: "sticky",
        top: 0,
      }}
    >
      <Dialog isOpen={aboutOpen} onClose={() => setAboutOpen(false)}>
        <About />
      </Dialog>
      <Navbar.Group align={Alignment.LEFT}>
        <Popover content={menu} placement="bottom-start">
          <Button icon={<MenuIcon />} data-umami-event="hamburger-menu-open" />
        </Popover>
        <Navbar.Divider />
        <Navbar.Heading>
          Event Mode{" "}
          <small>
            <em>
              <EventModeGated fallback="Classic Variant Alpha">
                Alpha Preview
              </EventModeGated>
            </em>
          </small>
        </Navbar.Heading>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        {!isStreamDashboard && <HeaderControls />}
      </Navbar.Group>
    </Navbar>
  );
}
