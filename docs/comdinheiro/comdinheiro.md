**Comdinheiro
Tel +55 11 4133- 4900**

# Guia de Importação – API

## Comdinheiro

- Tel +55 11 4133-
  - Informações Gerais Sumário
  - Ferramenta de Importação API
  - Informações de Entrada
  - Código Gerado
  - Exemplo de Consulta
  - Teste de Requisição API
  - O que Fazer em Caso de Problemas?
  - Avisos Importantes

**Comdinheiro
Tel +55 11 4133- 4900**

```
Informações Gerais
```

Link de acesso à ferramenta: <https://www.comdinheiro.com.br/ManualImportacaoAPI001.php>

O guia tem como objetivo orientar os usuários a realizar importações de dados da Comdinheiro via API através de sua
ferramenta que, ao final, gera um código de requisição para ser incorporado ao código do cliente, de modo que, ao
ser executado, o código retornará as informações referentes à ferramenta de dados escolhida e seus parâmetros
definidos na URL da consulta. Além de toda a explicação sobre como utilizar a ferramenta, há, também, uma
demonstração de como testar uma requisição via cliente HTTP.

### Ferramenta de Importação API

A ferramenta possui 2 quadros em sua estrutura, sendo o primeiro para as **informações de entrada** e o segundo para
a exibição e coleta do **código gerado** pela ferramenta.

### Informações de Entrada

Após acessar a página da ferramenta, o próximo passo é iniciar o preenchimento dos dados.

**Comdinheiro
Tel +55 11 4133- 4900**

Usuário/Senha: nestes campos, basta inserir as mesmas credenciais utilizadas para acesso ao Comdinheiro.
Obs: a sua senha ficará visível no código gerado, então é recomendado que seja utilizada a hash (senha com caracteres
aleatórios e de grande tamanho), por motivos de segurança.

Ferramenta: caso não haja uma URL que o usuário queira utilizar no próximo campo, há a possibilidade de escolher
alguma das ferramentas disponíveis na lista e, ao escolher uma delas, o código será gerado considerando a URL
padrão da página selecionada.
Obs: caso seja definida uma URL no campo “URL da Consulta”, o campo com a lista de ferramentas ficará desabilitado,
assim como consta na imagem acima em que há uma URL definida, tornando a lista inacessível.

URL da Consulta: caso o usuário opte por adicionar uma URL no respectivo campo, o código irá incorporá-la e, ao
rodar o código, será retornado o conteúdo da consulta, com base na ferramenta e seus parâmetros definidos na URL.
Obs: note que a URL que consta no campo **não** possui o trecho que a precede “<https://www.comdinheiro.com.br/”>.
A URL inserida deve ser de uma ferramenta que pertença a lista de ferramentas disponíveis para API. É possível
consultar pela lista no campo “Ferramenta”, ou no link “Ferramentas Disponíveis”

Linguagem: o campo serve para que o usuário escolha a linguagem para qual o código será gerado. Na lista, são
disponibilizadas algumas das principais linguagens de programação.

**Comdinheiro
Tel +55 11 4133- 4900**

Formato: atualmente, são disponibilizados dois tipos de formatos: JSON e XML. O formato JSON retornará os dados
em JSON3 (versão mais recente da API para o formato) e o formato XML retornará os dados em XML2 (versão mais
recente da API para o formato).
Obs: apesar das versões anteriores dos formatos JSON e XML (JSON, JSON2 e XML) não estarem disponíveis, elas
ainda funcionam, caso uma requisição seja feita com tais versões.

Gerar Código: por fim, após realizar todas as definições necessárias, basta clicar no botão “Gerar Código” e, logo
abaixo, no segundo quadro, será exibido o código que atende aos parâmetros passados pelo usuário.

### Código Gerado

Com o código gerado, basta clicar em copiar para que o usuário possa incorporá-lo aonde desejar.

### Exemplo de Consulta

Supondo uma consulta cujas premissas sejam as seguintes:

