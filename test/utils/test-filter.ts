export const getTestFilter = (): string | undefined => {
  const args = process.argv;
  const filterIndex = args.findIndex((arg) => arg === '--filter');
  if (filterIndex !== -1 && filterIndex + 1 < args.length) {
    return args[filterIndex + 1];
  }
  return process.env.TEST_FILTER;
};

export const applyFilter = <T extends { name?: string; category?: string; id?: string }>(
  items: T[],
  filter?: string
): T[] => {
  if (!filter) return items;

  const lowerFilter = filter.toLowerCase();
  return items.filter(
    (item) =>
      (item.name && item.name.toLowerCase().includes(lowerFilter)) ||
      (item.category && item.category.toLowerCase().includes(lowerFilter)) ||
      (item.id && item.id.toLowerCase().includes(lowerFilter))
  );
};

export const logFilterInfo = <T extends { name?: string; id?: string }>(
  filter: string | undefined,
  originalItems: T[],
  filteredItems: T[],
  itemType: string = 'items'
): void => {
  if (filter) {
    console.log(`🔍 Filter applied: "${filter}"`);
    console.log(`📋 Found ${filteredItems.length}/${originalItems.length} matching ${itemType}`);
  }
};
