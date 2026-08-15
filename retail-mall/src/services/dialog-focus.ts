export const nextDialogFocusIndex = (
  length: number,
  current: number,
  shiftKey: boolean,
) => {
  if (!length) return -1;
  if (shiftKey) return current <= 0 ? length - 1 : current - 1;
  return current === length - 1 ? 0 : current + 1;
};

export type DialogKeyAction =
  | { type: "ignore" }
  | { type: "close" }
  | { type: "move"; index: number };

export const dialogKeyAction = (
  length: number,
  current: number,
  key: string,
  shiftKey = false,
): DialogKeyAction => {
  if (key === "Escape") return { type: "close" };
  if (key !== "Tab" || !length) return { type: "ignore" };
  return {
    type: "move",
    index: nextDialogFocusIndex(length, current, shiftKey),
  };
};