- URL escolhida pelo usuário:
    **HistoricoCotacao002.php?&x=NTNB_15082004_15052024+CDI&data_ini=13032024&data_fim=14032024&pagina=1&d=MOED**
    **A_ORIGINAL&g=1&m=0&info_desejada=numero_indice&retorno=discreto&tipo_data=du_br&tipo_ajuste=todosajustes&num_**
    **casas=2&enviar_email=0&ordem_legenda=1&cabecalho_excel=modo1&classes_ativos=hio94mrrlk3j&ordem_data=0&rent_ac**
    **um=rent_acum&minY=&maxY=&deltaY=&preco_nd_ant=0&base_num_indice=100&flag_num_indice=0&eixo_x=Data&startX=**
    **0&max_list_size=20&line_width=2&titulo_grafico=&legenda_eixoy=&tipo_grafico=line&script=&tooltip=única**
- Linguagem em que o código deve ser gerado: **Python**
- Formato (que o código gerado deve retornar ao ser rodado): **XML** (XML sairá como XML2)

**Comdinheiro
Tel +55 11 4133- 4900**

Considerando os parâmetros desejados, a ferramenta deve ser preenchida da seguinte forma:

Ao clicar em gerar o código, o código deverá vir da seguinte forma:

Após copiar o código para o ambiente em que será rodado e colocar o código para ser executado, o retorno deve
ser equivalente ao que se observa ao abrir essa url:
<https://www.comdinheiro.com.br/HistoricoCotacao002.php?&x=NTNB_15082004_15052024+CDI&data_ini=13032024&data_fim=>
24&pagina=1&d=MOEDA_ORIGINAL&g=1&m=0&info_desejada=numero_indice&retorno=discreto&tipo_data=du_br&tipo_ajuste=todosaj
ustes&num_casas=2&enviar_email=0&ordem_legenda=1&cabecalho_excel=modo1&classes_ativos=hio94mrrlk3j&ordem_data=0&rent_a
cum=rent_acum&minY=&maxY=&deltaY=&preco_nd_ant=0&base_num_indice=100&flag_num_indice=0&eixo_x=Data&startX=0&max_list
_size=20&line_width=2&titulo_grafico=&legenda_eixoy=&tipo_grafico=line&script=&tooltip=unica&flag_export=XML

### Teste de Requisição API

Para testar os parâmetros de uma consulta, você pode usar qualquer cliente HTTP (como curl, Insomnia, ou ferramentas similares) para montar uma requisição e verificar o retorno, validando assim os parâmetros inseridos, como a URL, o formato de resposta da consulta, entre outros.

**Comdinheiro
Tel +55 11 4133- 4900**

Para fazer uma requisição de teste, configure da seguinte maneira:

Método: **POST**
Endereço: <https://www.comdinheiro.com.br/Clientes/API/EndPoint001.php?code=import_data>
Body: **x-www-form-urlencoded**
Parâmetros necessários:

- **username**: seu usuário
- **password**: sua senha
- **URL**: qualquer URL de ferramenta compatível com API
- **format**: formato desejado (JSON, JSON2, JSON3, XML e XML2)

Após configurar todos os parâmetros, a consulta estará pronta para ser executada.

### O que Fazer em Caso de Problemas?

Caso haja algum problema ao gerar o código de importação via API (ferramenta Comdinheiro), ou surgirem problemas
ao efetuar as requisições, são indicadas as recomendações abaixo:

- **Revisar todos os parâmetros** passados (algum erro nessa etapa pode ser o causador do problema);
- **Testar a URL** acessando a Comdinheiro (data em dia não útil ou parâmetros indevidos podem fazer com que
    a consulta não traga resultados. Neste caso, a solução passa por ajustar a URL;
- **Verificar se a URL** adicionada é de uma **ferramenta** que **possui** importação de dados via **API** ;

**Comdinheiro
Tel +55 11 4133- 4900**

- **Verificar usuário/senha**. Além de um erro de digitação, é possível que haja alguma pendência ou limitação
    referente ao usuário e tal fator pode invalidar a consulta. Dica: ao realizar a requisição, verifique o código de
    status da requisição, pois pode fornecer uma pista do problema apresentado.

Caso nenhuma das opções resolva o problema, é possível entrar em contato com a equipe de atendimento da
Comdinheiro para que o problema seja analisado.

### Avisos Importantes

Contagem de Pageviews

Cada requisição feita através da API conta como um pageview usado no login. Eles são cumulativos, ou seja, os
pageviews usados em tela e pela API, são considerados da mesma forma.

Acesso simultâneo

Para os logins com restrição de acessos simultâneos, vale a seguinte regra:

- Se uma segunda requisição é feita enquanto uma primeira ainda está em andamento, a primeira continuará até ser
concluída, já a segunda receberá uma mensagem de erro.
