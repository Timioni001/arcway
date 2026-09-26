import { createListStore } from "./listStore";

/** Apps a visitor saved, kept in this browser. */
const store = createListStore("arcway:saved-apps");
export const getSaved = store.get;
export const getSavedServer = store.getServer;
export const toggleSaved = store.toggle;
export const subscribeSaved = store.subscribe;
