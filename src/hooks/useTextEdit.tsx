import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import { useRef, useState } from "react";

export function useTextEdit() {
  const [value, setValue] = useState<string>("");
  const [title, setTitle] = useState<string>("Edit");
  const [isOpen, setIsOpen] = useState(false);
  const confirmRef = useRef<((newValue: string) => void) | undefined>();

  const open = (params: {
    initialValue?: string;
    title?: string;
    onConfirm?: (newValue: string) => void;
  }) => {
    setValue(params.initialValue ?? "");
    setTitle(params.title ?? "Edit");
    setIsOpen(true);
    confirmRef.current = params.onConfirm;
  };

  const handleClose = () => {
    setValue("");
    setTitle("Edit");
    setIsOpen(false);
    confirmRef.current = undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confirmRef.current?.(value);

    handleClose();
  };

  const editDialog = (
    <Dialog isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit}>
        <DialogBody>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
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
  );

  return [editDialog, open] as const;
}
