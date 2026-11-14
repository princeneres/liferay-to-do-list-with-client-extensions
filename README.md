# To-Do List com client extensions (Liferay 7.4 GA132)

Demonstração das formas novas de desenvolver no Liferay 7.4: um site inteiro criado por um client extension `siteInitializer`, com Objects, automações nativas, Fragments, Style Book, segmentação, custom elements, CSS e JS globais, tema por client extension e um microsserviço Spring Boot.

## Requisitos

- Docker com Compose.
- Java 21 no `JAVA_HOME` (o microsserviço depende de bibliotecas do Liferay compiladas para Java 21).

Node e Gradle são baixados pelo próprio workspace.

## Subir

```bash
./workshop.sh up
```

O script compila tudo, sobe Liferay, PostgreSQL e o microsserviço, e faz o deploy na ordem certa (veja o comentário no início do script). Leva poucos minutos.

- Site: http://localhost:8080/web/to-do-workshop
- Usuário: `test@liferay.com` / `test`

Para voltar ao zero: `./workshop.sh reset`.

### Dois passos manuais

A GA132 não oferece API para estes vínculos, então eles são feitos na interface:

1. **Design do site:** Menu do site > Construtor de sites > Páginas > engrenagem (Configuração) > Desenhar.
   - Favicon: `To-Do Favicon`.
   - CSS de tema: `To-Do Theme CSS`.
   - Extensões CSS client: `To-Do Global CSS`.
   - Aba JavaScript > extensões JavaScript client: `To-Do Global JS`.
2. **Workflow:** Aplicações > Process Builder > Configuração > Categoria > `Category Approval`.

## O que tem em cada pasta

| Pasta | Tipo | O que mostra |
| --- | --- | --- |
| `client-extensions/todo-site-initializer` | `siteInitializer` | Site, Objects Task e Category, picklists, state field, validação, relacionamento, agregação, ações, notificação, workflow, role, Style Book, Master Page, Fragments, páginas, Collection, Display Page, segmento e experiência |
| `client-extensions/todo-app` | `customElement` (2) | Lista e resumo de tarefas em React, usando o React e o Clay do próprio portal via import map (bundle de poucos KB) |
| `client-extensions/todo-commons` | `jsImportMapsEntry` | Módulo `todo-commons` com o cliente da API, compartilhado pelos dois custom elements |
| `client-extensions/todo-global` | `globalCSS`, `globalJS` | Barra de acessibilidade (fonte e alto contraste) em todas as páginas |
| `client-extensions/todo-theme` | `themeCSS`, `themeFavicon` | CSS do tema gerado a partir do Styled, com os tokens do Classic para o Style Book, e o favicon |
| `client-extensions/todo-object-action` | `objectAction`, `oAuthApplicationUserAgent` | Spring Boot recebe a tarefa criada e grava de volta um código de integração |
| `client-extensions/todo-batch` | `batch` | Importa tarefas de exemplo, que também disparam as ações |

## Roteiro sugerido

1. **Vitrine:** a página lista cada recurso, onde ver e a pasta correspondente.
2. **Site initializer:** abrir `todo-site-initializer/site-initializer` e mostrar cada pasta virando tela.
3. **Objects:** Painel de controle > Objects > Tarefa (campos, state field, validação, view, ações) e Categoria (agregação).
4. **Validação e estado:** na Início, criar uma tarefa com título de 2 letras; mudar uma tarefa de Concluída para Aberta.
5. **Ações e notificação:** criar uma tarefa de prioridade alta (entra em andamento), ver o sino e a coluna Integração.
6. **API:** `/o/c/tasks`, `/o/api` e GraphQL, gerados pelo Object.
7. **Página sem tema pesado:** Master Page, Fragments, Style Book (trocar a cor primária) e Collection na página Tarefas.
8. **Segmentação:** botão "Ver como Empresa" troca a experiência da Início pelo cookie `todo-profile`.
9. **Frontend:** custom elements, import map, CSS e JS globais, Theme CSS.
10. **Microsserviço:** logs com `docker compose logs -f object-action`.

## Limitações da GA132 encontradas

- O site initializer falha se for processado durante a subida do Liferay; o deploy precisa ser feito com o portal no ar.
- O escopo OAuth de um Object é resolvido quando o app OAuth é criado, e o nome é em minúsculas (`c_task.everything`). Por isso o microsserviço e o batch são implantados depois do Object.
- O batch precisa das categorias criadas pelo site initializer; implantado junto com ele, todas as tarefas de exemplo são rejeitadas. Por isso `./gradlew deploy` é bloqueado e o deploy passa pelo `./workshop.sh`.
- No bundle local com Hypersonic (`initBundle`), criar uma tarefa trava o portal: a ação do Object fica esperando um lock de tabela. Use o ambiente Docker com PostgreSQL.
- Batch de Object Entry não aceita `UPSERT`; o batch usa `INSERT` e ignora as tarefas que já existem.
- O site initializer não vincula workflow a Objects nem aplica client extensions ao site; daí os passos manuais.
- Groovy é bloqueado no workflow; a aprovação usa `<status>`.
- As expressões de ação não têm data atual.
- Reimplantar o site initializer duplica as experiências de segmento; para recomeçar, use `./workshop.sh reset`.
