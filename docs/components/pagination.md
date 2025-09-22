# Pagination Component Documentation

## Overview

The Pagination component provides a complete pagination solution for the Salesforce portfolios (carteiras) section in the `/tabelas` page. It follows shadcn/ui design patterns and provides configurable page sizes with intuitive navigation controls.

## Features

- ✅ **Configurable Page Size**: Default 3 records per page, configurable via buttons
- ✅ **Page Size Options**: 3, 5, 10, 20, 50 items per page
- ✅ **Navigation Controls**: First, Previous, Next, Last page buttons
- ✅ **Page Numbers**: Shows current page and nearby pages for easy navigation
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Accessibility**: Proper ARIA labels and keyboard navigation
- ✅ **TypeScript Support**: Fully typed with proper interfaces

## Implementation

### Component Location
- **Pagination Component**: `src/lib/components/ui/pagination/pagination.svelte`
- **Implementation**: `src/lib/components/tabelas/TabelaCarteirasSalesforce.svelte`
- **Page**: `/tabelas` (`src/routes/tabelas/+page.svelte`)

### Usage Example

```svelte
<script lang="ts">
  import { Pagination } from "$lib/components/ui/pagination";
  
  let currentPage = $state(0);
  let pageSize = $state(3);
  let totalItems = $derived(data.length);
  let paginatedData = $derived(
    data.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  );
  
  function handlePageChange(page: number) {
    currentPage = page;
  }
  
  function handlePageSizeChange(newPageSize: number) {
    pageSize = newPageSize;
    // Adjust current page if necessary
    const newTotalPages = Math.ceil(totalItems / newPageSize);
    if (currentPage >= newTotalPages) {
      currentPage = Math.max(0, newTotalPages - 1);
    }
  }
</script>

<Pagination
  {currentPage}
  {totalItems}
  {pageSize}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  pageSizeOptions={[3, 5, 10, 20, 50]}
  showPageSizeSelector={true}
  showFirstLast={true}
  maxVisiblePages={5}
/>
```

## Props Interface

```typescript
interface PaginationProps {
  currentPage: number;           // Current page (0-indexed)
  totalItems: number;           // Total number of items
  pageSize: number;             // Items per page
  onPageChange: (page: number) => void;        // Page change handler
  onPageSizeChange?: (pageSize: number) => void; // Page size change handler
  showPageSizeSelector?: boolean;              // Show page size buttons
  pageSizeOptions?: number[];                  // Available page sizes
  className?: string;                          // Additional CSS classes
  showFirstLast?: boolean;                     // Show first/last buttons
  maxVisiblePages?: number;                    // Max page numbers to show
}
```

## Default Configuration

- **Default Page Size**: 3 records per page
- **Page Size Options**: [3, 5, 10, 20, 50]
- **Show Page Size Selector**: true
- **Show First/Last Buttons**: true
- **Max Visible Pages**: 5

## Styling

The component follows the project's design system:

- Uses shadcn/ui Button components for navigation
- Consistent with dark mode theme
- Proper spacing using Tailwind's 8px grid system
- Portuguese language labels and text
- Responsive design for mobile devices

## Testing

The pagination logic has been thoroughly tested:

```bash
# Run pagination tests
node scripts/tests/teste_paginacao.mjs
```

Test coverage includes:
- ✅ Basic pagination calculations
- ✅ Last page handling (partial page)
- ✅ Page size changes
- ✅ Page adjustment when page size increases
- ✅ All page size options validation

## Integration with Salesforce Data

The pagination is integrated with the Salesforce carteiras data:

1. **Data Source**: `$carteirasOrdenadas` store (sorted by patrimônio)
2. **Total Items**: Dynamically calculated from store data
3. **Paginated Data**: Sliced based on current page and page size
4. **Real-time Updates**: Reactive to data changes from Salesforce

## Accessibility Features

- **ARIA Labels**: All buttons have descriptive labels
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper semantic markup
- **Current Page Indication**: `aria-current="page"` for current page

## Performance Considerations

- **Reactive Slicing**: Only renders visible items
- **Efficient Updates**: Uses Svelte's reactivity system
- **Memory Efficient**: No data duplication
- **Fast Navigation**: Instant page switching

## Browser Compatibility

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Responsive design for all screen sizes

## Future Enhancements

Potential improvements for future versions:

- [ ] Server-side pagination for large datasets
- [ ] Search/filter integration
- [ ] Export functionality for current page
- [ ] Customizable page size input
- [ ] Pagination state persistence in URL

## Troubleshooting

### Common Issues

1. **Page not updating**: Ensure `currentPage` is declared with `$state()`
2. **Data not slicing**: Check that `paginatedData` uses `$derived()`
3. **Page size not changing**: Verify `handlePageSizeChange` implementation

### Debug Tips

```javascript
// Add to component for debugging
$effect(() => {
  console.log('Pagination state:', {
    currentPage,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize)
  });
});
```

## Related Components

- **TabelaCarteirasSalesforce**: Main implementation
- **Button**: Navigation controls
- **Badge**: Page size indicators
- **Card**: Container styling
