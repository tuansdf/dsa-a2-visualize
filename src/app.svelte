<script lang="ts">
  import Maze from "/src/blind-path-finding/maze";
  import Robot from "/src/blind-path-finding/robot";
  import { Cell } from "/src/blind-path-finding/types";

  import Button from "/src/components/button.svelte";
  import Map from "/src/components/map.svelte";
  import Select from "/src/components/select.svelte";
  import { paintOptions } from "/src/utils/constants";
  import { createMap } from "/src/utils/map";

  let wait: number = 100;
  let mapRows: number = 20;
  let mapCols: number = 20;
  let paintType: Cell = Cell.WALL;

  let robotRow: number | undefined;
  let robotCol: number | undefined;

  let map: Cell[][];
  let steps: number = 0;

  let started: boolean = false;
  let running: boolean = false;
  let errorMessage: string | undefined;

  $: {
    removeRobot();
    map = createMap(mapRows, mapCols);
  }
  $: {
    if (wait) robotGo();
  }

  function isRobotExist() {
    return robotCol && robotRow;
  }
  function removeRobot() {
    robotCol = undefined;
    robotRow = undefined;
  }

  function paintMap(row: number, col: number) {
    if (
      row === 0 ||
      row === mapRows - 1 ||
      col === 0 ||
      col === mapCols - 1 ||
      running
    ) {
      return;
    }

    let toPaint: Cell = Cell.WALL;
    let currentCell = map[row][col];

    if (currentCell === Cell.ROBOT) {
      removeRobot();
    }

    if (paintType === Cell.ROBOT) {
      if (currentCell === Cell.ROBOT) {
        toPaint = Cell.SPACE;
      } else {
        if (isRobotExist()) return;
        robotCol = col;
        robotRow = row;
        toPaint = Cell.ROBOT;
      }
    } else if (paintType === Cell.GATE) {
      if (currentCell === Cell.GATE) {
        toPaint = Cell.SPACE;
      } else {
        toPaint = Cell.GATE;
      }
    } else if (paintType === Cell.WALL) {
      if (currentCell === Cell.WALL) {
        toPaint = Cell.SPACE;
      } else {
        toPaint = Cell.WALL;
      }
    }

    map[row][col] = toPaint;
  }

  let interval: number;
  let robot: Robot;
  let maze: Maze;

  function robotGo() {
    if (!robot || !maze || !started) return;
    clearInterval(interval);
    interval = setInterval(() => {
      if (!robot.go()) {
        running = false;
      }

      steps = maze.steps;
      map = maze.mutMap;
    }, wait);
  }
  function startRun() {
    if (running) return;
    if (started) {
      robotGo();
      running = true;
      return;
    }

    steps = 0;

    // no robot on the map
    if (!isRobotExist()) {
      errorMessage = "Must have one robot";
      return;
    }

    errorMessage = undefined;
    started = true;
    running = true;

    maze = new Maze(map, robotRow, robotCol);
    robot = new Robot(maze);
    robotGo();
  }
  function stopRun() {
    running = false;
    clearInterval(interval);
    return;
  }
  function resetRun() {
    running = false;
    started = false;
    steps = 0;
    removeRobot();
    map = createMap(mapRows, mapCols);
    clearInterval(interval);
  }
</script>

<main class="min-h-screen flex gap-16 justify-start items-center">
  <!-- controll board -->
  <div class="flex-none space-y-6 ml-16 w-40">
    <div class="space-y-4">
      <div>
        <label for="rows">Rows</label>
        <input
          id="rows"
          class="w-full"
          bind:value={mapRows}
          type="range"
          min="5"
          max="30"
        />
      </div>
      <div>
        <label for="cols">Cols</label>
        <input
          id="cols"
          class="w-full"
          bind:value={mapCols}
          type="range"
          min="5"
          max="40"
        />
      </div>
      <div>
        <label for="speed">Speed</label>
        <input
          id="speed"
          class="w-full"
          dir="rtl"
          bind:value={wait}
          type="range"
          min="1"
          max="200"
        />
      </div>
      <Select
        id="paint"
        label="Paint"
        bind:value={paintType}
        options={paintOptions}
      />
    </div>

    <Button on:click={() => (running ? stopRun() : startRun())}
      >{running ? "Stop" : "Start"}</Button
    >
    <Button on:click={resetRun}>Reset</Button>
    {#if running}
      <div>
        Steps: {steps}
      </div>
    {/if}
    {#if errorMessage}
      <div class="text-red-500">{errorMessage}</div>
    {/if}
  </div>

  <div class="flex-1 flex justify-center items-center">
    <Map {map} {paintMap} />
  </div>
</main>
