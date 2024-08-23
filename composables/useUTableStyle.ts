export function useUTableStyle() {
  const tableStyle = {
    wrapper: 'h-full',
    thead: 'sticky top-0 z-10',
    th: {
      base: 'sticky top-0 m-0 bg-gray-200 dark:bg-gray-800 !p-2',
      font: 'font-semibold text-sm text-gray-700 dark:text-gray-300',
    },
    tr: {
      base: '[&>td:first-child]:max-w-28 whitespace-nowrap hover:bg-primary-50 dark:hover:bg-gray-700',
    },
    tbody: '[&>tr:not(:only-child):last-child]:border-b',
    td: {
      padding: 'p-1',
      font: 'text-sm text-gray-700 dark:text-gray-200',
    },
  };

  return {
    tableStyle,
  };
}