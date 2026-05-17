import type { QueueItem } from "../types.js";

const blockedPhrases = ["guaranteed viral", "follow for follow", "DM me now", "easy money fast"];

export function passesQualityFilter(item: QueueItem): boolean {
  const text = item.text.toLowerCase();

  if (blockedPhrases.some((phrase) => text.includes(phrase))) {
    return false;
  }

  if (item.visibilityRisk >= 45) {
    return false;
  }

  if ((item.text.match(/\?/g) ?? []).length > 2) {
    return false;
  }

  if ((item.text.match(/https?:\/\//g) ?? []).length > 1) {
    return false;
  }

  return true;
}

export function diversifyQueue(items: QueueItem[]): QueueItem[] {
  const result: QueueItem[] = [];
  const pending = [...items];

  while (pending.length > 0) {
    const previous = result.at(-1);
    const nextIndex = pending.findIndex((candidate) => {
      if (!previous) return true;
      return (
        candidate.format !== previous.format &&
        candidate.topicCluster !== previous.topicCluster &&
        !(candidate.offerName && previous.offerName)
      );
    });

    const index = nextIndex === -1 ? 0 : nextIndex;
    result.push(pending.splice(index, 1)[0]);
  }

  return result;
}
