import { Cell } from "/src/blind-path-finding/types";

export const paintOptions = [
  {
    label: "Wall",
    value: Cell.WALL,
  },
  {
    label: "Gate",
    value: Cell.GATE,
  },
  {
    label: "Robot",
    value: Cell.ROBOT,
  },
];
