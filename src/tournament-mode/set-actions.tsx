import { Button, Menu, MenuItem, Popover, Tooltip } from "@blueprintjs/core";
import { CubeAdd, Trash } from "@blueprintjs/icons";

import { EventModeGated } from "../common-components/app-mode";
import { eventSlice } from "../state/event.slice";
import { useDrawing } from "../drawing-context";
import { useCallback, useMemo } from "react";
import { drawingsSlice, getSetSelector } from "../state/drawings.slice";
import { useAppDispatch, useAppState } from "../state/store";

export function SetActions() {
  const dispatch = useAppDispatch()
  const cabs = useAppState(eventSlice.selectors.allCabs);
  const setId = useDrawing(d => d.setId)
  const setNumber = useDrawing(d => d.setNumber)

  const setSelector = useMemo(() => {
    return getSetSelector(setId)
  }, [setId]);
  const drawings = useAppState(setSelector)

  const handleDeleteSet = useCallback(() => {
    if (!drawings) {
      return
    }
    const drawingIds = drawings.map(d => d.id)
    for (const drawingId of drawingIds) {
      dispatch(drawingsSlice.actions.removeOne(drawingId))
    }
  }, [drawings])

  return (
    <>
      {setId && setNumber === 1 && (
        <>
          <div>
            <Tooltip content="Delete this set">
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
            <EventModeGated>
              {!!cabs.length && (
                <Tooltip content="Assign Set to Cab">
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
          </div>
        </>
      )}
    </>
  )
}