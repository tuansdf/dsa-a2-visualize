<script lang="ts">
  import clsx from "clsx";
  import { Cell } from "/src/blind-path-finding/types";

  export let paintMap: (row: number, col: number) => void;
  export let map: Cell[][];
</script>

<div class="grid gap-[1px]">
  {#each map as row, i}
    <div class="flex border-collapse gap-[1px]">
      {#each row as cell, j}
        <div
          on:keypress={() => {}}
          on:click={() => paintMap(i, j)}
          class={clsx(
            {
              "bg-red-300": cell === Cell.WALL,
              "bg-blue-300": cell === Cell.GATE,
              "bg-green-200": cell === Cell.PATH,
              "bg-green-400": cell === Cell.ROBOT,
              "bg-yellow-300": cell === Cell.CROSS,
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
