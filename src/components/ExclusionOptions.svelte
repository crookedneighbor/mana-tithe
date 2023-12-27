<script lang="ts">
	import CheckboxInput from './CheckboxInput.svelte';

	export let ignoreBasicLands: boolean;
	export let excludeGoldBordered: boolean;
	export let excludeOversized: boolean;
</script>

<CheckboxInput
	id="ignore-basic-lands"
	label="Ignore Price of Basic Lands"
	bind:checked={ignoreBasicLands}
/>
<CheckboxInput
	id="exclude-gold-border"
	label="Exclude Gold Bordered Prints"
	bind:checked={excludeGoldBordered}
/>
<CheckboxInput
	id="exclude-oversized"
	label="Exclude Oversized Prints"
	bind:checked={excludeOversized}
/>
