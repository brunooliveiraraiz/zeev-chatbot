export type ZeevRequestArea =
  | 'TI'
  | 'BI'
  | 'Atendimento'
  | 'Comercial'
  | 'CMEF'
  | 'DP'
  | 'Financeiro'
  | 'Fiscal'
  | 'Jurídico'
  | 'Operações'
  | 'Performance'
  | 'P&C'
  | 'TPEP';

export type ZeevRequestCatalogItem = {
  id: string;
  name: string;
  area: ZeevRequestArea;
  description: string;
  tags: string[];
  examples: string[];
  url_hml?: string;
  url_prod: string;
};

export const REQUESTS_CATALOG: ZeevRequestCatalogItem[] = [
  // ==================== TECNOLOGIA DA INFORMAÇÃO (TI) ====================
  {
    id: 'ti_infraestrutura_sistemas',
    name: '[TI] Solicitações de Infraestrutura e Sistemas',
    area: 'TI',
    description: 'Processo de solicitações à equipe de TI, segmentado entre demandas de Infraestrutura (rede, equipamentos, acessos) e Sistemas (erros, melhorias e integrações).',
    tags: ['ti', 'infraestrutura', 'sistemas', 'rede', 'equipamentos', 'hardware', 'software', 'vpn', 'servidor', 'computador', 'erro', 'melhoria', 'integração'],
    examples: [
      'meu computador não funciona',
      'preciso de acesso à rede',
      'problema com VPN',
      'servidor fora do ar',
      'erro no sistema',
      'computador lento',
      'preciso de novo equipamento',
      'sistema travou',
      'internet não funciona',
      'preciso integrar sistemas'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=1qIzz%2FNOJYChsNqlp5gNKilquQ9VAozc9JJ%2FvgYGhAxTeHORLGg3kb4iVnnUw%2B%2B3Mry%2BoFVRj8%2B8GXvY34V%2BTg%3D%3D'
  },
  {
    id: 'ti_portal_matriculas',
    name: '[TI] Suporte Portal de Matrículas',
    area: 'TI',
    description: 'Aplicativo de solicitações destinadas aos problemas no portal de matrículas.',
    tags: ['ti', 'portal', 'matriculas', 'matrícula', 'acesso portal', 'erro portal', 'login portal', 'problema portal'],
    examples: [
      'não consigo acessar o portal de matrículas',
      'erro no portal',
      'portal não carrega',
      'não consigo fazer matrícula',
      'problema ao matricular aluno',
      'portal de matrículas travou',
      'erro ao enviar documentos',
      'não aparece opção de matrícula',
      'portal fora do ar',
      'login do portal não funciona'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=uZzpiut0XHN%2FQ0M3%2FU8UFJd9z%2Fw6Twpymf5FsII9EOKIzr%2Fp1CSSZpqHg1O73Ihb66i4yCxfi5Ou4vPVZZBAUQ%3D%3D'
  },
  {
    id: 'ti_ticket_raiz',
    name: '[TI] Solicitações Ticket Raiz',
    area: 'TI',
    description: 'Cancelamento de Tickets, Criação de usuário, Dúvidas, Relatórios, etc.',
    tags: ['ti', 'ticket', 'chamado', 'usuário', 'relatório', 'dúvida', 'cancelamento', 'suporte'],
    examples: [
      'quero cancelar um ticket',
      'preciso criar um usuário',
      'tenho dúvida sobre sistema',
      'preciso de relatório',
      'abrir chamado de TI',
      'cancelar solicitação',
      'criar acesso para novo colaborador',
      'gerar relatório do sistema',
      'ajuda com ticket',
      'como faço para abrir chamado'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=QBkLwnwNZV0BKeCHG3JSWW3eiXN3hQmmCDMoX%2B3aA3ddVSzgAfMhM4247hvtlXfsZsRQLvc%2BKCCMZYEL5bjReQ%3D%3D'
  },

  // ==================== BUSINESS INTELLIGENCE (BI) ====================
  {
    id: 'bi_atendimento',
    name: '[BI] Atendimento e solicitações Business Intelligence (BI)',
    area: 'BI',
    description: 'Utilize este processo para solicitar análises, relatórios, dashboards, extrações de dados ou suporte em decisões baseadas em dados.',
    tags: ['bi', 'business intelligence', 'relatório', 'dashboard', 'análise', 'dados', 'extração', 'indicadores', 'kpi', 'power bi'],
    examples: [
      'preciso de um relatório gerencial',
      'quero criar um dashboard',
      'preciso analisar dados de vendas',
      'extrair dados para análise',
      'relatório de indicadores',
      'dashboard de performance',
      'análise de dados financeiros',
      'preciso de KPIs',
      'suporte para decisão baseada em dados',
      'criar painel de controle'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=MPQP%2FUC9xaPHsKn0P%2F%2FeO5VcDus57J0TrjcTJyDw%2FrJDDRH3apsSgv2TndO0xQ5Wmq1osNtJojkcJmmNgLgcbA%3D%3D'
  },

  // ==================== ATENDIMENTO ÀS SECRETARIAS ====================
  {
    id: 'atendimento_alteracao_vencimento',
    name: '[Atendimento] Alteração de vencimento',
    area: 'Atendimento',
    description: 'Solicitações para ajustes em casos de alteração de vencimento de uma ou mais parcelas.',
    tags: ['atendimento', 'vencimento', 'parcela', 'data', 'alterar vencimento', 'mudar data', 'prorrogar'],
    examples: [
      'preciso alterar vencimento da parcela',
      'mudar data de vencimento',
      'prorrogar vencimento',
      'trocar dia de vencimento',
      'alterar data da mensalidade',
      'vencimento para outro dia',
      'adiar vencimento',
      'modificar data de pagamento',
      'vencimento futuro alterar',
      'trocar vencimento das parcelas'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=%2FSkYew8MQ3WBxIpJhqjk489JqF7yYr4Ey7WHrSCeve3olh18H5STV2muAIIhgvbUHC7JwH971Z3dfxmqBwNHYg%3D%3D'
  },
  {
    id: 'atendimento_cancelamento_matricula',
    name: '[Atendimento] Cancelamento de matrícula',
    area: 'Atendimento',
    description: 'Solicitações de cancelamento de matrícula de aluno.',
    tags: ['atendimento', 'cancelamento', 'matrícula', 'cancelar', 'desmatricular', 'saída', 'transferência'],
    examples: [
      'cancelar matrícula do aluno',
      'aluno saindo da escola',
      'transferência de unidade',
      'desmatricular aluno',
      'cancelar inscrição',
      'aluno vai sair',
      'preciso cancelar matrícula',
      'saída do aluno',
      'transferir aluno',
      'matrícula cancelamento'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=jnU0uas4SYy9C5opp83F5YQo4%2BliSoe09SZeeQ5kfvaIEJpTkCKXlmuaNX5PfIunbANj7xt1DeMnAD94tgyGkQ%3D%3D'
  },
  {
    id: 'atendimento_cancelamento_parcela',
    name: '[Atendimento] Cancelamento de parcela ou lançamento financeiro',
    area: 'Atendimento',
    description: 'Solicitações de cancelamento de parcelas ou lançamento.',
    tags: ['atendimento', 'cancelamento', 'parcela', 'lançamento', 'financeiro', 'mensalidade', 'taxa', 'material didático'],
    examples: [
      'cancelar parcela',
      'cancelar mensalidade',
      'cancelar taxa',
      'cancelar material didático',
      'erro no lançamento',
      'parcela duplicada',
      'cancelar contraturno',
      'lançamento errado',
      'cancelar cobrança',
      'remover parcela'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=vzeHcBcKAarLt8W4CDTuCUIYP1t1GKGbgMj9F%2FQR8Sz4g5bUH9ydQHBS1V2A%2FWSi%2BibNMWS1noenJgNHjxaCaA%3D%3D'
  },
  {
    id: 'atendimento_correcao_lancamento',
    name: '[Atendimento] Correção de lançamento / plano de pagamento',
    area: 'Atendimento',
    description: 'Solicitações para reajuste de parcelas após aplicação de desconto.',
    tags: ['atendimento', 'correção', 'lançamento', 'plano pagamento', 'desconto', 'reajuste', 'parcela'],
    examples: [
      'corrigir lançamento',
      'ajustar plano de pagamento',
      'aplicar desconto',
      'reajustar parcelas',
      'trocar responsável financeiro',
      'mudar plano de pagamento',
      'corrigir desconto',
      'regerar parcelas',
      'trocar anuidade',
      'ajustar mensalidade'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=mAPzFhcAr54hEwnTn0AOTDLaELgk46GYpFo6UjWWcOw4dvoJLgo2CqOR9NYHNH8S%2BxBiE7IMUOXwSf4ZAmFIlA%3D%3D'
  },
  {
    id: 'atendimento_devolucao_estorno',
    name: '[Atendimento] Devolução e Estorno',
    area: 'Atendimento',
    description: 'Solicitações e informações relacionadas a pedidos de devolução ou estorno.',
    tags: ['atendimento', 'devolução', 'estorno', 'reembolso', 'pagamento duplicado', 'cartão'],
    examples: [
      'paguei duplicado',
      'preciso de estorno',
      'devolução de pagamento',
      'reembolso',
      'estorno no cartão',
      'paguei a mais',
      'pagamento em duplicidade',
      'quero meu dinheiro de volta',
      'cancelei e quero estorno',
      'valor pago errado'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=B5NXPePmMn%2BPi%2B83F3Hs1xS6rbbYCKgXa1zvGA6YoO2tvx7x7mr%2Bri4BjXoD5H0jDw%2BPzyIWR%2Fuu16ORAE9ZIw%3D%3D'
  },
  {
    id: 'atendimento_treinamento_totvs',
    name: '[Atendimento] Solicitação de treinamento (Totvs)',
    area: 'Atendimento',
    description: 'Solicitações de treinamento e esclarecimento de dúvidas referentes aos procedimentos do setor e do TOTVS.',
    tags: ['atendimento', 'treinamento', 'totvs', 'dúvida', 'capacitação', 'procedimento'],
    examples: [
      'preciso de treinamento no Totvs',
      'dúvida sobre baixa de pagamento',
      'como lançar bolsa',
      'treinamento módulo financeiro',
      'dúvida no portal',
      'aprender a usar Totvs',
      'capacitação sistema',
      'como usar módulo educacional',
      'treinamento relatórios',
      'dúvida lançamento material'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=RzVKNj0K5DuaVtdWsVcYxar560I%2BnQ0hJPqCR14Wo1xSyiO52Xs09LNsywplq01aMsp%2B2v6%2BCFozd28%2BH%2BLdXA%3D%3D'
  },
  {
    id: 'atendimento_negociacao_acordos',
    name: '[Cobrança] Negociação e acordos via secretaria',
    area: 'Atendimento',
    description: 'Processo realizado pela secretaria para atender responsáveis financeiros que buscam negociar débitos em aberto, com possibilidade de acordos, parcelamentos ou revisões de cobrança.',
    tags: ['atendimento', 'cobrança', 'negociação', 'acordo', 'débito', 'parcelamento'],
    examples: [
      'negociar débito',
      'fazer acordo',
      'parcelar dívida',
      'revisão de cobrança',
      'tenho dívida para negociar',
      'acordo financeiro',
      'parcelamento de débito',
      'renegociar dívida',
      'quitar débito',
      'negociar mensalidades atrasadas'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=D2UiIqwp%2BilmnkwCsqs9nCTm09XMiNrCjte4xLMahIVKu%2BOCFEZzz5D9nvPvqAzwuMfzzq%2BSUBgzEFDqv%2BewqQ%3D%3D'
  },
  {
    id: 'atendimento_baixa_pagamento',
    name: '[Financeiro] Baixa de pagamento e vinculação de nota de crédito',
    area: 'Atendimento',
    description: 'Solicitações para casos onde o responsável realiza um pagamento que não foi registrado no sistema.',
    tags: ['atendimento', 'financeiro', 'baixa', 'pagamento', 'nota de crédito', 'comprovante'],
    examples: [
      'paguei mas não foi registrado',
      'pagamento não computado',
      'boleto pago não baixado',
      'vincular nota de crédito',
      'comprovante de pagamento',
      'pagamento não aparece',
      'baixar pagamento manualmente',
      'crédito não vinculado',
      'pagamento não consta',
      'registro de pagamento'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=mpuQkqMF2EEdG86STj%2B3aa1shkhIdz%2Bm1aoNV%2Bm%2Fz30MSuJ6a2uZ0ekpIZEgAGgw4rkUo1cTIsEReY9j8yDIfA%3D%3D'
  },

  // ==================== COMERCIAL ====================
  {
    id: 'comercial_plano_pagamento',
    name: '[Comercial] Criação de plano de pagamento / serviço',
    area: 'Comercial',
    description: 'Atendimento de solicitações para criação ou personalização de planos de pagamento ou serviços.',
    tags: ['comercial', 'plano', 'pagamento', 'serviço', 'personalização', 'criar plano'],
    examples: [
      'criar plano de pagamento',
      'novo plano personalizado',
      'cadastrar serviço',
      'plano diferenciado',
      'personalizar forma de pagamento',
      'criar novo serviço',
      'plano especial',
      'customizar plano',
      'serviço personalizado',
      'montar plano de pagamento'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=OQUBhvhcNR5L%2BScFl8ZE2wdUdXg3ew0WGXAgV8BiODB8HgBPJugpHrkQE9qVkg9hLuLv4CZ1AMWPIH257uHqhQ%3D%3D'
  },
  {
    id: 'comercial_desabilitacao_serie',
    name: '[Comercial] Desabilitação de série para renovação',
    area: 'Comercial',
    description: 'Solicitação para remover uma ou mais séries da oferta de renovação.',
    tags: ['comercial', 'série', 'renovação', 'desabilitar', 'remover'],
    examples: [
      'desabilitar série',
      'remover série da renovação',
      'série não disponível',
      'tirar série da oferta',
      'desativar série',
      'série fora da renovação',
      'bloquear série',
      'série indisponível',
      'não oferecer série',
      'excluir série renovação'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=LE511kjxr9GgUwXko9AqtqyW7jP%2BMOh%2FMVpiJuwK9wjRT7QkbulE7M%2Be%2FaKFOd1W5AkNhEws3lus4%2FvkqdgH%2Fw%3D%3D'
  },
  {
    id: 'comercial_planejamento',
    name: '[Comercial] Planejamento Comercial',
    area: 'Comercial',
    description: 'Solicitações relacionadas à definição de estratégias de captação, cronogramas e ações comerciais.',
    tags: ['comercial', 'planejamento', 'estratégia', 'captação', 'cronograma', 'ação comercial'],
    examples: [
      'planejar ação comercial',
      'estratégia de captação',
      'cronograma comercial',
      'definir metas comerciais',
      'planejamento de vendas',
      'ação de marketing',
      'estratégia comercial',
      'plano de captação',
      'cronograma de ações',
      'definir estratégias'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=fBfm2lacPaUaC3cnFFCpaURMpOmiWtGa9au799MpjxrxfWbjr%2FT5Vi%2F2UgfHwXdkQbO2cuzSeIud8Ek5XDwBow%3D%3D'
  },
  {
    id: 'comercial_desconto',
    name: '[Comercial] Solicitação de desconto',
    area: 'Comercial',
    description: 'Análise e validação de pedidos de desconto realizados por responsáveis, conforme política comercial vigente.',
    tags: ['comercial', 'desconto', 'bolsa', 'redução', 'abatimento'],
    examples: [
      'solicitar desconto',
      'pedir abatimento',
      'desconto na mensalidade',
      'reduzir valor',
      'aplicar desconto',
      'desconto especial',
      'bolsa de estudos',
      'desconto promocional',
      'redução de preço',
      'desconto comercial'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=7AoYXfkHwvB%2BjAbiiiPgO8Y5RSArJTeiCmSPd3TPOuV11K5z%2BLc44E9QG6mwnvLAFR0ZpK8c4vJXXYhGFSaXKw%3D%3D'
  },
  {
    id: 'comercial_promocoes',
    name: '[Comercial] Solicitação de promoções',
    area: 'Comercial',
    description: 'Registro e validação de pedidos para aplicação de promoções comerciais, conforme regras e períodos definidos pela instituição.',
    tags: ['comercial', 'promoção', 'campanha', 'oferta', 'promocional'],
    examples: [
      'aplicar promoção',
      'campanha comercial',
      'oferta especial',
      'promoção de matrícula',
      'desconto promocional',
      'ação promocional',
      'período promocional',
      'oferta limitada',
      'promoção vigente',
      'aplicar campanha'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=qU2Bo6lsFOwha43yUNq1qPGzGtz%2F16Z70KpW%2FCuKQIq%2FgxHesv0DvMnp%2FIAzYW3vyySapB2Xy9XZhLLgl88lZg%3D%3D'
  },
  {
    id: 'comercial_mais_raiz',
    name: '[Comercial] Solicitações Mais Raiz',
    area: 'Comercial',
    description: 'Solicitação de suporte as atividades extras.',
    tags: ['comercial', 'mais raiz', 'atividades extras', 'extracurricular'],
    examples: [
      'atividade extra',
      'mais raiz inscrição',
      'curso extracurricular',
      'atividade complementar',
      'programa mais raiz',
      'inscrever em atividade',
      'curso adicional',
      'atividade opcional',
      'programa extra',
      'contratar atividade'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=pUCMz8bQG5%2FQgthq0mlQq8wtWJdA5QOOJF1UNn6WnyE%2BIEMg3NCmZ0BNDJgbh1fEBhUf3%2FdHrAw7bq7BWxJMUA%3D%3D'
  },
  {
    id: 'comercial_marketplace',
    name: '[Comercial] Solicitações Marketplace',
    area: 'Comercial',
    description: 'Solicitações Marketplace.',
    tags: ['comercial', 'marketplace', 'loja', 'produtos', 'serviços'],
    examples: [
      'marketplace',
      'loja virtual',
      'comprar produto',
      'serviço marketplace',
      'produto disponível',
      'catálogo marketplace',
      'oferta marketplace',
      'venda marketplace',
      'produto na loja',
      'serviço da loja'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=nHkG475sLnzy6VZV3jaVRZ%2FmmUdEcUfAuyPC%2BfPhG%2F7%2F%2FYR5YUrc4DtrsSPymbvwaJxZBqZoJXXUMv62SKZe8Q%3D%3D'
  },
  {
    id: 'comercial_viabilidade',
    name: '[Comercial] Viabilidade econômica: turma, projeto ou produto',
    area: 'Comercial',
    description: 'Análise de custos, receitas e demanda para avaliar a viabilidade financeira de abertura de turmas, novos projetos ou produtos.',
    tags: ['comercial', 'viabilidade', 'análise', 'custos', 'receita', 'turma', 'projeto'],
    examples: [
      'viabilidade de turma',
      'análise de viabilidade',
      'viabilidade econômica',
      'abertura de turma',
      'viabilidade de projeto',
      'análise financeira',
      'viabilidade produto',
      'estudo de viabilidade',
      'avaliar viabilidade',
      'viabilidade novo projeto'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=qguvGUIsBT9vSn%2Fw0BI%2FrZsu6sp76j1Sj3z6WBBQv8VZmmpIHb8G%2FSOv9H1NfuE9NWJsvNPVptSyZZDQzPn2Cw%3D%3D'
  },

  // ==================== COMUNICAÇÃO, MARKETING E EXP. DA FAMÍLIA (CMEF) ====================
  {
    id: 'cmef_midia_eventos',
    name: '[CMEF] Solicitações de Mídia e Eventos',
    area: 'CMEF',
    description: 'Solicitações relacionadas a mídia, eventos, materiais gráficos e ações de comunicação. A solicitação deve ser realizada com no mínimo 21 dias de antecedência.',
    tags: ['cmef', 'comunicação', 'marketing', 'mídia', 'evento', 'material gráfico', 'campanha'],
    examples: [
      'criar material gráfico',
      'solicitar evento',
      'campanha de marketing',
      'divulgação evento',
      'criar banner',
      'material promocional',
      'peça de comunicação',
      'arte para evento',
      'divulgar ação',
      'campanha publicitária'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=kMSUDv4adGuJrjBxLAcTpUfPp3cQeRMxdnt7120cIkmsWCXc3Yc5EEy35bgVyi%2BWXXIrXAfiZfxrt953i%2BpiYw%3D%3D'
  },

  // ==================== DEPARTAMENTO PESSOAL (DP) ====================
  {
    id: 'dp_solicitacoes',
    name: '[DP] Solicitações',
    area: 'DP',
    description: 'Utilize este processo para tratar assuntos como: folha de pagamento, benefícios, férias e documentações.',
    tags: ['dp', 'departamento pessoal', 'folha', 'pagamento', 'férias', 'benefícios', 'documentação'],
    examples: [
      'dúvida sobre folha de pagamento',
      'solicitar férias',
      'documentação trabalhista',
      'holerite',
      'comprovante de renda',
      'declaração de férias',
      'informe de rendimentos',
      'recibo de férias',
      'contra-cheque',
      'documentos pessoais'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=zwQzDq%2FURNebF8vlbborZdKl3utR8ogBqtNlmUDLmLAb521TF%2B3l33AArRNWFsAOkyEMtCRbGHRVsSddEtOgBg%3D%3D'
  },
  {
    id: 'dp_beneficios',
    name: '[DP] Solicitações de Benefícios',
    area: 'DP',
    description: 'Solicitações referentes aos processos de Benefícios.',
    tags: ['dp', 'benefícios', 'vale', 'plano de saúde', 'vale transporte', 'vale refeição'],
    examples: [
      'solicitar vale transporte',
      'incluir dependente no plano',
      'vale refeição',
      'plano de saúde',
      'vale alimentação',
      'benefício auxílio',
      'cartão benefício',
      'incluir no plano odontológico',
      'trocar benefício',
      'cancelar benefício'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=9vcauNa8%2FrNOXGauG0BwCvDPtgsQx0TN4FvY9XXMyv%2FBDkITHcMWrMiTWw2617JxYJRJ5vWofjjBx3EqzsZCQw%3D%3D'
  },

  // ==================== FINANCEIRO ====================
  {
    id: 'financeiro_cadastro',
    name: '[Financeiro] Solicitação de cadastro',
    area: 'Financeiro',
    description: 'Pedido de criação ou atualização de dados cadastrais financeiros de fornecedores, unidades ou outros parceiros.',
    tags: ['financeiro', 'cadastro', 'fornecedor', 'dados cadastrais', 'atualização'],
    examples: [
      'cadastrar fornecedor',
      'atualizar dados cadastrais',
      'cadastro de parceiro',
      'incluir fornecedor',
      'atualizar dados bancários',
      'cadastrar novo fornecedor',
      'alterar cadastro',
      'dados cadastrais fornecedor',
      'atualização cadastral',
      'cadastro financeiro'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=bWxd0fqxy6qYGTTf3p7HOzci1wrQ6harJ%2F9NNQ7s%2FehtNVDJnIplRTF%2F8qH7xteiA3bbL9w7AG%2Bkn6yr2cTS%2BQ%3D%3D'
  },
  {
    id: 'financeiro_solicitacoes',
    name: '[Financeiro] Solicitações Financeiras',
    area: 'Financeiro',
    description: 'Demandas gerais relacionadas a processos financeiros, como pagamentos, reembolsos, fundo fixo e adiantamentos.',
    tags: ['financeiro', 'pagamento', 'reembolso', 'fundo fixo', 'adiantamento', 'nota fiscal', 'boleto'],
    examples: [
      'solicitar pagamento',
      'reembolso de despesa',
      'fundo fixo',
      'adiantamento financeiro',
      'pagar fornecedor',
      'processar nota fiscal',
      'pagamento urgente',
      'reembolsar despesa',
      'solicitar adiantamento',
      'pagar boleto'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=JF8cyskH5H5NVXdGFS50IoV6EkeXgdnRHvOYXb9nr49zF4q0ncagv9R%2FpvTp7Uwweb28QfAYhAJ3jRBqzxLWlw%3D%3D'
  },

  // ==================== FISCAL ====================
  {
    id: 'fiscal_nota_fiscal',
    name: '[Financeiro] Emissão de nota fiscal',
    area: 'Fiscal',
    description: 'Solicitação de geração e envio de nota fiscal referente a serviços prestados ou cobranças realizadas.',
    tags: ['fiscal', 'nota fiscal', 'emissão', 'nf', 'fatura', 'documento fiscal'],
    examples: [
      'emitir nota fiscal',
      'preciso de nota fiscal',
      'gerar NF',
      'emissão de nota',
      'nota fiscal de serviço',
      'solicitar nota',
      'enviar nota fiscal',
      'documento fiscal',
      'fatura nota fiscal',
      'NF de pagamento'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=QArRU4oKxfjossLnV2W9EMlVFuK3LCrjU4ZfOivN7cTwAuM3xngstL5nkA%2F%2BQyobTV9%2FkCOS%2Fk987NglvR2Eqw%3D%3D'
  },

  // ==================== JURÍDICO ====================
  {
    id: 'juridico_solicitacoes',
    name: '[Jurídico] Solicitações',
    area: 'Jurídico',
    description: 'Use este processo para solicitar análises contratuais, orientações legais, apoio em notificações, processos judiciais ou dúvidas regulatórias.',
    tags: ['jurídico', 'contrato', 'legal', 'notificação', 'processo', 'regulatório'],
    examples: [
      'análise de contrato',
      'orientação jurídica',
      'revisar contrato',
      'processo judicial',
      'notificação legal',
      'dúvida regulatória',
      'parecer jurídico',
      'análise legal',
      'suporte jurídico',
      'consultoria legal'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=aSaM%2BfKlZnonXfIvUcic4PFNY0hE36rPXqE4WD5LelQIj2M4CSACF6mo2wpj2uYqlq%2BW1yMG0RAirMnE0qTsdQ%3D%3D'
  },

  // ==================== OPERAÇÕES ====================
  {
    id: 'operacoes_frota',
    name: '[Operações] Gestão de frota',
    area: 'Operações',
    description: 'Solicitações relacionadas ao controle, manutenção, uso e logística dos veículos da instituição.',
    tags: ['operações', 'frota', 'veículo', 'carro', 'manutenção', 'transporte'],
    examples: [
      'solicitar veículo',
      'manutenção de carro',
      'usar frota',
      'agendar veículo',
      'carro da empresa',
      'transporte institucional',
      'reservar veículo',
      'manutenção frota',
      'logística veículo',
      'uso de carro'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=W3qwMDaZpzGHajln%2FYpMEBnblkHCe2QTqbENVuXrgnf1gJ44YtHg9rilTQIJlR31mZrsaBMnoeOmZYpQotSQHg%3D%3D'
  },
  {
    id: 'operacoes_compras',
    name: '[Operações] Solicitação de compras',
    area: 'Operações',
    description: 'Pedido de aquisição de materiais, serviços ou equipamentos necessários para as atividades operacionais.',
    tags: ['operações', 'compras', 'aquisição', 'material', 'equipamento', 'serviço'],
    examples: [
      'comprar material',
      'solicitar compra',
      'adquirir equipamento',
      'comprar serviço',
      'requisição de compra',
      'pedido de compra',
      'aquisição material',
      'comprar produto',
      'solicitar material',
      'equipamento novo'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=5LxGiFDCD0a%2BaDpcPmXnblXEQOIE2%2BV%2B5wX3ACHdSvQoauhq8jHLaCQOOxux%2FGoCRt%2BNVx2WfZFtDBWu0CADDA%3D%3D'
  },
  {
    id: 'operacoes_facilities',
    name: '[Operações] Solicitação de facilities (Escolas)',
    area: 'Operações',
    description: 'Solicitações de Manutenção, Utilidades, Assistência Técnica e Contratos.',
    tags: ['operações', 'facilities', 'manutenção', 'utilidades', 'assistência técnica', 'infraestrutura'],
    examples: [
      'manutenção predial',
      'reparo na escola',
      'assistência técnica',
      'problema elétrico',
      'vazamento',
      'ar condicionado',
      'manutenção geral',
      'conserto',
      'infraestrutura escolar',
      'utilidades'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=M322eelnlwqC5ZbPE9aIhYIHGoOO%2F9SyX8cjCoOzNkEm6n4EYWlNDvP79LIwl4qAyIaJgkMgb4AOiuh1hWgWDA%3D%3D'
  },
  {
    id: 'operacoes_frete',
    name: '[Operações] Solicitação de frete ou motoboy',
    area: 'Operações',
    description: 'Pedido de envio ou coleta de itens por meio de serviço de frete ou motoboy, conforme necessidade operacional.',
    tags: ['operações', 'frete', 'motoboy', 'entrega', 'envio', 'coleta', 'logística'],
    examples: [
      'solicitar frete',
      'chamar motoboy',
      'envio de documento',
      'entrega urgente',
      'coleta de material',
      'frete para entrega',
      'motoboy urgente',
      'transporte de documento',
      'enviar material',
      'coleta urgente'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=wsstEDU%2Bf0Ji6ln0zi96QtfsyXZ7t0HoVAuIgguF%2Bb40R2rE1uCTfUvuX%2FsDSgbNTn7OvdDRxUOATSFLcw%2Fclg%3D%3D'
  },
  {
    id: 'operacoes_uber_onfly',
    name: '[Operações] Solicitação de Uber e Onfly',
    area: 'Operações',
    description: 'Pedido de transporte corporativo por meio das plataformas Uber ou Onfly, conforme política interna de deslocamentos.',
    tags: ['operações', 'uber', 'onfly', 'transporte', 'deslocamento', 'corporativo'],
    examples: [
      'solicitar Uber',
      'usar Onfly',
      'transporte corporativo',
      'deslocamento a trabalho',
      'viagem corporativa',
      'uber empresarial',
      'onfly viagem',
      'transporte trabalho',
      'corrida uber',
      'passagem onfly'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=sZsfzngXT5oW0aPvHpbIahSqSqQ9nVs5IDrs869AnX16Sdzv3pfhRHt316dlEd6ZX1VVPnkqZYED6tii%2BdGBNg%3D%3D'
  },
  {
    id: 'operacoes_almoxarifado',
    name: '[Operações] Solicitações ao almoxarifado',
    area: 'Operações',
    description: 'Pedidos de retirada, reposição ou envio de materiais controlados pelo almoxarifado.',
    tags: ['operações', 'almoxarifado', 'material', 'estoque', 'retirada', 'reposição'],
    examples: [
      'retirar material do almoxarifado',
      'solicitar material',
      'repor estoque',
      'pegar material',
      'almoxarifado material',
      'requisição de material',
      'material de estoque',
      'reposição almoxarifado',
      'pedir material',
      'estoque almoxarifado'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=62fgHDFhYircCDIC9IE%2FY4tsKLyfayeasmVgoMbSZPnfNk17jEJV3P5eZ1%2FJmc14xy2BrbNZCgjRtA2glORdmQ%3D%3D'
  },

  // ==================== PERFORMANCE ====================
  {
    id: 'performance_crm',
    name: '[Performance] CRM Solicitações',
    area: 'Performance',
    description: 'Demandas relacionadas à configuração, ajustes ou suporte no uso do sistema de CRM HubSpot utilizado pela equipe.',
    tags: ['performance', 'crm', 'hubspot', 'configuração', 'suporte', 'cliente'],
    examples: [
      'suporte CRM',
      'configurar HubSpot',
      'ajuste no CRM',
      'problema no HubSpot',
      'dúvida CRM',
      'usar HubSpot',
      'cadastro no CRM',
      'integração CRM',
      'relatório HubSpot',
      'pipeline CRM'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=PxSJvmz6mNQD5P4X2Czld%2Fv8ZD%2Fu4CcXavkafnWSv0h3xF%2FTgATPdRDwKhpTw52etWhRqeTwHLSyOTL0Sy5aeA%3D%3D'
  },

  // ==================== PESSOAS & CULTURA (P&C) ====================
  {
    id: 'pc_admissao_recrutamento',
    name: '[P&C] Admissão, recrutamento e seleção',
    area: 'P&C',
    description: 'Utilize para abertura de vagas, acompanhamento de processos seletivos e demandas relacionadas à admissão de colaboradores.',
    tags: ['p&c', 'pessoas', 'cultura', 'admissão', 'recrutamento', 'seleção', 'vaga', 'contratação'],
    examples: [
      'abrir vaga',
      'contratar colaborador',
      'processo seletivo',
      'recrutar funcionário',
      'admissão novo colaborador',
      'vaga de emprego',
      'seleção de candidatos',
      'contratação',
      'nova vaga',
      'admitir funcionário'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=J4b4Y2SsJpT%2B%2FxAf9Qq2wU9xkjvhwcSd3j85Cosn0vH%2FnmVbaIAQBPuFIgKMMSEZsNpmpj0LvLEt0DA%2B%2FluLoQ%3D%3D'
  },
  {
    id: 'pc_educacao_corporativa',
    name: '[P&C] Educação Corporativa',
    area: 'P&C',
    description: 'Educação Corporativa.',
    tags: ['p&c', 'pessoas', 'cultura', 'educação', 'treinamento', 'capacitação', 'desenvolvimento'],
    examples: [
      'solicitar treinamento',
      'capacitação',
      'curso corporativo',
      'desenvolvimento profissional',
      'educação corporativa',
      'treinamento equipe',
      'programa de desenvolvimento',
      'curso para colaboradores',
      'capacitação profissional',
      'treinamento interno'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=k4KRb7HWXiVBY9RgKJHMn3%2BT%2B5meetfu2offQPJg%2FWOMGW9Y%2BFVJZg2hz4L8erKp3lcg1FaeGHo8d5PDenejPA%3D%3D'
  },
  {
    id: 'pc_movimentacao',
    name: '[P&C] Movimentação de pessoal',
    area: 'P&C',
    description: 'Utilize para solicitações de alterações no quadro de colaboradores, como promoções, transferências, mudanças de carga horária, função ou gestor.',
    tags: ['p&c', 'pessoas', 'cultura', 'movimentação', 'promoção', 'transferência', 'mudança'],
    examples: [
      'promover colaborador',
      'transferir funcionário',
      'mudar função',
      'alterar carga horária',
      'trocar gestor',
      'movimentação interna',
      'mudança de área',
      'promoção funcionário',
      'transferência unidade',
      'alterar função'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=S%2BFlp%2FXfZYUvLrxabIycLECwlSzmULkTHjNiIy1D0Sze1kp8gAWZagO%2BzxDQgvOGPI9Uj3uoGTwfpWIljbSqXg%3D%3D'
  },
  {
    id: 'pc_comunicacao_interna',
    name: '[P&C] Solicitação de comunicação interna',
    area: 'P&C',
    description: 'Utilize para solicitar divulgações internas, como comunicados, campanhas, informativos ou eventos.',
    tags: ['p&c', 'pessoas', 'cultura', 'comunicação', 'interna', 'divulgação', 'comunicado'],
    examples: [
      'divulgar comunicado',
      'comunicação interna',
      'informativo aos colaboradores',
      'campanha interna',
      'divulgação evento',
      'comunicar equipe',
      'enviar informativo',
      'comunicação colaboradores',
      'avisar funcionários',
      'comunicado geral'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=teJsIsxZj6YPes%2F3Zn9kUvyzNrraByztW9SC4xXCf1VyFB%2BNwIAne%2BdtQhbmKJjeeHJaeddwtd%2F0OuRCqwJ9WQ%3D%3D'
  },
  {
    id: 'pc_desligamento',
    name: '[P&C] Solicitação de desligamento de colaborador',
    area: 'P&C',
    description: 'Utilize para comunicar pedidos de desligamento (voluntário ou involuntário).',
    tags: ['p&c', 'pessoas', 'cultura', 'desligamento', 'demissão', 'saída'],
    examples: [
      'desligar colaborador',
      'demissão',
      'saída de funcionário',
      'desligamento voluntário',
      'demitir funcionário',
      'rescisão',
      'término contrato',
      'colaborador saindo',
      'pedido de demissão',
      'desligamento empresa'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=6c6HYUi2C%2BaUZWjgU%2Bwcd%2FYQO0N7MS7FJvbupgASy1tRHBNK1BwZKxh93OlYT9yaETWDhLTsW0JZzyNR8t%2F37A%3D%3D'
  },
  {
    id: 'pc_premiacao',
    name: '[P&C] Solicitação de pagamento de premiação',
    area: 'P&C',
    description: 'Utilize para solicitar pagamentos de bônus, prêmios ou gratificações a colaboradores e parceiros.',
    tags: ['p&c', 'pessoas', 'cultura', 'premiação', 'bônus', 'prêmio', 'gratificação'],
    examples: [
      'pagar bônus',
      'premiação colaborador',
      'gratificação',
      'pagar prêmio',
      'bonificação',
      'prêmio desempenho',
      'bônus produtividade',
      'reconhecimento financeiro',
      'pagar premiação',
      'gratificação especial'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=dDq6D4uPoaKDiFbkHzgxkirJy7mcZkwalncf1RXG%2Fv8pO4qV3bOcn1jy1lGHSB9FrvedAxapXJtkuZgBbSNvDQ%3D%3D'
  },

  // ==================== TRANSFORMAÇÃO, PLANEJAMENTO E PROJETOS (TPEP) ====================
  {
    id: 'tpep_scoreplan',
    name: '[TPEP] Solicitações Scoreplan',
    area: 'TPEP',
    description: 'Criação e alteração de usuário no scoreplan.',
    tags: ['tpep', 'scoreplan', 'usuário', 'acesso', 'planejamento'],
    examples: [
      'criar usuário scoreplan',
      'acesso ao scoreplan',
      'alterar usuário',
      'scoreplan login',
      'cadastro scoreplan',
      'permissão scoreplan',
      'usuário scoreplan',
      'acesso planejamento',
      'scoreplan acesso',
      'configurar scoreplan'
    ],
    url_prod: 'https://raizeducacao.zeev.it/2.0/request?c=qOv%2F5RqScTOFOFQYVqfZAS3YYdnh2DiTYnO5v4NPJKUkyGP2lDMFVVC3zu%2Fs2ooodVYK%2BrRcJ9JkjApNS%2FMx8A%3D%3D'
  }
];
