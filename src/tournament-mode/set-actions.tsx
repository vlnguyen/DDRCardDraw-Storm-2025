import { Button, Menu, MenuItem, Popover, Tooltip } from "@blueprintjs/core";
import { BanCircle, CubeAdd, Edit, Trash } from "@blueprintjs/icons";

import { EventModeGated } from "../common-components/app-mode";
import { eventSlice } from "../state/event.slice";
import { useDrawing } from "../drawing-context";
import { useCallback, useMemo } from "react";
import { drawingsSlice, getSetSelector } from "../state/drawings.slice";
import { useAppDispatch, useAppState } from "../state/store";
import { PlayerListMenuItems } from "../song-card/icon-menu";
import { useTextEdit } from "../hooks/useTextEdit";

export function SetActions() {
  const dispatch = useAppDispatch();
  const [editDialog, openEditDialog] = useTextEdit();

  const drawingId = useDrawing((d) => d.id);
  const cabs = useAppState(eventSlice.selectors.allCabs);
  const setId = useDrawing((d) => d.setId);
  const setNumber = useDrawing((d) => d.setNumber);
  const setBannedBy = useDrawing((d) => d.setBannedBy);
  const meta = useDrawing((d) => d.meta);

  const setSelector = useMemo(() => {
    return getSetSelector(setId);
  }, [setId]);
  const drawings = useAppState(setSelector);

  const handleDeleteSet = useCallback(() => {
    if (!drawings) {
      return;
    }
    const drawingIds = drawings.map((d) => d.id);
    for (const drawingId of drawingIds) {
      dispatch(drawingsSlice.actions.removeOne(drawingId));
    }
  }, [drawings, dispatch]);

  return (
    <div>
      {(!setId || setNumber === 1) && (
        <Tooltip content="Rename this match" position="top">
          <Button
            variant="minimal"
            icon={<Edit />}
            onClick={() =>
              openEditDialog({
                title: "Rename this match",
                initialValue: meta.title,
                onConfirm: (title) =>
                  dispatch(
                    drawingsSlice.actions.setMetaTitle({
                      drawingId,
                      title: title,
                    }),
                  ),
              })
            }
          />
        </Tooltip>
      )}
      {setNumber && (
        <>
          {setBannedBy === undefined && (
            <Tooltip content="Veto this set" position="top">
              <Popover
                position="bottom"
                content={
                  <Menu>
                    <PlayerListMenuItems
                      onClick={(playerIdx) => {
                        dispatch(
                          drawingsSlice.actions.setSetBannedBy({
                            drawingId: drawingId,
                            setBannedBy: playerIdx,
                          }),
                        );
                      }}
                    />
                  </Menu>
                }
              >
                <Button variant="minimal" icon={<BanCircle />} />
              </Popover>
            </Tooltip>
          )}
          {setId && setNumber === 1 && (
            <>
              <EventModeGated>
                {!!cabs.length && (
                  <Tooltip content="Assign Set to Cab" position="top">
                    <Popover
                      placement="bottom"
                      content={
                        <Menu>
                          {cabs.map((cab) => (
                            <MenuItem
                              key={cab.id}
                              text={cab.name}
                              onClick={() =>
                                dispatch(
                                  eventSlice.actions.assignSetToCab({
                                    cabId: cab.id,
                                    setId: setId ?? null,
                                  }),
                                )
                              }
                            />
                          ))}
                        </Menu>
                      }
                    >
                      <Button variant="minimal" icon={<CubeAdd />} />
                    </Popover>
                  </Tooltip>
                )}
              </EventModeGated>
              <Tooltip content="Delete this set" position="top">
                <Button
                  variant="minimal"
                  icon={<Trash />}
                  onClick={() =>
                    confirm(
                      "This set will be permanently removed and cannot be recovered!",
                    ) && handleDeleteSet()
                  }
                />
              </Tooltip>
            </>
          )}
        </>
      )}
      {editDialog}
    </div>
  );
}
