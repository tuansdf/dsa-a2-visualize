import type { Direction } from "./types";

export default class Branch {
  private _direction: Direction;
  private _end: boolean;

  constructor(direction: Direction) {
    this._direction = direction;
    this._end = false;
  }

  get direction(): Direction {
    return this._direction;
  }
  set direction(direction: Direction) {
    this._direction = direction;
  }
  get end(): boolean {
    return this._end;
  }
  set end(end: boolean) {
    this._end = end;
  }
}
