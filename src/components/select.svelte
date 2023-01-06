<script lang="ts">
  export let id: string;
  export let label: string;
  export let value: string | number;
  export let options:
    | { label: string; value: string | number }[]
    | (string | number)[];
</script>

<div class="w-full flex flex-col gap-1">
  <label for={id}>{label}</label>
  <select bind:value {id} class="p-1.5 border-2 rounded">
    {#each options as option}
      <option value={typeof option === "object" ? option.value : option}>
        {typeof option === "object" ? option.label : option}
      </option>
    {/each}
  </select>
</div>
