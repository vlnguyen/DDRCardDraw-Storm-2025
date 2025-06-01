import React, { useCallback, useState } from "react";
import { useAppDispatch, useAppState } from "../state/store";
import { eventSlice, StringSlug } from "../state/event.slice";

import styles from "./strings.css";
import { Add, BanCircle, Duplicate, Edit } from "@blueprintjs/icons";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  OverlayToaster,
} from "@blueprintjs/core";
import { copyPlainTextToClipboard } from "../utils/share";

export function Strings() {
  const stringsState = useAppState((s) => s.event.streamDashboard.strings);
  const existingSlugs = (stringsState ?? []).map(
    (stringSlug) => stringSlug.slug,
  );

  const [strings, setStrings] = useState<StringSlug[]>(stringsState);
  const [editedSlug, setEditedSlug] = useState<{
    slug: string;
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

      if (existingSlugs.includes(editedSlug.slug)) {
        const toaster = await OverlayToaster.createAsync({ position: "top" });
        toaster.show({
          message: `Error: Duplicate slug "${editedSlug.slug}"`,
          intent: "danger",
          timeout: 5000,
        });
        return;
      }

      const newStrings = strings.map((prevString, prevStringIndex) => {
        if (prevStringIndex === editedSlug.index) {
          return {
            ...prevString,
            slug: editedSlug.slug,
          };
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
    [dispatch, editedSlug, existingSlugs, strings],
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
        slug: alphanumericValue,
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
          {strings.map(({ slug, value }, index) => (
            <React.Fragment key={index}>
              <div className={styles.slug}>
                {slug}{" "}
                <button
                  type="button"
                  onClick={handleCopyStreamStringSource(index)}
                  tabIndex={-1}
                >
                  <Duplicate />
                </button>{" "}
                <button
                  type="button"
                  onClick={handleDeleteSlug(index)}
                  tabIndex={-1}
                >
                  <BanCircle />
                </button>{" "}
                <button
                  type="button"
                  onClick={() => setEditedSlug({ slug, index })}
                  tabIndex={-1}
                >
                  <Edit />
                </button>
              </div>
              <input value={value} onChange={handleValueChange(index)} />
            </React.Fragment>
          ))}
        </div>
        <div>
          <b>
            Add Slug{" "}
            <button type="button" onClick={handleAddSlug} tabIndex={-1}>
              <Add />
            </button>
          </b>
        </div>
        <div>
          <button tabIndex={-1}>Save</button>
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
              value={editedSlug?.slug}
              onChange={handleSlugEdited}
              autoFocus
            />
          </DialogBody>
          <DialogFooter
            minimal
            actions={
              <button type="submit" tabIndex={-1}>
                Submit
              </button>
            }
          />
        </form>
      </Dialog>
    </>
  );
}
