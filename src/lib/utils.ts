export function pickOne<T>(items: T[], seed: number): T {
  return items[seed % items.length];
}

export function rotate<T>(items: T[], count: number): T[] {
  return Array.from({ length: count }, (_, index) => items[index % items.length]);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncateForX(input: string, max = 280): string {
  if (input.length <= max) {
    return input;
  }

  return `${input.slice(0, max - 1).trimEnd()}…`;
}

export function capitalize(input: string): string {
  return `${input.charAt(0).toUpperCase()}${input.slice(1)}`;
}
