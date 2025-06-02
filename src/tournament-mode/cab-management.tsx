import {
  Button,
  Card,
  ControlGroup,
  InputGroup,
  Menu,
  MenuItem,
  Popover,
  Tooltip,
} from "@blueprintjs/core";
import { useAppDispatch, useAppState } from "../state/store";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { CabInfo, eventSlice } from "../state/event.slice";
import {
  Add,
  CaretLeft,
  CaretRight,
  Cross,
  Font,
  Layers,
  MobileVideo,
  More,
  People,
  Person,
  Remove,
} from "@blueprintjs/icons";
import { detectedLanguage } from "../utils";
import { copyPlainTextToClipboard } from "../utils/share";
import { playerNameByIndex } from "../models/Drawing";
import { getSetSelector } from "../state/drawings.slice";

export function CabManagement() {
  const [isCollapsed, setCollapsed] = useState(true);
  const cabs = useAppState(eventSlice.selectors.allCabs);

  if (isCollapsed) {
    return (
      <div style={{ width: "40px", paddingTop: "1em" }}>
        <Tooltip content="Show cabs">
          <Button minimal onClick={() => setCollapsed(false)}>
            <CaretRight />
          </Button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div style={{ padding: "1em" }}>
      <div>
        <AddCabControl>
          <Tooltip content="Hide cabs">
            <Button minimal onClick={() => setCollapsed(true)}>
              <CaretLeft />
            </Button>
          </Tooltip>
        </AddCabControl>
      </div>
      <div>
        {cabs.map((cab) => (
          <CabSummary key={cab.id} cab={cab} />
        ))}
      </div>
    </div>
  );
}

function AddCabControl(props: { children?: ReactNode }) {
  const [name, setName] = useState("");
  const dispatch = useAppDispatch();
  const addCab = useCallback(() => {
    dispatch(eventSlice.actions.addCab(name));
    setName("");
  }, [dispatch, name]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addCab();
      }}
    >
      <ControlGroup>
        <InputGroup
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Cab name"
        />
        <Button onClick={addCab} icon={<Add />} />
        {props.children}
      </ControlGroup>
    </form>
  );
}

function CabSummary({ cab }: { cab: CabInfo }) {
  const dispatch = useAppDispatch();
  const removeCab = useCallback(
    () => dispatch(eventSlice.actions.removeCab(cab.id)),
    [dispatch, cab.id],
  );

  const copySource = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      const sourceType = e.currentTarget.dataset.source;
      if (sourceType) {
        const sourcePath = `${window.location.pathname}/cab/${cab.id}/source/${sourceType}`;
        const sourceUrl = new URL(sourcePath, window.location.href);
        console.info("Coyping source URL", sourceUrl.href);
        copyPlainTextToClipboard(
          sourceUrl.href,
          "Copied OBS source URL to clipboard",
        );
      }
    },
    [cab],
  );

  const sourcesMenu = (
    <Menu>
      <MenuItem icon={<MobileVideo />} text="OBS Sources">
        <MenuItem icon={<MobileVideo />} text="Match">
          <MenuItem
            icon={<Layers />}
            text="Cards"
            onClick={copySource}
            data-source="cards"
          />
          <MenuItem
            icon={<Font />}
            text="Title"
            onClick={copySource}
            data-source="title"
          />
          <MenuItem
            icon={<People />}
            text="All Players"
            onClick={copySource}
            data-source="players"
          />
          <MenuItem
            icon={<Person />}
            text="Player 1"
            onClick={copySource}
            data-source="p1"
          />
          <MenuItem
            icon={<Person />}
            text="Player 1 Name"
            onClick={copySource}
            data-source="p1-name"
          />
          <MenuItem
            icon={<Person />}
            text="Player 1 Score"
            onClick={copySource}
            data-source="p1-score"
          />
          <MenuItem
            icon={<Person />}
            text="Player 2"
            onClick={copySource}
            data-source="p2"
          />
          <MenuItem
            icon={<Person />}
            text="Player 2 Name"
            onClick={copySource}
            data-source="p2-name"
          />
          <MenuItem
            icon={<Person />}
            text="Player 2 Score"
            onClick={copySource}
            data-source="p2-score"
          />
        </MenuItem>
        <MenuItem icon={<MobileVideo />} text="Set">
          <MenuItem
            icon={<Layers />}
            text="Cards"
            onClick={copySource}
            data-source="cards-set"
          />
          <MenuItem
            icon={<Font />}
            text="Title"
            onClick={copySource}
            data-source="title-set"
          />
          <MenuItem
            icon={<People />}
            text="All Players"
            onClick={copySource}
            data-source="players-set"
          />
        </MenuItem>
      </MenuItem>

      <MenuItem icon={<Remove />} text="Remove Cab" onClick={removeCab} />
    </Menu>
  );

  return (
    <div id={cab.id}>
      <h1>
        {cab.name}{" "}
        <Popover content={sourcesMenu}>
          <Button minimal icon={<More />} />
        </Popover>{" "}
      </h1>
      <CurrentMatch cab={cab} />
      <CurrentSet cab={cab} />
    </div>
  );
}

