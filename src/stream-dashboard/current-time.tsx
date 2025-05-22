import { Duplicate } from "@blueprintjs/icons";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { useCallback, useState } from "react";
import { useAppDispatch, useAppState } from "../state/store";
import { eventSlice } from "../state/event.slice";
import { OverlayToaster } from "@blueprintjs/core";

export function UpNext() {
  const dispatch = useAppDispatch()
  const upNextTextState = useAppState((s) => s.event.streamDashboard.upNextText);
  const [upNextText, setUpNextText] = useState(upNextTextState)

  const [time, timezone] = useCurrentTime()

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(eventSlice.actions.updateUpNextText({ upNextText }))

    const toaster = await OverlayToaster.createAsync({ position: 'top' })
    toaster.show({
      message: '"Up Next" text updated.',
      intent: 'success',
      timeout: 5000,
    })
  }, [upNextText])

  const handleUpNextTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUpNextText(e.target.value)
  }, [])

  return (
    <form onSubmit={handleSubmit} style={{ minWidth: 500 }}>
      <h1>Up Next</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type='button'><Duplicate /></button>
          <div>{time} ({timezone})</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type='button'>
            <Duplicate />
          </button>
          <input type="text" value={upNextText} onChange={handleUpNextTextChange} style={{ display: 'inline-block' }} />
        </div>
        <div>
          <button>Save</button>
        </div>
      </div>
    </form >
  )
}