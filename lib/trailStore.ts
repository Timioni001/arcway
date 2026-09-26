import { createListStore } from "./listStore";

/** Trail steps marked done, as "trailId:stepId". Self-reported, this browser only. */
export const trailStore = createListStore("arcway:trail-steps");
