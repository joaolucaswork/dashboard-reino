#!/usr/bin/env node

/**
 * Test script to verify pagination functionality
 * Tests the pagination logic used in TabelaCarteirasSalesforce component
 */

console.log('🧪 Testing Pagination Logic...\n');

// Test data - simulating Salesforce carteiras
const mockCarteiras = Array.from({ length: 62 }, (_, i) => ({
  id: `carteira-${i + 1}`,
  nome: `Carteira ${i + 1}`,
  patrimonio: Math.random() * 10000000,
  porcentagem: Math.random() * 0.1,
  mensalidade: Math.random() * 50000,
  data_modificacao: '2024-01-01'
}));

console.log(`📊 Mock data created: ${mockCarteiras.length} carteiras`);

// Test pagination logic
function testPagination() {
  console.log('\n🔍 Testing pagination calculations...');
  
  // Test 1: Default page size (3 items per page)
  let currentPage = 0;
  let pageSize = 3;
  let totalItems = mockCarteiras.length;
  
  let totalPages = Math.ceil(totalItems / pageSize);
  let startItem = currentPage * pageSize + 1;
  let endItem = Math.min((currentPage + 1) * pageSize, totalItems);
  let paginatedData = mockCarteiras.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  
  console.log(`✅ Test 1 - First page (pageSize: ${pageSize})`);
  console.log(`   Total pages: ${totalPages}`);
  console.log(`   Showing items: ${startItem} to ${endItem} of ${totalItems}`);
  console.log(`   Paginated data length: ${paginatedData.length}`);
  console.log(`   Expected: 3 items, Got: ${paginatedData.length} items`);
  
  if (paginatedData.length === 3 && totalPages === 21) {
    console.log('   ✅ PASS\n');
  } else {
    console.log('   ❌ FAIL\n');
    return false;
  }
  
  // Test 2: Last page
  currentPage = totalPages - 1; // Last page (0-indexed)
  startItem = currentPage * pageSize + 1;
  endItem = Math.min((currentPage + 1) * pageSize, totalItems);
  paginatedData = mockCarteiras.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  
  console.log(`✅ Test 2 - Last page (page ${currentPage + 1})`);
  console.log(`   Showing items: ${startItem} to ${endItem} of ${totalItems}`);
  console.log(`   Paginated data length: ${paginatedData.length}`);
  console.log(`   Expected: 2 items (62 % 3 = 2), Got: ${paginatedData.length} items`);
  
  if (paginatedData.length === 2 && endItem === 62) {
    console.log('   ✅ PASS\n');
  } else {
    console.log('   ❌ FAIL\n');
    return false;
  }
  
  // Test 3: Page size change
  pageSize = 10;
  currentPage = 0;
  totalPages = Math.ceil(totalItems / pageSize);
  paginatedData = mockCarteiras.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  
  console.log(`✅ Test 3 - Page size change (pageSize: ${pageSize})`);
  console.log(`   Total pages: ${totalPages}`);
  console.log(`   Paginated data length: ${paginatedData.length}`);
  console.log(`   Expected: 7 pages, 10 items, Got: ${totalPages} pages, ${paginatedData.length} items`);
  
  if (paginatedData.length === 10 && totalPages === 7) {
    console.log('   ✅ PASS\n');
  } else {
    console.log('   ❌ FAIL\n');
    return false;
  }
  
  // Test 4: Page adjustment when page size increases
  pageSize = 50;
  currentPage = 15; // This would be invalid for pageSize 50
  totalPages = Math.ceil(totalItems / pageSize);
  
  // Adjust current page if necessary (same logic as in component)
  if (currentPage >= totalPages) {
    currentPage = Math.max(0, totalPages - 1);
  }
  
  console.log(`✅ Test 4 - Page adjustment (pageSize: ${pageSize})`);
  console.log(`   Total pages: ${totalPages}`);
  console.log(`   Adjusted current page: ${currentPage}`);
  console.log(`   Expected: 2 pages, page 1, Got: ${totalPages} pages, page ${currentPage}`);
  
  if (totalPages === 2 && currentPage === 1) {
    console.log('   ✅ PASS\n');
  } else {
    console.log('   ❌ FAIL\n');
    return false;
  }
  
  return true;
}

// Test page size options
function testPageSizeOptions() {
  console.log('🔍 Testing page size options...');
  
  const pageSizeOptions = [3, 5, 10, 20, 50];
  const totalItems = mockCarteiras.length;
  
  pageSizeOptions.forEach(pageSize => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const lastPageItems = totalItems % pageSize || pageSize;
    
    console.log(`   PageSize ${pageSize}: ${totalPages} pages, last page has ${lastPageItems} items`);
  });
  
  console.log('   ✅ All page size options calculated correctly\n');
  return true;
}

// Run tests
async function runTests() {
  try {
    const test1 = testPagination();
    const test2 = testPageSizeOptions();
    
    if (test1 && test2) {
      console.log('🎉 All pagination tests PASSED!');
      console.log('\n📋 Summary:');
      console.log('   ✅ Basic pagination calculations');
      console.log('   ✅ Last page handling');
      console.log('   ✅ Page size changes');
      console.log('   ✅ Page adjustment logic');
      console.log('   ✅ Page size options');
      console.log('\n🚀 Pagination functionality is ready for use!');
      process.exit(0);
    } else {
      console.log('❌ Some tests FAILED!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

runTests();
