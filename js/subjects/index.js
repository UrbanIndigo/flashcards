/**
 * The subjects the app can study.
 *
 * A subject owns everything specific to its material: which cards exist, how
 * one is worded, what counts as an answer, and which settings apply to it.
 * The app owns the parts that are the same whatever you are learning — the
 * queue, the schedule, the day's allowance and the recap.
 *
 * Each subject also names its own storage keys, so histories never collide
 * and adding a subject cannot disturb one already in use.
 */

import { french } from './french.js';
import { flags } from './flags.js';

export const SUBJECTS = [french, flags];

export const subjectById = (id) => SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[0];
