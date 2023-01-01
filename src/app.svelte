<script lang="ts">
  import clsx from "clsx";

  import Maze, { Cell } from "/src/blind-path-finding/maze";
  import Robot from "/src/blind-path-finding/robot";
  import Button from "/src/components/button.svelte";

  const MAX_ROWS = 30;
  const MAX_COLS = 60;
  const MIN_ROWS = 5;
  const MIN_COLS = 5;

  let mapRows = 30;
  let mapCols = 60;

  let robotRow = 1;
  let robotCol = 1;

  let robotExist = false;
  let gateExist = false;

  let paintType: Cell = Cell.WALL;

  let started = false;

  let maze: Maze;

  $: console.log(mapRows);

  $: map = (() => {
    const rows = mapRows || MIN_ROWS;
    const cols = mapCols || MIN_COLS;

    const tmp: Cell[][] = new Array(rows);

    tmp[0] = new Array(cols).fill(Cell.WALL);
    tmp[rows - 1] = new Array(cols).fill(Cell.WALL);

    for (let i = 1; i < rows - 1; i++) {
      tmp[i] = new Array(cols).fill(Cell.SPACE);

      tmp[i][0] = Cell.WALL;
      tmp[i][cols - 1] = Cell.WALL;
    }

    return tmp;
  })();

  const updateMap = (row: number, col: number) => {
    if (row === 0 || row === mapRows - 1 || col === 0 || col === mapCols - 1)
      return;

    let toPaint: Cell = Cell.WALL;
    let currentCell = map[row][col];

    if (currentCell === Cell.ROBOT) {
      robotExist = false;
    }
    if (currentCell === Cell.GATE) {
      gateExist = false;
    }

    if (paintType === Cell.ROBOT) {
      if (currentCell === Cell.ROBOT) {
        toPaint = Cell.SPACE;
      } else {
        if (robotExist) return;
        robotCol = col;
        robotRow = row;
        toPaint = Cell.ROBOT;
        robotExist = true;
      }
    } else if (paintType === Cell.GATE) {
      if (currentCell === Cell.GATE) {
        toPaint = Cell.SPACE;
      } else {
        if (gateExist) return;
        toPaint = Cell.GATE;
        gateExist = true;
      }
    } else if (paintType === Cell.WALL) {
      if (currentCell === Cell.WALL) {
        toPaint = Cell.SPACE;
      } else {
        toPaint = Cell.WALL;
      }
    }

    map[row][col] = toPaint;
  };

  const start = () => {
    if (started) {
      started = false;
    } else {
      started = true;
      maze = new Maze(map, robotRow, robotCol);
      new Robot(maze).navigate();
    }
  };
</script>

<main
  class="min-h-screen flex flex-col bg-neutral-100 justify-center items-center"
>
  <div class="flex gap-8 fixed top-8 items-center mb-4">
    <div class="flex gap-4">
      <div>
        <label for="rows">Rows (max: {MAX_ROWS})</label>
        <input
          type="number"
          id="rows"
          max={MAX_ROWS}
          min={MIN_COLS}
          class="w-32 p-1.5 border-rose-500 border-2 rounde"
          bind:value={mapRows}
        />
      </div>
      <div>
        <label for="cols">Cols: (max: {MAX_COLS})</label>
        <input
          type="number"
          id="cols"
          max={MAX_COLS}
          min={MIN_COLS}
          class="w-32 p-1.5 border-rose-500 border-2 rounde"
          bind:value={mapCols}
        />
      </div>
    </div>
    <div class="flex gap-2">
      <Button on:click={() => (paintType = Cell.WALL)}>Wall</Button>
      <Button on:click={() => (paintType = Cell.GATE)}>Gate</Button>
      <Button on:click={() => (paintType = Cell.ROBOT)}>Robot</Button>
    </div>
    <div class="flex gap-2">
      Active:
      <div
        class={clsx(
          {
            "bg-red-300": paintType === Cell.WALL,
            "bg-blue-300": paintType === Cell.GATE,
            "bg-green-400": paintType === Cell.ROBOT,
          },
          "border rounded-sm border-black w-6 h-6"
        )}
      />
    </div>

    <Button on:click={start}>{started ? "Reset" : "Start"}</Button>
  </div>

  <div class="grid gap-[1px] mt-16">
    {#each started ? maze.mapPublic : map as row, i}
      <div class="flex border-collapse gap-[1px]">
        {#each row as cell, j}
          <div
            on:keypress={() => {}}
            on:click={() => updateMap(i, j)}
            class={clsx(
              {
                "bg-red-300": cell === Cell.WALL,
                "bg-blue-300": cell === Cell.GATE,
                "bg-green-300": cell === Cell.PATH,
                "bg-green-400": cell === Cell.ROBOT,
                "hover:bg-neutral-200": cell === Cell.SPACE,
                "hover:opacity-90": cell !== Cell.SPACE,
              },
              "border rounded-sm border-black cursor-pointer w-6 h-6"
            )}
          />
        {/each}
      </div>
    {/each}
  </div>
</main>
