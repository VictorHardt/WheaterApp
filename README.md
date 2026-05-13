# WeatherApp 🌤️

## Visão Geral
O **WeatherApp** é um aplicativo mobile de previsão do tempo moderno e performático, focado em fornecer dados meteorológicos com uma excelente experiência de usuário. Ele oferece dados atuais, gráficos com previsões horárias, buscas por cidades e suporte a modo escuro/claro com temas fluidos.

> [!NOTE]
> *[🖼️ Placeholder: Inserir screenshots ou GIFs do app aqui]*

## Configuração e Execução

### Pré-requisitos
Para rodar este projeto, você precisará de:
- Node v20+ (recomenda-se o uso via `nvm`)
- Expo CLI
- Xcode 15+ (para rodar no simulador iOS ou device Apple)
- Android Studio (para rodar no emulador Android)

### Variáveis de Ambiente
O projeto depende de uma chave de API para buscar os dados meteorológicos.

1. Faça uma cópia do arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
2. Crie uma conta no site [WeatherAPI.com](https://www.weatherapi.com/) para obter a sua API Key.
3. **Instrução clara:** Coloque sua chave na variável `EXPO_PUBLIC_WEATHER_API_KEY` dentro do arquivo `.env` gerado.

### Instalação
Clone o repositório, instale as dependências Node e os pacotes nativos para o iOS:

```bash
npm install
cd ios && pod install && cd ..
```

### Execução
Para iniciar o empacotador Metro e o cliente de desenvolvimento (dev client):

```bash
npx expo start
```
No terminal onde o comando estiver rodando:
- Pressione `i` para abrir o aplicativo no **iOS simulator**
- Pressione `a` para abrir o aplicativo no **Android emulator**

### Testes
O projeto conta com uma robusta suíte de testes automatizados de componentes, hooks e serviços. Para rodar a suíte e verificar a cobertura do código, execute:

```bash
npx jest --coverage
```

---

## Bibliotecas Utilizadas e Justificativas

Abaixo, detalho as principais bibliotecas que fazem parte do projeto, suas respectivas versões e a motivação por trás de suas escolhas.

| Biblioteca | Versão | Finalidade | Justificativa |
|---|---|---|---|
| **expo-router** | `~6.0.23` | Navegação *file-based* | Traz o paradigma moderno de navegação por estrutura de pastas, semelhante ao Next.js, simplificando o controle de rotas e facilitando o _deep linking_ sem complexas árvores de navegação. |
| **@tanstack/react-query** | `^5.100.9` | Gerenciamento de *Server State* | Essencial para realizar o _fetch_ de dados, cacheamento em memória, re-tentativas (retries) e estados de _loading_/_error_. Evita o boilerplate extremo do uso de `useEffect` com `useState`. |
| **zustand** | `^5.0.13` | Gerenciamento de *Client State* | Utilizado para estados globais do aplicativo (como tema claro/escuro e cidades salvas). Escolhido por ser muito mais leve, não ter boilerplates (ao contrário do Redux) e suportar _middlewares_ (como `persist`) nativamente. |
| **axios** | `^1.16.0` | HTTP Client | Utilizado no lugar do `fetch` nativo pela sua API mais amigável, intercepção flexível de _requests/responses_ e serialização automática para JSON. |
| **dayjs** | `^1.11.20` | Manipulação de datas | Escolhido como uma alternativa minúscula e veloz ao *Moment.js*. Mantém a mesma API encadeável, ideal para exibir os horários da previsão e validar idades de cache. |
| **react-native-gifted-charts** | `^1.4.76` | Gráficos visuais | Responsável por criar os belos gráficos de temperaturas ao longo do dia. É uma alternativa excelente ao *Victory Native* (que é pesado) e ao *react-native-chart-kit* (que carece de alta customização), pois permite alto detalhamento visual de cada nó, tooltip e linha. |
| **react-native-svg** | `^15.15.4` | Dependência visual vetorial | Necessária primariamente como motor de renderização por trás do *gifted-charts* para desenhar primitivas vetoriais suaves no app. |
| **@react-native-async-storage/async-storage** | `2.2.0` | Persistência local (offline) | Um armazenamento chave-valor simples e confiável que permite ao aplicativo salvar as últimas consultas e gerenciar offline via _Zustand Persist_. |
| **expo-location** | `~19.0.8` | GPS e Permissões | Fornece APIs prontas e seguras para pedir permissão de geolocalização e conseguir a lat/long do usuário nativamente sem depender de pacotes não suportados. |
| **expo-network** | `~8.0.8` | Conectividade | Necessário para identificar as condições da rede, adaptando as respostas do app perante uma ausência repentina de internet. |
| **react-native-linear-gradient** | `^2.8.3` | UI - Gradientes Visuais | Indispensável para o design moderno do app. Traz gradientes suaves de fundo e em elementos (suporta a criação de interfaces com aspecto premium e dinâmico, simulando o céu). |
| **msw** | `^1.3.3` | Testes - Mock de API | Mock Service Worker foi escolhido para a camada de testes, pois intercepta a comunicação no nível da rede. Torna os testes do React Query e Axios extremamente fiéis e agnósticos à implementação. |
| **jest-expo + @testing-library/react-native** | `^55.0.17` / `^13.3.3` | Ambiente e Utils de Testes | É a combinação padrão ouro no ecossistema atual. O `jest-expo` garante compatibilidade de mocks nativos, enquanto a Testing Library assegura a filosofia de que *"quanto mais seus testes se parecem com o uso real, mais confiança oferecem"*. |

---

## Arquitetura

O aplicativo possui uma divisão de responsabilidades clara e concisa para fácil manutenção e escalabilidade. Segue o diagrama em camadas:

```text
       UI (app/)
           │
           ▼
    Hooks (src/hooks/)
           │
           ▼
  Services (src/services/)  ◄──────►  API / AsyncStorage
           │
           ▼
 Store Zustand (src/store/)
```

- **UI (`app/`, `src/components/`):** Camada de apresentação que consome os hooks, puramente focada no visual e UX.
- **Hooks (`src/hooks/`):** Contém a lógica de negócio encapsulada, integrando consultas (*React Query*) e as abstraindo dos componentes.
- **Services (`src/services/`):** Funções e classes assíncronas puras responsáveis por conversar com as APIs externas ou utilitários complexos (Network, Weather, Location).
- **Store (`src/store/`):** Onde o Zustand atua mantendo a integridade dos estados da sessão e as preferências que atravessam múltiplas telas.

---

## Decisões Técnicas

- **Por que React Query + Zustand (não só um deles)?**
  Porque eles resolvem problemas diferentes de forma magistral. O Zustand é ideal para gerenciar o estado global persistente (tema dark/light, cidades favoritas, consentimento de usuário). Já o TanStack React Query brilha ao lidar com o "Server State": estados assíncronos que vêm da rede. Tentar usar apenas o Zustand para gerenciar carregamento, _refetch_, erro de conexão e _caching_ de API acabaria gerando um "monstro" de código boilerplate desnecessário.
  
- **Por que "Bare Workflow" (via Expo Dev Client)?**
  O projeto utiliza o conceito avançado do Expo de *Continuous Native Generation* com Dev Client. Isso nos permite ter o melhor de dois mundos: a facilidade de desenvolvimento rápido em JS do fluxo "Managed" antigo, mas com o poder e a flexibilidade de adicionar e rodar código de dependências puramente nativas sempre que quisermos.
  
- **Por que Gifted-Charts?**
  Foi escolhido pela facilidade e modularidade em construir gráficos bonitos e performáticos. O *Victory Native* traz uma imensa complexidade de configuração e a nova biblioteca deles foca no Skia, o que era um overhead grande para esse desafio. Já o *react-native-chart-kit* é muito engessado quanto a customização de tooltips, preenchimentos e formatos em comparação ao `gifted-charts`.
  
- **Abordagem de cache offline:**
  O aplicativo usa uma camada mista inteligente: o *AsyncStorage* persiste a resposta mais recente da cidade escolhida. Se o usuário estiver sem acesso à internet (informação detectada via `expo-network`), ou se a chamada da API do *React Query* falhar subitamente, o sistema aciona o `CacheManager`. Ele entrega o _fallback_ com os últimos dados salvos, garantindo uma UX livre de "telas brancas da morte", mas comunicando que se trata de uma versão não-sincronizada.

---

## Aviso iOS
> "Testado em simulador iOS 18 via Xcode no macOS. Não testado em dispositivo físico Apple."

---

## Limitações Conhecidas e Próximos Passos
Como todo projeto de escopo limitado, há sempre espaços para ampliação:
- **Linting:** O projeto não possui configuração completa do ESLint para a verificação de regras de estilo, devendo ser adicionado no futuro.
- **Sem notificações push:** Adicionar um worker nativo (background) para fornecer notificações em caso de alertas de mudanças severas ou chuva.
- **Sem widget de tela inicial:** Criar *Home Screen Widgets* nativos (Swift/Kotlin) usando as extensões de App, compartilhando o armazenamento local entre a parte nativa e o Expo.
- **Múltiplas Cidades Favoritas:** Expandir a interface e o banco para acomodar o rastreamento concorrente de dezenas de cidades numa listagem *carousel* global.
- **Internacionalização (i18n):** Implementar o suporte em outras línguas e formatos de graus (Celsius x Fahrenheit).
