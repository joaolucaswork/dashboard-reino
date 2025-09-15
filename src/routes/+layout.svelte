<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import DashboardLayout from "$lib/components/DashboardLayout.svelte";
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<DashboardLayout>
  {@render children?.()}
</DashboardLayout>
