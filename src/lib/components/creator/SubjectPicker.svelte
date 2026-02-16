<script lang="ts">
	import type { Subject } from '$lib/types/activity';
	import { generationState } from '$lib/state/generation.svelte';

	interface SubjectOption {
		id: Subject;
		name: string;
		gradient: string;
		ring: string;
		icon: string;
	}

	const subjects: SubjectOption[] = [
		{
			id: 'math',
			name: 'Math',
			gradient: 'from-blue-400 to-blue-600',
			ring: 'ring-blue-400',
			icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
		},
		{
			id: 'english',
			name: 'English',
			gradient: 'from-emerald-400 to-emerald-600',
			ring: 'ring-emerald-400',
			icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
		},
		{
			id: 'hindi',
			name: 'Hindi',
			gradient: 'from-orange-400 to-orange-600',
			ring: 'ring-orange-400',
			icon: 'M3 5h18M3 5v2m0-2h4m14 0v2m0-2h-4M7 5v2m0 0h10M7 7v4m10-4v4M7 11h10M7 11v4m10-4v4M7 15h10M12 7v12'
		},
		{
			id: 'science',
			name: 'Science',
			gradient: 'from-purple-400 to-purple-600',
			ring: 'ring-purple-400',
			icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
		},
		{
			id: 'art',
			name: 'Art',
			gradient: 'from-pink-400 to-pink-600',
			ring: 'ring-pink-400',
			icon: 'M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z'
		},
		{
			id: 'logic',
			name: 'Logic',
			gradient: 'from-teal-400 to-teal-600',
			ring: 'ring-teal-400',
			icon: 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.95 3.033 2.08 4.044m4.24-4.387v0a.64.64 0 00.657.643 48.39 48.39 0 004.163-.3c-.186 1.613-.95 3.033-2.08 4.044M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3 9a9 9 0 110-18 9 9 0 010 18z'
		},
		{
			id: 'motor',
			name: 'Motor Skills',
			gradient: 'from-amber-400 to-amber-600',
			ring: 'ring-amber-400',
			icon: 'M10.05 4.575a1.575 1.575 0 10-3.15 0v3.15a3.15 3.15 0 01-1.575 2.726V12.6a3.15 3.15 0 001.575 2.726v2.099a1.575 1.575 0 003.15 0v-2.1a3.15 3.15 0 001.575-2.725V10.45a3.15 3.15 0 00-1.575-2.725V4.575zM17.1 4.575a1.575 1.575 0 00-3.15 0v3.15a3.15 3.15 0 00-1.575 2.726V12.6a3.15 3.15 0 001.575 2.726v2.099a1.575 1.575 0 003.15 0'
		}
	];

	function selectSubject(subject: Subject) {
		generationState.setSubject(subject);
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold text-gray-900 font-display">Choose a Subject</h2>
		<p class="text-gray-500 mt-1">Pick the subject area for your worksheet</p>
	</div>

	<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
		{#each subjects as subject}
			{@const isSelected = generationState.config.subject === subject.id}
			<button
				class="relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer
					{isSelected
					? `border-transparent ring-4 ${subject.ring} shadow-lg scale-[1.02]`
					: 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5'}"
				onclick={() => selectSubject(subject.id)}
			>
				<!-- Icon container with gradient background -->
				<div
					class="w-16 h-16 rounded-2xl bg-gradient-to-br {subject.gradient} flex items-center justify-center shadow-sm"
				>
					<svg
						class="w-8 h-8 text-white"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d={subject.icon} />
					</svg>
				</div>

				<!-- Label -->
				<span class="text-sm font-semibold text-gray-800">{subject.name}</span>

				<!-- Selected checkmark badge -->
				{#if isSelected}
					<div
						class="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center"
					>
						<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>
