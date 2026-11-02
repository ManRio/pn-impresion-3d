export type CategoryOption = {
  id: string;
  name: string;
  parentId: string | null;
};
export function categoryGroups<T extends CategoryOption>(
  categories: T[],
): { root: T; children: T[] }[] {
  const roots = categories.filter((category) => category.parentId === null);

  return roots.map((root) => ({
    root,
    children: categories.filter((category) => category.parentId === root.id),
  }));
}
export function slugifyCategory(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
