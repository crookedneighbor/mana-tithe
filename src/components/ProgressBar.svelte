<script>
	import { fade } from 'svelte/transition';

	/**
	 * @typedef {Object} Props
	 * @property {number} [progress]
	 * @property {number} [maxProgress]
	 */

	/** @type {Props} */
	let { progress = 0, maxProgress = 0 } = $props();
</script>

<div class="progress-bar-container" transition:fade={{ duration: 300 }}>
	<progress max={maxProgress} value={progress}></progress>
</div>

<style lang="postcss">
	.progress-bar-container {
		@apply rounded-md overflow-hidden h-4;
	}

	progress {
		@apply w-full h-6;
	}

	progress[value]::-webkit-progress-bar {
		@apply bg-stone-200;
	}

	progress[value]::-webkit-progress-value {
		transition: width 1s;
		@apply bg-action;
	}

	progress[value]::-moz-progress-bar {
		@apply bg-action;
	}
</style>
