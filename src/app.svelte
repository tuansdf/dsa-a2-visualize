<script lang="ts">
  import Maze from "/src/blind-path-finding/maze";
  import Robot from "/src/blind-path-finding/robot";
  import { Cell } from "/src/blind-path-finding/types";

  import Button from "/src/components/button.svelte";
  import Map from "/src/components/map.svelte";
  import Select from "/src/components/select.svelte";
  import {
    colOptions,
    paintOptions,
    rowOptions,
    timeOptions,
  } from "/src/utils/constants";
  import { createMap } from "/src/utils/map";

  let wait: number = timeOptions[timeOptions.length - 1].value;
  let mapRows: number = rowOptions[rowOptions.length - 1];
  let mapCols: number = colOptions[colOptions.length - 1];
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
    if (!robot || !maze) return;
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
      <div class="flex gap-4">
        <Select
          id="rows"
          label="Rows"
          bind:value={mapRows}
          options={rowOptions}
        />
        <Select
          id="cols"
          label="Cols"
          bind:value={mapCols}
          options={colOptions}
        />
      </div>
      <Select
        id="paint"
        label="Paint"
        bind:value={paintType}
        options={paintOptions}
      />
      <Select
        id="speed"
        label="Speed"
        bind:value={wait}
        options={timeOptions}
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
