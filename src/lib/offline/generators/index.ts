import type { ActivityData, ActivityType } from '$lib/types/activity';
import type { OfflineGeneratorConfig } from '../types';
import { generateMath } from './math';
import { generateTracing } from './tracing';
import { generateCounting } from './counting';
import { generateMatching } from './matching';
import { generateNumberBonds } from './number-bonds';
import { generateHandwriting } from './handwriting';
import { generatePattern } from './pattern';
import { generateSpelling } from './spelling';
import { generateOddOneOut } from './odd-one-out';

type GeneratorFn = (config: OfflineGeneratorConfig) => ActivityData;

/** Registry of offline generators keyed by activity type */
export const GENERATOR_REGISTRY: ReadonlyMap<ActivityType, GeneratorFn> = new Map<
	ActivityType,
	GeneratorFn
>([
	['math', generateMath],
	['tracing', generateTracing],
	['counting', generateCounting],
	['matching', generateMatching],
	['number-bonds', generateNumberBonds],
	['handwriting', generateHandwriting],
	['pattern', generatePattern],
	['spelling', generateSpelling],
	['odd-one-out', generateOddOneOut]
]);

/** Activity types that can be generated offline */
export const OFFLINE_SUPPORTED_TYPES: ReadonlySet<ActivityType> = new Set(GENERATOR_REGISTRY.keys());

/** Substitutions for unsupported types when generating offline */
export const OFFLINE_SUBSTITUTIONS: ReadonlyMap<ActivityType, ActivityType> = new Map([
	['maze', 'pattern'],
	['coloring', 'tracing'],
	['connect-dots', 'counting'],
	['word-search', 'spelling'],
	['crossword', 'spelling'],
	['story-sequencing', 'matching'],
	['cut-and-paste', 'odd-one-out']
]);
