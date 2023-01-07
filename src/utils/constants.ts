import { Cell } from "/src/blind-path-finding/types";

export const rowOptions = [10, 20, 30];
export const colOptions = [10, 20, 30, 40, 50];
export const timeOptions = [
  {
    label: "Very Fast",
    value: 1,
  },
  {
    label: "Fast",
    value: 10,
  },
  {
    label: "Slow",
    value: 20,
  },
  {
    label: "Very Slow",
    value: 40,
  },
];
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
