<script lang="ts">
	import CheckboxInput from './CheckboxInput.svelte';

	interface Props {
		ignoreBasicLands: boolean;
		ignoreTokens: boolean;
		excludeGoldBordered: boolean;
		excludeOversized: boolean;
	}

	let {
		ignoreBasicLands = $bindable(),
		ignoreTokens = $bindable(),
		excludeGoldBordered = $bindable(),
		excludeOversized = $bindable()
	}: Props = $props();
</script>

<CheckboxInput
	id="ignore-basic-lands"
	label="Ignore Price of Basic Lands"
	bind:checked={ignoreBasicLands}
/>
<CheckboxInput id="ignore-tokens" label="Ignore Price of Tokens" bind:checked={ignoreTokens} />
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
