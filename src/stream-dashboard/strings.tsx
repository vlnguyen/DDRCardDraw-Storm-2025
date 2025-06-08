import React, { useCallback, useState } from "react";
import { Add, BanCircle, Duplicate, Edit } from "@blueprintjs/icons";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  HTMLSelect,
  OverlayToaster,
} from "@blueprintjs/core";

import { useAppDispatch, useAppState } from "../state/store";
import { eventSlice, StringSlug } from "../state/event.slice";
import { copyPlainTextToClipboard } from "../utils/share";

import styles from "./strings.css";

export function Strings() {
  const stringsState = useAppState((s) => s.event.streamDashboard.strings);

  const [strings, setStrings] = useState<StringSlug[]>(stringsState);
  const [editedSlug, setEditedSlug] = useState<{
    value: StringSlug;
    index: number;
  }>();

  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(eventSlice.actions.updateStrings(strings));

    const toaster = await OverlayToaster.createAsync({ position: "top" });
    toaster.show({
      message: "Strings updated.",
      intent: "success",
      timeout: 5000,
    });
  };

  const handleSubmitEditedSlug = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (editedSlug === undefined) {
        return;
      }

      const existingSlugs = stringsState
        .filter((_, i) => i !== editedSlug.index)
        .map((stringSlug) => stringSlug.slug);
      if (existingSlugs.includes(editedSlug.value.slug)) {
        const toaster = await OverlayToaster.createAsync({ position: "top" });
        toaster.show({
          message: `Error: Duplicate slug "${editedSlug.value.slug}"`,
          intent: "danger",
          timeout: 5000,
        });
        return;
      }

      const newStrings = strings.map((prevString, prevStringIndex) => {
        if (prevStringIndex === editedSlug.index) {
          return editedSlug.value;
        }
        return prevString;
      });
      setStrings(newStrings);
      dispatch(eventSlice.actions.updateStrings(newStrings));

      const toaster = await OverlayToaster.createAsync({ position: "top" });
      toaster.show({
        message: "Slug updated.",
        intent: "success",
        timeout: 5000,
      });

      setEditedSlug(undefined);
    },
    [dispatch, editedSlug, strings, stringsState],
  );

  const handleAddSlug = useCallback(async () => {
    const newStrings = [
      ...strings,
      { slug: `slug-${strings.length + 1}`, value: "" },
    ];
    setStrings(newStrings);
    dispatch(eventSlice.actions.updateStrings(newStrings));

    const toaster = await OverlayToaster.createAsync({ position: "top" });
    toaster.show({
      message: "Slug added.",
      intent: "success",
      timeout: 5000,
    });
  }, [strings, dispatch]);

  const handleDeleteSlug = useCallback(
    (slugIndex: number) => {
      return async () => {
        const newStrings = strings.filter(
          (_, currentIndex) => currentIndex !== slugIndex,
        );
        setStrings(newStrings);
        dispatch(eventSlice.actions.updateStrings(newStrings));

        const toaster = await OverlayToaster.createAsync({ position: "top" });
        toaster.show({
          message: "Slug deleted.",
          intent: "success",
          timeout: 5000,
        });
      };
    },
    [strings, dispatch],
  );

  const handleSlugEdited = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const alphanumericValue = inputValue
      .replace(/[^a-zA-Z0-9-]/g, "")
      .toLowerCase();
    setEditedSlug((prevEditedSlug) => {
      if (prevEditedSlug === undefined) {
        return undefined;
      }
      return {
        ...prevEditedSlug,
        value: {
          ...prevEditedSlug.value,
          slug: alphanumericValue,
        },
      };
    });
  };

  const handleStretchEdited = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditedSlug((prevEditedSlug) => {
      const selectValue = e.target.value as "none" | "dialog" | "title";
      if (prevEditedSlug === undefined) {
        return undefined;
      }

      return {
        ...prevEditedSlug,
        value: {
          ...prevEditedSlug.value,
          stretch: selectValue === "none" ? undefined : selectValue,
        },
      };
    });
  };

  const handleValueChange = useCallback((stringIndex: number) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setStrings((prevStrings) =>
        prevStrings.map((currentString, currentStringIndex) => {
          if (currentStringIndex === stringIndex) {
            return {
              ...currentString,
              value: e.target.value,
            };
          }
          return currentString;
        }),
      );
    };
  }, []);

  const handleCopyStreamStringSource = useCallback(
    (stringIndex: number) => {
      return async () => {
        const slug = strings[stringIndex].slug;
        if (!slug) {
          return;
        }

        const sourcePath = `${window.location.pathname}/source/string/${slug}`;
        const sourceUrl = new URL(sourcePath, window.location.href);
        copyPlainTextToClipboard(sourceUrl.href);

        const toaster = await OverlayToaster.createAsync({ position: "top" });
        toaster.show({
          message: `String "${slug}" copied to clipboard.`,
          intent: "success",
          timeout: 5000,
        });
      };
    },
    [strings],
  );

  return (
    <>
      <form style={{ minWidth: 800 }} onSubmit={handleSubmit}>
        <h1>Strings</h1>
        <div className={styles.strings}>
          {strings.map((currentStringSlug, index) => (
            <React.Fragment key={index}>
              <div className={styles.slug}>
                {currentStringSlug.slug}{" "}
                <Button
                  type="button"
                  onClick={handleCopyStreamStringSource(index)}
                  tabIndex={-1}
                >
                  <Duplicate />
                </Button>{" "}
                <Button
                  type="button"
                  onClick={handleDeleteSlug(index)}
                  tabIndex={-1}
                >
                  <BanCircle />
                </Button>{" "}
                <Button
                  type="button"
                  onClick={() =>
                    setEditedSlug({ value: currentStringSlug, index })
                  }
                  tabIndex={-1}
                >
                  <Edit />
                </Button>
              </div>
              <input
                value={currentStringSlug.value}
                onChange={handleValueChange(index)}
              />
            </React.Fragment>
          ))}
        </div>
        <div>
          <b>
            Add Slug{" "}
            <Button type="button" onClick={handleAddSlug} tabIndex={-1}>
              <Add />
            </Button>
          </b>
        </div>
        <div>
          <Button type="submit" tabIndex={-1}>
            Save
          </Button>
        </div>
      </form>
      <Dialog
        isOpen={editedSlug !== undefined}
        isCloseButtonShown={false}
        onClose={() => {
          setEditedSlug(undefined);
        }}
        title="Edit Slug"
      >
        <form onSubmit={handleSubmitEditedSlug}>
          <DialogBody>
            <p>
              URL slugs may only contain alphanumeric characters and dashes.
            </p>
            <input
              value={editedSlug?.value.slug}
              onChange={handleSlugEdited}
              autoFocus
            />
            <p>Text stretching:</p>
            <HTMLSelect
              value={editedSlug?.value.stretch}
              onChange={handleStretchEdited}
            >
              <option key="none" value="none">
                None
              </option>
              <option key="dialog" value="dialog">
                Dialog
              </option>
              <option key="title" value="title">
                Title
              </option>
            </HTMLSelect>
          </DialogBody>
          <DialogFooter
            minimal
            actions={
              <Button type="submit" tabIndex={-1}>
                Submit
              </Button>
            }
          />
        </form>
      </Dialog>
    </>
  );
}