const listFormatter = new Intl.ListFormat(detectedLanguage, {
  style: "short",
  type: "unit",
});

function CurrentMatch(props: { cab: CabInfo }) {
  const dispatch = useAppDispatch();
  const removeCab = useCallback(
    () =>
      dispatch(
        eventSlice.actions.assignMatchToCab({
          cabId: props.cab.id,
          matchId: null,
        }),
      ),
    [dispatch, props.cab.id],
  );
  const drawing = useAppState((s) => {
    if (!props.cab.activeMatch) return null;
    return s.drawings.entities[props.cab.activeMatch] || null;
  });

  if (!drawing) {
    return <p>No match</p>;
  }
  const filledPlayers = drawing.playerDisplayOrder.map((pIdx, idx) =>
    playerNameByIndex(drawing.meta, pIdx, `Player ${idx + 1}`),
  );
  const isMultiSetDraw = drawing.setId !== undefined;

  return (
    <Card elevation={2} style={{ position: "relative" }} compact interactive>
      <Button
        minimal
        small
        icon={<Cross />}
        style={{ position: "absolute", right: "0.5em", top: "0.5em" }}
        onClick={removeCab}
      />
      <h3>
        {isMultiSetDraw
          ? `${drawing.meta.title} [Set ${drawing.setNumber}/${drawing.totalSets}]`
          : drawing.meta.title}
      </h3>
      <p>{listFormatter.format(filledPlayers)}</p>
    </Card>
  );
}

function CurrentSet(props: { cab: CabInfo }) {
  const dispatch = useAppDispatch();
  const removeSet = useCallback(
    () =>
      dispatch(
        eventSlice.actions.assignSetToCab({
          cabId: props.cab.id,
          setId: null,
        }),
      ),
    [dispatch, props.cab.id],
  );

  const setSelector = useMemo(() => {
    return getSetSelector(props.cab.activeSet ?? undefined);
  }, [props.cab.activeSet]);
  const drawings = useAppState(setSelector);

  if (!drawings || drawings.length === 0) {
    return <p>No set</p>;
  }

  const filledPlayers = drawings[0].playerDisplayOrder.map((pIdx, idx) =>
    playerNameByIndex(drawings[0].meta, pIdx, `Player ${idx + 1}`),
  );

  return (
    <Card elevation={2} style={{ position: "relative" }} compact interactive>
      <Button
        variant="minimal"
        size="small"
        icon={<Cross />}
        style={{ position: "absolute", right: "0.5em", top: "0.5em" }}
        onClick={removeSet}
      />
      <h3>{drawings[0].meta.title}</h3>
      <p>{listFormatter.format(filledPlayers)}</p>
    </Card>
  );
}
