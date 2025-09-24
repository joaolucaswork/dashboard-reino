<script lang="ts">
  import {
    carteirasDetalhadas,
    carteirasOrdenadas,
  } from "$lib/stores/carteiras.js";
  import { formatarMoeda } from "$lib/utils/currency.js";

  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import { Pagination } from "$lib/components/ui/pagination";
  import { Building2, Calendar } from "@lucide/svelte";

  // Pagination state
  let currentPage = $state(0);
  let pageSize = $state(3); // Default to 3 records per page as requested
  let pageSizeOptions = [3, 5, 10, 20, 50];

  // Computed values for pagination
  let totalItems = $derived($carteirasOrdenadas.length);
  let paginatedCarteiras = $derived(
    $carteirasOrdenadas.slice(
      currentPage * pageSize,
      (currentPage + 1) * pageSize
    )
  );

  // Pagination handlers
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

  // Função para formatar porcentagem
  function formatarPorcentagem(valor: number): string {
    return `${(valor * 100).toFixed(1)}%`;
  }

  // Função para formatar data
  function formatarData(data: string): string {
    return new Date(data).toLocaleDateString("pt-BR");
  }

  // Função para obter classe de cor baseada no patrimônio
  function getPatrimonioClass(patrimonio: number): string {
    if (patrimonio >= 10000000) return "text-green-600 font-semibold";
    if (patrimonio >= 1000000) return "text-blue-600 font-medium";
    if (patrimonio >= 100000) return "text-yellow-600";
    return "text-gray-600";
  }
</script>

{#if $carteirasDetalhadas.length > 0}
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Building2 class="h-5 w-5 text-primary" />
        Carteiras do Salesforce
        <Badge variant="secondary" class="ml-2">
          {$carteirasDetalhadas.length} carteiras
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[200px]">Nome</TableHead>
              <TableHead class="w-[120px]">Conta</TableHead>
              <TableHead class="w-[100px]">Banco</TableHead>
              <TableHead class="text-right w-[140px]">Patrimônio</TableHead>
              <TableHead class="text-right w-[100px]">%</TableHead>
              <TableHead class="text-right w-[120px]">Mensalidade</TableHead>
              <TableHead class="w-[100px]">Atualização</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each paginatedCarteiras as carteira (carteira.id)}
              <TableRow class="hover:bg-muted/50">
                <TableCell class="font-medium">
                  <div class="flex flex-col">
                    <span class="text-sm">{carteira.nome}</span>
                    <span class="text-xs text-muted-foreground">
                      ID: {carteira.id.substring(0, 8)}...
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  {#if carteira.numero_conta}
                    <code class="text-xs bg-muted px-1 py-0.5 rounded">
                      {carteira.numero_conta}
                    </code>
                  {:else}
                    <span class="text-muted-foreground text-xs">N/A</span>
                  {/if}
                </TableCell>

                <TableCell>
                  {#if carteira.banco}
                    <Badge variant="outline" class="text-xs">
                      {carteira.banco}
                    </Badge>
                  {:else}
                    <span class="text-muted-foreground text-xs">N/A</span>
                  {/if}
                </TableCell>

                <TableCell class="text-right">
                  <div class="flex flex-col items-end">
                    <span
                      class="{getPatrimonioClass(carteira.patrimonio)} text-sm"
                    >
                      {formatarMoeda(carteira.patrimonio)}
                    </span>
                    {#if carteira.patrimonio >= 1000000}
                      <span class="text-xs text-muted-foreground">
                        {(carteira.patrimonio / 1000000).toFixed(1)}M
                      </span>
                    {/if}
                  </div>
                </TableCell>

                <TableCell class="text-right">
                  <span class="text-sm font-medium">
                    {formatarPorcentagem(carteira.porcentagem)}
                  </span>
                </TableCell>

                <TableCell class="text-right">
                  <div class="flex flex-col items-end">
                    <span class="text-sm font-medium">
                      {formatarMoeda(carteira.mensalidade)}
                    </span>
                    {#if carteira.patrimonio > 0 && carteira.mensalidade > 0}
                      <span class="text-xs text-muted-foreground">
                        {(
                          ((carteira.mensalidade * 12) / carteira.patrimonio) *
                          100
                        ).toFixed(2)}% a.a.
                      </span>
                    {/if}
                  </div>
                </TableCell>

                <TableCell>
                  <div class="flex items-center gap-1">
                    <Calendar class="h-3 w-3 text-muted-foreground" />
                    <span class="text-xs text-muted-foreground">
                      {formatarData(carteira.data_modificacao)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <!-- Pagination Controls -->
      <Pagination
        {currentPage}
        {totalItems}
        {pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        {pageSizeOptions}
        showPageSizeSelector={true}
        showFirstLast={true}
        maxVisiblePages={5}
        className="border-t pt-4"
      />
    </CardContent>
  </Card>
{:else}
  <Card>
    <CardContent class="pt-6">
      <div class="text-center text-muted-foreground">
        <Building2 class="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma carteira detalhada carregada</p>
        <p class="text-sm">
          Verifique se o Salesforce está configurado corretamente
        </p>
      </div>
    </CardContent>
  </Card>
{/if}
