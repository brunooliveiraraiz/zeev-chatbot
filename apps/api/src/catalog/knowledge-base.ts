export type KnowledgeItem = {
  id: string;
  category: 'ti_infraestrutura' | 'ti_sistemas' | 'ti_bi' | 'ti_ticket_raiz';
  keywords: string[];
  troubleshooting: {
    question: string;
    possibleAnswers?: string[];
    nextSteps: {
      answer?: string;
      response: string;
      solved?: boolean;
    }[];
  }[];
};

export const KNOWLEDGE_BASE: KnowledgeItem[] = [
  // ========== INFRAESTRUTURA ==========
  {
    id: 'infra_pc_lento',
    category: 'ti_infraestrutura',
    keywords: ['lento', 'travando', 'devagar', 'demora', 'pc', 'computador', 'notebook'],
    troubleshooting: [
      {
        question: 'Vamos tentar resolver! O computador está lento desde quando?',
        nextSteps: [
          {
            response: 'Entendi. Você já tentou reiniciar o computador?',
          },
        ],
      },
      {
        question: 'Você já tentou reiniciar o computador?',
        possibleAnswers: ['sim', 'não', 'já tentei'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Tente reiniciar o computador primeiro. Isso resolve muitos problemas de lentidão. Depois me avisa se melhorou!',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Ok. Tem muitos programas abertos ao mesmo tempo? Você pode verificar no Gerenciador de Tarefas (Ctrl + Shift + Esc).',
          },
        ],
      },
      {
        question: 'Tem muitos programas abertos? O que aparece no Gerenciador de Tarefas?',
        nextSteps: [
          {
            response: 'Tente fechar programas que não está usando. Se o uso da memória ou processador estiver acima de 80%, isso pode estar deixando lento.',
          },
        ],
      },
      {
        question: 'Melhorou após fechar os programas?',
        possibleAnswers: ['sim', 'não', 'continua lento'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Que bom! Se precisar de mais ajuda, é só chamar! 😊',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Entendo. Pode ser algo mais sério. Vou te direcionar para nossa equipe analisar o equipamento com mais detalhes.',
          },
        ],
      },
    ],
  },
  {
    id: 'infra_sem_internet',
    category: 'ti_infraestrutura',
    keywords: ['internet', 'rede', 'wifi', 'conexao', 'sem internet', 'nao conecta'],
    troubleshooting: [
      {
        question: 'Vamos resolver isso! Você está usando cabo de rede ou Wi-Fi?',
        possibleAnswers: ['cabo', 'wifi', 'wireless'],
        nextSteps: [
          {
            answer: 'cabo',
            response: 'O cabo está bem conectado no computador e na tomada de rede? Verifica se as luzinhas da entrada de rede estão acesas.',
          },
          {
            answer: 'wifi',
            response: 'Outras pessoas próximas a você também estão sem internet? Ou só você?',
          },
        ],
      },
      {
        question: 'Outros colegas próximos também estão sem internet?',
        possibleAnswers: ['sim', 'não', 'só eu'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Provavelmente é problema no roteador ou na rede geral. Vou te direcionar para abrir uma solicitação de rede.',
          },
          {
            answer: 'não',
            response: 'Então o problema é só no seu computador. Você já tentou desconectar e conectar novamente no Wi-Fi?',
          },
        ],
      },
      {
        question: 'Já tentou desconectar e reconectar no Wi-Fi?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Tente desconectar e reconectar. Se pedir senha, confira se está correta. Depois me diz se funcionou!',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Você vê a rede Wi-Fi na lista de redes disponíveis?',
          },
        ],
      },
      {
        question: 'Consegue ver a rede Wi-Fi disponível?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Aparece alguma mensagem de erro ao tentar conectar?',
          },
          {
            answer: 'não',
            response: 'Pode ser problema no adaptador Wi-Fi do seu computador. Vou te direcionar para nossa equipe verificar.',
          },
        ],
      },
    ],
  },
  {
    id: 'infra_impressora',
    category: 'ti_infraestrutura',
    keywords: ['impressora', 'imprimir', 'nao imprime', 'impressao'],
    troubleshooting: [
      {
        question: 'Vamos ver isso! Quando você manda imprimir, aparece alguma mensagem de erro?',
        possibleAnswers: ['sim', 'não', 'nada acontece'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Qual mensagem aparece? Me conta o que está escrito.',
          },
          {
            answer: 'não',
            response: 'O documento vai para a fila de impressão? Você consegue ver ele na fila?',
          },
        ],
      },
      {
        question: 'O documento aparece na fila de impressão?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Fica parado na fila ou dá erro? Tenta cancelar os documentos da fila e enviar novamente.',
          },
          {
            answer: 'não',
            response: 'A impressora está selecionada como padrão? Verifica em Configurações > Impressoras.',
          },
        ],
      },
      {
        question: 'Você está perto da impressora? Ela está ligada e com papel?',
        nextSteps: [
          {
            response: 'Verifica se a impressora está ligada, tem papel e não tem nenhuma luz vermelha acesa. Se tiver luz vermelha ou mensagem no display, me conta o que diz.',
          },
        ],
      },
      {
        question: 'Após limpar a fila e reenviar, funcionou?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Ótimo! Se precisar de mais ajuda, estou por aqui! 😊',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Pode ser problema na impressora ou na configuração. Vou te direcionar para nossa equipe verificar.',
          },
        ],
      },
    ],
  },

  // ========== SISTEMAS ==========
  {
    id: 'sistemas_nao_abre',
    category: 'ti_sistemas',
    keywords: ['sistema nao abre', 'sistema nao carrega', 'sistema nao entra', 'nao consigo acessar sistema', 'sistema travado', 'totvs', 'rm'],
    troubleshooting: [
      {
        question: 'Vamos resolver! Qual sistema você está tentando acessar? (Totvs, RM, outro)',
        nextSteps: [
          {
            response: 'Entendi. Quando você tenta abrir, o que acontece? Aparece erro, fica carregando, ou não acontece nada?',
          },
        ],
      },
      {
        question: 'Você está acessando pelo navegador? Qual navegador está usando?',
        possibleAnswers: ['chrome', 'edge', 'firefox', 'internet explorer'],
        nextSteps: [
          {
            response: 'Tente abrir em outro navegador (Chrome ou Edge são os mais recomendados). Funcionou?',
          },
        ],
      },
      {
        question: 'Funcionou em outro navegador?',
        possibleAnswers: ['sim', 'não', 'nao testei'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Ótimo! O problema era no navegador anterior. Continue usando o que funcionou. Se precisar, limpe o cache do outro navegador.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Você já tentou limpar o cache do navegador? (Ctrl + Shift + Delete)',
          },
        ],
      },
      {
        question: 'Já tentou limpar o cache?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Tenta limpar o cache: aperta Ctrl + Shift + Delete, marca "Cookies" e "Cache", e limpa. Depois tenta acessar de novo.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Outros colegas também estão com problema para acessar esse sistema?',
          },
        ],
      },
      {
        question: 'Outros colegas conseguem acessar?',
        possibleAnswers: ['sim', 'não', 'nao sei'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Então o problema é específico da sua máquina ou usuário. Vou te direcionar para nossa equipe analisar.',
          },
          {
            answer: 'não',
            response: 'Se ninguém consegue acessar, o sistema pode estar fora do ar. Vou te direcionar para abrir uma solicitação urgente.',
          },
        ],
      },
    ],
  },
  {
    id: 'sistemas_erro_salvar',
    category: 'ti_sistemas',
    keywords: ['erro ao salvar', 'nao salva', 'nao consigo salvar', 'erro salvar'],
    troubleshooting: [
      {
        question: 'Vamos ver isso! Qual mensagem de erro aparece quando você tenta salvar?',
        nextSteps: [
          {
            response: 'Entendi. Isso acontece em todos os registros ou só em alguns específicos?',
          },
        ],
      },
      {
        question: 'Acontece sempre ou às vezes?',
        possibleAnswers: ['sempre', 'as vezes', 'so em alguns'],
        nextSteps: [
          {
            answer: 'sempre',
            response: 'Todos os campos obrigatórios estão preenchidos? Às vezes tem campos que não aparecem como obrigatórios mas são.',
          },
          {
            answer: 'as vezes',
            response: 'Consegue identificar algum padrão? Por exemplo, quando usa algum caractere especial ou valor específico?',
          },
        ],
      },
      {
        question: 'Você está com internet estável? Testa abrir outro site para ver se a conexão está ok.',
        nextSteps: [
          {
            response: 'Se a internet estiver instável, pode estar dando timeout. Tenta salvar novamente.',
          },
        ],
      },
      {
        question: 'Conseguiu salvar após verificar os campos e conexão?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Ótimo! Era isso mesmo. Qualquer coisa, estou aqui! 😊',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Pode ser uma validação no sistema ou bug. Vou te direcionar para nossa equipe analisar o erro específico.',
          },
        ],
      },
    ],
  },

  // ========== BUSINESS INTELLIGENCE ==========
  {
    id: 'bi_onde_encontrar',
    category: 'ti_bi',
    keywords: ['onde encontro', 'como acessar', 'onde fica', 'relatorio', 'dashboard'],
    troubleshooting: [
      {
        question: 'Vou te ajudar! Que tipo de relatório ou informação você precisa?',
        nextSteps: [
          {
            response: 'Você já acessou o Power BI ou portal de relatórios antes?',
          },
        ],
      },
      {
        question: 'Já acessou nosso portal de relatórios?',
        possibleAnswers: ['sim', 'não', 'nao sei'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Você lembra em qual seção estava o relatório que procura? (Financeiro, RH, Operações, etc)',
          },
          {
            answer: 'não',
            response: 'Os relatórios ficam no Power BI. Você tem acesso ao Power BI da empresa?',
          },
        ],
      },
      {
        question: 'Você tem acesso ao Power BI?',
        possibleAnswers: ['sim', 'não', 'nao sei'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Então primeiro você precisa de acesso ao Power BI. Vou te direcionar para solicitar o acesso.',
          },
          {
            answer: 'sim',
            response: 'Qual área é o relatório? (Vendas, Financeiro, RH, Operações...)',
          },
        ],
      },
      {
        question: 'Você precisa de um relatório que já existe ou quer criar um novo?',
        possibleAnswers: ['ja existe', 'novo', 'nao sei'],
        nextSteps: [
          {
            answer: 'ja existe',
            response: 'Se você sabe o nome ou área do relatório, pode buscar diretamente no Power BI. Se não achar, nossa equipe de BI pode te ajudar a localizar.',
          },
          {
            answer: 'novo',
            response: 'Para criar um relatório novo, você precisa fazer uma solicitação formal. Vou te direcionar para o formulário.',
          },
        ],
      },
    ],
  },
  {
    id: 'bi_dados_desatualizados',
    category: 'ti_bi',
    keywords: ['dados desatualizados', 'dados antigos', 'nao atualiza', 'desatualizado'],
    troubleshooting: [
      {
        question: 'Vamos verificar! Qual relatório ou dashboard está com dados desatualizados?',
        nextSteps: [
          {
            response: 'Qual a data dos últimos dados que aparecem? E qual data você esperava ver?',
          },
        ],
      },
      {
        question: 'Você sabe o horário de atualização desse relatório?',
        possibleAnswers: ['sim', 'não', 'nao sei'],
        nextSteps: [
          {
            answer: 'não',
            response: 'A maioria dos relatórios atualiza de madrugada (entre 2h e 6h). Alguns atualizam a cada hora. Você acessou após esse horário?',
          },
          {
            answer: 'sim',
            response: 'Já passou do horário de atualização?',
          },
        ],
      },
      {
        question: 'Já tentou atualizar a página ou clicar no botão de atualizar do relatório?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Tenta dar um F5 na página ou clicar no botão de atualizar. Às vezes fica em cache. Funcionou?',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Pode ser que a carga de dados teve algum problema. Vou te direcionar para nossa equipe de BI verificar.',
          },
        ],
      },
    ],
  },

  // ========== TICKET RAIZ ==========
  {
    id: 'ticket_esqueci_senha',
    category: 'ti_ticket_raiz',
    keywords: ['esqueci senha', 'senha', 'trocar senha', 'redefinir senha', 'resetar senha'],
    troubleshooting: [
      {
        question: 'Sem problemas! É senha de qual sistema? (Windows/Rede, Sistema específico, Email...)',
        nextSteps: [
          {
            response: 'Você tem acesso ao sistema de autoatendimento de senhas?',
          },
        ],
      },
      {
        question: 'Tem acesso ao portal de autoatendimento?',
        possibleAnswers: ['sim', 'não', 'nao sei'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Ótimo! Acesse o portal de autoatendimento e clique em "Esqueci minha senha". Você vai receber um código no email ou celular cadastrado.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Você lembra as perguntas de segurança que cadastrou?',
          },
        ],
      },
      {
        question: 'Lembra das respostas de segurança?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Tenta acessar o sistema de recuperação e responder as perguntas. Isso deve permitir redefinir sua senha.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Nesse caso, vou te direcionar para abrir uma solicitação formal de reset de senha. Nossa equipe vai validar sua identidade e resetar.',
          },
        ],
      },
    ],
  },
  {
    id: 'ticket_usuario_bloqueado',
    category: 'ti_ticket_raiz',
    keywords: ['usuario bloqueado', 'acesso bloqueado', 'login bloqueado', 'nao consigo logar', 'bloqueado'],
    troubleshooting: [
      {
        question: 'Vamos desbloquear! Aparece alguma mensagem específica quando você tenta logar?',
        nextSteps: [
          {
            response: 'Você errou a senha várias vezes seguidas?',
          },
        ],
      },
      {
        question: 'Errou a senha várias vezes?',
        possibleAnswers: ['sim', 'não', 'talvez'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Por segurança, após 5 tentativas erradas o usuário é bloqueado automaticamente por 30 minutos. Você pode aguardar ou posso te direcionar para desbloqueio imediato.',
          },
          {
            answer: 'não',
            response: 'Há quanto tempo você não usa esse acesso?',
          },
        ],
      },
      {
        question: 'Faz muito tempo que não usa?',
        possibleAnswers: ['sim', 'não', 'algumas semanas', 'meses'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Usuários inativos por mais de 90 dias são bloqueados automaticamente por segurança. Vou te direcionar para solicitar reativação.',
          },
          {
            answer: 'não',
            response: 'Pode ser um bloqueio por questão de segurança. Vou te direcionar para nossa equipe analisar e desbloquear.',
          },
        ],
      },
    ],
  },
  {
    id: 'ticket_criar_usuario',
    category: 'ti_ticket_raiz',
    keywords: ['criar usuario', 'novo usuario', 'cadastrar usuario', 'preciso de acesso'],
    troubleshooting: [
      {
        question: 'Vou te ajudar! É para criar acesso para você ou para outra pessoa?',
        possibleAnswers: ['para mim', 'outra pessoa', 'novo funcionario'],
        nextSteps: [
          {
            answer: 'para mim',
            response: 'Você é novo na empresa ou precisa de acesso a um sistema específico?',
          },
          {
            answer: 'outra pessoa',
            response: 'Para criar usuário para outra pessoa, você precisa ter autorização (ser gestor ou RH). Você tem essa autorização?',
          },
        ],
      },
      {
        question: 'Você precisa de acesso a qual sistema/área?',
        nextSteps: [
          {
            response: 'Para liberação de acessos, precisamos de alguns dados: nome completo, setor, cargo, e aprovação do gestor. Vou te direcionar para o formulário específico.',
          },
        ],
      },
    ],
  },

  // ========== INFRAESTRUTURA - NOVOS CENÁRIOS ==========
  {
    id: 'infra_pc_nao_liga',
    category: 'ti_infraestrutura',
    keywords: ['nao liga', 'não liga', 'nao inicia', 'não inicia', 'nao acende', 'pc morto', 'computador morto', 'notebook', 'nao ligando', 'ta ligando', 'nao ta ligando', 'maquina nao liga'],
    troubleshooting: [
      {
        question: 'Vamos resolver! O LED frontal do computador acende quando você aperta o botão de ligar?',
        possibleAnswers: ['sim', 'não', 'nao'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Verifica se o cabo de energia está bem conectado na tomada e no computador. Tenta trocar de tomada também.',
          },
          {
            answer: 'sim',
            response: 'O monitor está ligado e conectado? Você vê alguma imagem na tela?',
          },
        ],
      },
      {
        question: 'Após verificar o cabo, ligou?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Ótimo! Era o cabo de energia mesmo. Se precisar de mais ajuda, estou aqui!',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Você ouve algum barulho/ventilador quando liga? Ou fica totalmente silencioso?',
          },
        ],
      },
      {
        question: 'Faz algum barulho ou fica silencioso?',
        possibleAnswers: ['barulho', 'silencioso', 'nada'],
        nextSteps: [
          {
            answer: 'silencioso',
            response: 'Pode ser problema na fonte de alimentação. Vou te direcionar para nossa equipe verificar o hardware.',
          },
          {
            answer: 'barulho',
            response: 'Se liga mas não aparece nada na tela, pode ser o monitor. Tenta conectar outro monitor se possível, ou vou te direcionar para análise.',
          },
        ],
      },
    ],
  },
  {
    id: 'infra_mouse',
    category: 'ti_infraestrutura',
    keywords: ['mouse', 'mouse nao funciona', 'mouse travado', 'cursor', 'ponteiro'],
    troubleshooting: [
      {
        question: 'Vamos ver isso! É mouse com fio ou sem fio (wireless)?',
        possibleAnswers: ['fio', 'sem fio', 'wireless', 'bluetooth'],
        nextSteps: [
          {
            answer: 'fio',
            response: 'O mouse está bem conectado na entrada USB? Tenta trocar de entrada USB.',
          },
          {
            answer: 'sem fio',
            response: 'A bateria do mouse está carregada? Tenta trocar as pilhas/recarregar.',
          },
        ],
      },
      {
        question: 'Após verificar conexão/bateria, funcionou?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Perfeito! Era isso mesmo. Qualquer coisa, estou aqui!',
            solved: true,
          },
          {
            answer: 'não',
            response: 'O LED do mouse acende? Se tiver LED, está aceso?',
          },
        ],
      },
      {
        question: 'LED acende?',
        possibleAnswers: ['sim', 'não', 'nao tem'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Se o LED não acende, o mouse pode estar com defeito. Vou te direcionar para solicitar substituição.',
          },
          {
            answer: 'sim',
            response: 'Pode ser problema de driver ou configuração. Vou te direcionar para nossa equipe verificar.',
          },
        ],
      },
    ],
  },
  {
    id: 'infra_teclado',
    category: 'ti_infraestrutura',
    keywords: ['teclado', 'tecla', 'nao digita', 'não digita', 'teclas'],
    troubleshooting: [
      {
        question: 'Vou te ajudar! Nenhuma tecla funciona ou apenas algumas?',
        possibleAnswers: ['nenhuma', 'algumas', 'so algumas'],
        nextSteps: [
          {
            answer: 'nenhuma',
            response: 'O teclado é com fio ou sem fio?',
          },
          {
            answer: 'algumas',
            response: 'Quais teclas não funcionam? São números, letras ou teclas especiais?',
          },
        ],
      },
      {
        question: 'É teclado com fio ou sem fio?',
        possibleAnswers: ['fio', 'sem fio'],
        nextSteps: [
          {
            answer: 'fio',
            response: 'Verifica se está bem conectado no USB. Tenta outra entrada USB.',
          },
          {
            answer: 'sem fio',
            response: 'Verifica as pilhas/bateria. Tenta trocar ou recarregar.',
          },
        ],
      },
      {
        question: 'Após verificar, funcionou?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Ótimo! Resolvido! Se precisar, estou aqui!',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Pode ser defeito no teclado. Vou te direcionar para solicitar substituição.',
          },
        ],
      },
    ],
  },
  {
    id: 'infra_monitor',
    category: 'ti_infraestrutura',
    keywords: ['monitor', 'tela', 'sem imagem', 'tela preta', 'sem video'],
    troubleshooting: [
      {
        question: 'Vamos resolver! O monitor está ligado? O LED dele acende?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Verifica se o cabo de energia do monitor está conectado na tomada e no monitor. Tenta outra tomada.',
          },
          {
            answer: 'sim',
            response: 'O cabo de vídeo (HDMI/DisplayPort/VGA) está bem conectado no computador e no monitor?',
          },
        ],
      },
      {
        question: 'Após verificar os cabos, apareceu imagem?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Ótimo! Era o cabo mesmo! Se precisar, estou aqui!',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Aparece alguma mensagem no monitor tipo "Sem sinal" ou "No signal"?',
          },
        ],
      },
      {
        question: 'Aparece "Sem sinal"?',
        possibleAnswers: ['sim', 'não', 'tela totalmente preta'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'O problema pode estar no computador ou na placa de vídeo. Vou te direcionar para análise técnica.',
          },
          {
            answer: 'não',
            response: 'Pode ser defeito no monitor. Vou te direcionar para verificação.',
          },
        ],
      },
    ],
  },
  {
    id: 'infra_vpn',
    category: 'ti_infraestrutura',
    keywords: ['vpn', 'vpn nao conecta', 'rede vpn', 'acesso remoto vpn', 'conexao vpn'],
    troubleshooting: [
      {
        question: 'Vamos resolver a VPN! Qual mensagem de erro aparece quando você tenta conectar?',
        nextSteps: [
          {
            response: 'Você está em home office ou fora da empresa?',
          },
        ],
      },
      {
        question: 'Está em home office?',
        possibleAnswers: ['sim', 'não', 'remoto'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Sua internet doméstica está funcionando bem? Consegue acessar sites normalmente?',
          },
          {
            answer: 'não',
            response: 'Se está na empresa, não precisa de VPN. Você pode acessar os sistemas pela rede interna.',
            solved: true,
          },
        ],
      },
      {
        question: 'Internet funciona normal?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Você já tentou desconectar e conectar novamente? Às vezes é preciso reconectar.',
          },
          {
            answer: 'não',
            response: 'Primeiro precisa resolver sua conexão de internet. Depois tenta a VPN novamente.',
            solved: true,
          },
        ],
      },
      {
        question: 'Tentou reconectar?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Desconecta e tenta conectar novamente. Se pedir usuário e senha, verifica se estão corretos.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Pode ser problema de configuração ou nas credenciais. Vou te direcionar para nossa equipe verificar.',
          },
        ],
      },
    ],
  },
  {
    id: 'infra_email',
    category: 'ti_infraestrutura',
    keywords: ['email', 'outlook', 'email nao sincroniza', 'emails nao chegam', 'nao recebo email', 'email nao chega', 'correio eletronico', 'problema email', 'outlook nao sincroniza', 'nao estao chegando', 'emails nao', 'receber email', 'chegam email'],
    troubleshooting: [
      {
        question: 'Vamos resolver! Você está usando Outlook, webmail ou celular?',
        possibleAnswers: ['outlook', 'webmail', 'celular', 'navegador'],
        nextSteps: [
          {
            answer: 'outlook',
            response: 'O Outlook está conectado? Aparece "Offline" ou "Desconectado" no canto inferior?',
          },
          {
            answer: 'webmail',
            response: 'Pelo webmail (navegador) você consegue ver os emails?',
          },
          {
            answer: 'celular',
            response: 'Pelo computador (webmail) você consegue acessar normalmente?',
          },
        ],
      },
      {
        question: 'Está mostrando offline?',
        possibleAnswers: ['sim', 'não', 'desconectado'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Clica em "Enviar/Receber" no menu do Outlook e depois em "Trabalhar Offline" para desmarcar.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Quando foi a última vez que recebeu emails? Há quanto tempo não sincroniza?',
          },
        ],
      },
      {
        question: 'Há quanto tempo não recebe emails?',
        nextSteps: [
          {
            response: 'Sua internet está funcionando? Consegue acessar sites normalmente?',
          },
        ],
      },
      {
        question: 'Internet funciona?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Pode ser problema na configuração do email ou caixa postal cheia. Vou te direcionar para verificação.',
          },
          {
            answer: 'não',
            response: 'Primeiro precisa resolver a conexão de internet. Depois o email deve sincronizar automaticamente.',
            solved: true,
          },
        ],
      },
    ],
  },
  {
    id: 'infra_webcam',
    category: 'ti_infraestrutura',
    keywords: ['webcam', 'camera', 'câmera', 'video', 'cam nao funciona'],
    troubleshooting: [
      {
        question: 'Vamos ver! A webcam é do notebook (integrada) ou externa?',
        possibleAnswers: ['integrada', 'externa', 'notebook', 'usb'],
        nextSteps: [
          {
            answer: 'integrada',
            response: 'Você está tentando usar em qual programa? Teams, Zoom, outro?',
          },
          {
            answer: 'externa',
            response: 'A webcam está bem conectada na USB? Tenta outra entrada USB.',
          },
        ],
      },
      {
        question: 'Qual programa você está usando?',
        nextSteps: [
          {
            response: 'Nas configurações do programa, a câmera correta está selecionada?',
          },
        ],
      },
      {
        question: 'Câmera correta está selecionada?',
        possibleAnswers: ['sim', 'não', 'nao sei'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Nas configurações de áudio e vídeo do programa, selecione a câmera correta e teste. Funcionou?',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Fecha o programa completamente e abre de novo. Às vezes outro programa está usando a câmera.',
          },
        ],
      },
      {
        question: 'Após fechar e reabrir, funcionou?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Ótimo! Resolvido! Qualquer coisa, estou aqui!',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Pode ser problema de driver ou configuração do Windows. Vou te direcionar para análise técnica.',
          },
        ],
      },
    ],
  },
  {
    id: 'infra_audio',
    category: 'ti_infraestrutura',
    keywords: ['audio', 'áudio', 'som', 'microfone', 'headset', 'fone', 'sem som', 'nao escuto', 'microfone nao funciona', 'headset nao funciona', 'problema de audio', 'problema de som'],
    troubleshooting: [
      {
        question: 'Vamos resolver! É problema no áudio de saída (você não ouve) ou entrada (microfone)?',
        possibleAnswers: ['saida', 'entrada', 'ambos', 'nao ouço', 'microfone'],
        nextSteps: [
          {
            answer: 'saida',
            response: 'Você está usando fone/headset ou os alto-falantes do PC?',
          },
          {
            answer: 'entrada',
            response: 'O microfone está mutado (com X vermelho) no Windows ou no programa que está usando?',
          },
          {
            answer: 'ambos',
            response: 'Seu fone/headset está bem conectado? Se for USB, tenta outra entrada.',
          },
        ],
      },
      {
        question: 'Usando fone ou alto-falante?',
        possibleAnswers: ['fone', 'headset', 'alto-falante', 'caixa de som'],
        nextSteps: [
          {
            answer: 'fone',
            response: 'O fone está bem conectado? Se for USB, está em qual entrada?',
          },
          {
            answer: 'alto-falante',
            response: 'O volume do Windows está alto? Clica no ícone de som e verifica.',
          },
        ],
      },
      {
        question: 'Volume do Windows está ok?',
        possibleAnswers: ['sim', 'não', 'estava mudo'],
        nextSteps: [
          {
            answer: 'estava mudo',
            response: 'Era isso! Aumenta o volume e pronto! Se precisar, estou aqui!',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'No canto inferior direito, clica com botão direito no ícone de som > Abrir configurações de som. Verifica se o dispositivo correto está selecionado como padrão.',
          },
        ],
      },
      {
        question: 'Dispositivo correto selecionado?',
        possibleAnswers: ['sim', 'não', 'mudei'],
        nextSteps: [
          {
            answer: 'mudei',
            response: 'Perfeito! Funcionou agora? Testa um áudio.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Pode ser problema de driver de áudio. Vou te direcionar para análise técnica.',
          },
        ],
      },
    ],
  },
  {
    id: 'infra_instalacao',
    category: 'ti_infraestrutura',
    keywords: ['instalar', 'instalacao', 'instalação', 'programa', 'software', 'preciso instalar'],
    troubleshooting: [
      {
        question: 'Qual programa você precisa instalar?',
        nextSteps: [
          {
            response: 'Esse programa já está disponível no catálogo de aplicativos da empresa ou você está pedindo um novo?',
          },
        ],
      },
      {
        question: 'É um programa novo ou já existe no catálogo?',
        possibleAnswers: ['novo', 'ja existe', 'catálogo', 'nao sei'],
        nextSteps: [
          {
            answer: 'ja existe',
            response: 'Você tem permissão de administrador no seu computador? Tenta instalar pelo Portal de Aplicativos da empresa.',
            solved: true,
          },
          {
            answer: 'novo',
            response: 'Para instalar programas novos, precisa de aprovação do gestor. Vou te direcionar para abrir a solicitação formal.',
          },
          {
            answer: 'nao sei',
            response: 'Tenta verificar no Portal de Aplicativos da empresa. Se não tiver lá, vou te direcionar para solicitação.',
          },
        ],
      },
    ],
  },
  {
    id: 'infra_backup',
    category: 'ti_infraestrutura',
    keywords: ['backup', 'arquivo perdido', 'arquivo deletado', 'recuperar arquivo', 'perdi arquivo'],
    troubleshooting: [
      {
        question: 'Você deletou um arquivo ou ele desapareceu?',
        possibleAnswers: ['deletei', 'desapareceu', 'nao acho'],
        nextSteps: [
          {
            answer: 'deletei',
            response: 'Há quanto tempo você deletou? Foi hoje ou já faz alguns dias?',
          },
          {
            answer: 'desapareceu',
            response: 'O arquivo estava salvo no computador local (Documentos/Desktop) ou em rede/nuvem?',
          },
        ],
      },
      {
        question: 'Deletou quando?',
        possibleAnswers: ['hoje', 'ontem', 'semana', 'mes'],
        nextSteps: [
          {
            answer: 'hoje',
            response: 'Verifica a Lixeira do Windows. O arquivo pode estar lá e você consegue restaurar.',
            solved: true,
          },
          {
            answer: 'ontem',
            response: 'Verifica primeiro a Lixeira. Se não tiver, pode ser recuperado de backup. Vou te direcionar para solicitação de recuperação.',
          },
        ],
      },
      {
        question: 'Estava salvo onde?',
        possibleAnswers: ['computador', 'local', 'rede', 'nuvem', 'onedrive'],
        nextSteps: [
          {
            answer: 'rede',
            response: 'Arquivos em rede têm backup diário. Vou te direcionar para solicitar recuperação do backup.',
          },
          {
            answer: 'local',
            response: 'Arquivos salvos apenas no computador local podem não ter backup. Vou te direcionar para verificar se é possível recuperar.',
          },
        ],
      },
    ],
  },

  // ========== SISTEMAS - NOVOS CENÁRIOS ==========
  {
    id: 'sistemas_lento',
    category: 'ti_sistemas',
    keywords: ['sistema lento', 'travando', 'demora carregar', 'sistema pesado', 'lentidao sistema'],
    troubleshooting: [
      {
        question: 'Vamos resolver! Qual sistema está lento? (Totvs, RM, outro)',
        nextSteps: [
          {
            response: 'Isso está acontecendo desde quando? Começou agora ou já faz um tempo?',
          },
        ],
      },
      {
        question: 'Está lento apenas para você ou outros colegas também estão reclamando?',
        possibleAnswers: ['só eu', 'outros também', 'não sei'],
        nextSteps: [
          {
            answer: 'só eu',
            response: 'Verifica se tem muitos programas abertos no seu computador. Fecha o que não está usando e tenta novamente.',
          },
          {
            answer: 'outros também',
            response: 'Se várias pessoas estão com lentidão, pode ser problema no servidor ou rede. Vou te direcionar para abrir chamado urgente.',
          },
        ],
      },
      {
        question: 'Você está fazendo alguma operação pesada tipo gerar relatórios grandes ou importar dados?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Operações pesadas podem demorar mesmo. Aguarda um pouco mais. Se travar completamente, me avisa.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Tenta fechar o sistema completamente e abrir de novo. Às vezes resolve. Funcionou?',
          },
        ],
      },
      {
        question: 'Melhorou após fechar e reabrir?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Ótimo! Se voltar a ficar lento, me avisa! 😊',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Pode ser problema de performance do sistema. Vou te direcionar para nossa equipe analisar.',
          },
        ],
      },
    ],
  },
  {
    id: 'sistemas_nao_loga',
    category: 'ti_sistemas',
    keywords: ['nao consigo logar', 'login falhou', 'senha incorreta sistema', 'usuario invalido', 'erro login', 'falha login', 'login nao funciona', 'senha nao aceita'],
    troubleshooting: [
      {
        question: 'Qual mensagem aparece quando você tenta fazer login?',
        nextSteps: [
          {
            response: 'Você tem certeza que está usando a senha correta? Tenta digitar bem devagar.',
          },
        ],
      },
      {
        question: 'Você usa a mesma senha em outros sistemas da empresa?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Nesses outros sistemas você consegue logar normalmente?',
          },
          {
            answer: 'não',
            response: 'Você lembra quando foi a última vez que conseguiu logar nesse sistema?',
          },
        ],
      },
      {
        question: 'Nos outros sistemas consegue logar?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Então sua senha está correta. Pode ser que seu usuário nesse sistema específico esteja com problema. Vou te direcionar para verificação.',
          },
          {
            answer: 'não',
            response: 'Se não consegue logar em nenhum sistema, sua senha pode ter expirado. Vou te direcionar para reset de senha.',
          },
        ],
      },
    ],
  },
  {
    id: 'sistemas_impressao',
    category: 'ti_sistemas',
    keywords: ['erro imprimir sistema', 'nao imprime sistema', 'impressao sistema falha'],
    troubleshooting: [
      {
        question: 'Quando você tenta imprimir pelo sistema, o que acontece?',
        nextSteps: [
          {
            response: 'A impressora funciona normalmente quando você imprime de outros programas (Word, PDF)?',
          },
        ],
      },
      {
        question: 'De outros programas imprime normal?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Então o problema é só no sistema. No sistema, qual impressora está selecionada?',
          },
          {
            answer: 'não',
            response: 'Se não imprime nada, o problema é na impressora. Vou te direcionar para suporte de impressoras.',
          },
        ],
      },
      {
        question: 'No sistema, aparece a impressora correta para selecionar?',
        possibleAnswers: ['sim', 'não', 'não sei'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Pode ser que a impressora não esteja configurada no sistema. Vou te direcionar para configuração.',
          },
          {
            answer: 'sim',
            response: 'Tenta selecionar novamente e testar. Se não funcionar, pode ser configuração do sistema. Vou te direcionar.',
          },
        ],
      },
    ],
  },
  {
    id: 'sistemas_relatorio_nao_gera',
    category: 'ti_sistemas',
    keywords: ['relatorio nao gera', 'nao consigo gerar relatorio', 'erro relatorio sistema', 'relatorio travou'],
    troubleshooting: [
      {
        question: 'Qual relatório você está tentando gerar?',
        nextSteps: [
          {
            response: 'Quando você clica para gerar, aparece alguma mensagem de erro?',
          },
        ],
      },
      {
        question: 'Aparece mensagem de erro?',
        possibleAnswers: ['sim', 'não', 'só fica carregando'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Qual é a mensagem? Me conta o que está escrito.',
          },
          {
            answer: 'só fica carregando',
            response: 'Há quanto tempo está carregando? Relatórios grandes podem demorar vários minutos.',
          },
        ],
      },
      {
        question: 'Você está filtrando um período muito grande de dados?',
        possibleAnswers: ['sim', 'não', 'não sei'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Tenta reduzir o período (ex: só 1 mês ao invés de 1 ano) e gerar de novo. Pode ajudar na performance.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Pode ser erro no sistema ou no relatório. Vou te direcionar para análise.',
          },
        ],
      },
    ],
  },
  {
    id: 'sistemas_integracao',
    category: 'ti_sistemas',
    keywords: ['integracao nao funciona', 'sincronizacao sistema', 'dados nao integram', 'conexao entre sistemas'],
    troubleshooting: [
      {
        question: 'Quais sistemas não estão integrando? (Ex: Totvs com RM, sistema X com Y)',
        nextSteps: [
          {
            response: 'O que você estava tentando fazer quando percebeu que não integrou?',
          },
        ],
      },
      {
        question: 'Essa integração funcionava antes?',
        possibleAnswers: ['sim', 'não', 'primeira vez'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Quando foi a última vez que funcionou? Hoje, ontem, semana passada?',
          },
          {
            answer: 'primeira vez',
            response: 'Se é a primeira vez usando, pode não estar configurado ainda. Vou te direcionar para configuração.',
          },
        ],
      },
      {
        question: 'Outros colegas também estão com problema na integração?',
        possibleAnswers: ['sim', 'não', 'não sei'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Se vários estão com problema, a integração pode estar quebrada. Vou te direcionar para chamado urgente.',
          },
          {
            answer: 'não',
            response: 'Pode ser permissão específica do seu usuário. Vou te direcionar para verificação.',
          },
        ],
      },
    ],
  },
  {
    id: 'sistemas_campo_obrigatorio',
    category: 'ti_sistemas',
    keywords: ['campo obrigatorio nao aparece', 'campo sumiu', 'nao vejo campo', 'falta campo'],
    troubleshooting: [
      {
        question: 'Qual campo você está procurando?',
        nextSteps: [
          {
            response: 'Esse campo aparecia antes para você?',
          },
        ],
      },
      {
        question: 'Aparecia antes?',
        possibleAnswers: ['sim', 'não', 'primeira vez acessando'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Tenta dar um F5 ou atualizar a página. Às vezes o sistema não carrega tudo.',
            solved: true,
          },
          {
            answer: 'primeira vez acessando',
            response: 'Pode ser que você não tenha permissão para ver esse campo. Vou te direcionar para verificação.',
          },
        ],
      },
      {
        question: 'Após atualizar apareceu?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Perfeito! Era cache do navegador. Se sumir de novo, só atualizar! 😊',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Pode ser configuração do perfil ou tela. Vou te direcionar para análise.',
          },
        ],
      },
    ],
  },
  {
    id: 'sistemas_anexo',
    category: 'ti_sistemas',
    keywords: ['nao consigo anexar', 'erro anexar arquivo', 'upload falha', 'arquivo nao sobe'],
    troubleshooting: [
      {
        question: 'Qual tipo de arquivo você está tentando anexar? (PDF, Excel, Imagem, outro)',
        nextSteps: [
          {
            response: 'Qual o tamanho do arquivo? É muito grande (acima de 10MB)?',
          },
        ],
      },
      {
        question: 'O arquivo é grande (acima de 10MB)?',
        possibleAnswers: ['sim', 'não', 'não sei'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Arquivos muito grandes podem ter limite. Tenta compactar (ZIP) ou usar arquivo menor.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Aparece alguma mensagem de erro quando você tenta anexar?',
          },
        ],
      },
      {
        question: 'Aparece mensagem de erro?',
        possibleAnswers: ['sim', 'não', 'só não anexa'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Qual mensagem aparece? Me conta.',
          },
          {
            answer: 'só não anexa',
            response: 'Tenta usar outro navegador (Chrome ou Edge). Às vezes resolve. Funcionou?',
          },
        ],
      },
      {
        question: 'No outro navegador funcionou?',
        possibleAnswers: ['sim', 'não', 'não testei'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Ótimo! Era problema no navegador. Usa o que funcionou ou limpa cache do outro.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Pode ser problema no sistema ou configuração. Vou te direcionar para análise.',
          },
        ],
      },
    ],
  },
  {
    id: 'sistemas_dados_nao_carregam',
    category: 'ti_sistemas',
    keywords: ['dados nao carregam', 'sistema vazio', 'nao aparece informacao', 'tela branca'],
    troubleshooting: [
      {
        question: 'A tela fica completamente em branco ou aparece a estrutura mas sem dados?',
        possibleAnswers: ['branco', 'sem dados', 'estrutura aparece'],
        nextSteps: [
          {
            answer: 'branco',
            response: 'Quanto tempo você aguardou? Às vezes demora para carregar.',
          },
          {
            answer: 'sem dados',
            response: 'Você aplicou algum filtro que pode estar sem resultados?',
          },
        ],
      },
      {
        question: 'Aplicou filtros?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Tenta limpar os filtros ou ampliar o período de busca. Pode não ter dados nesse filtro específico.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Tenta dar F5 para recarregar a página. Funcionou?',
          },
        ],
      },
      {
        question: 'Após recarregar apareceu?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Ótimo! Era só cache. Se acontecer de novo, só recarregar! 😊',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Pode ser problema na consulta ou banco de dados. Vou te direcionar para análise.',
          },
        ],
      },
    ],
  },
  {
    id: 'sistemas_permissao_negada',
    category: 'ti_sistemas',
    keywords: ['permissao negada', 'acesso negado sistema', 'nao tenho permissao', 'sem autorizacao', 'dando permissao negada', 'negada permissao', 'sem acesso funcionalidade', 'nao autorizado'],
    troubleshooting: [
      {
        question: 'Onde aparece a mensagem de permissão negada? Em qual funcionalidade?',
        nextSteps: [
          {
            response: 'Você já teve acesso a essa funcionalidade antes?',
          },
        ],
      },
      {
        question: 'Já teve acesso antes?',
        possibleAnswers: ['sim', 'não', 'primeira vez tentando'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Quando foi a última vez que conseguiu usar? Hoje, ontem, semana passada?',
          },
          {
            answer: 'primeira vez tentando',
            response: 'Então você precisa solicitar essa permissão. Você já conversou com seu gestor sobre isso?',
          },
        ],
      },
      {
        question: 'Seu gestor aprovou essa permissão?',
        possibleAnswers: ['sim', 'não', 'não sei'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Com aprovação do gestor, vou te direcionar para solicitar a liberação de acesso.',
          },
          {
            answer: 'não',
            response: 'Primeiro precisa da aprovação do gestor. Depois volta e a gente libera o acesso.',
            solved: true,
          },
        ],
      },
    ],
  },
  {
    id: 'sistemas_deslogou',
    category: 'ti_sistemas',
    keywords: ['deslogou sozinho', 'caiu sistema', 'sessao expirou', 'precisa logar novamente'],
    troubleshooting: [
      {
        question: 'Isso aconteceu uma vez ou está acontecendo várias vezes seguidas?',
        possibleAnswers: ['uma vez', 'varias vezes', 'toda hora'],
        nextSteps: [
          {
            answer: 'uma vez',
            response: 'Pode ter sido manutenção ou atualização do sistema. Tenta logar novamente.',
            solved: true,
          },
          {
            answer: 'varias vezes',
            response: 'Quanto tempo você fica logado antes de cair? Minutos, horas?',
          },
        ],
      },
      {
        question: 'Você deixa o sistema aberto sem usar por muito tempo?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Por segurança, o sistema desloga após 30 minutos de inatividade. É normal. Só logar de novo.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Você está usando VPN? Às vezes quando a VPN cai, o sistema desloga.',
          },
        ],
      },
      {
        question: 'Está usando VPN?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Verifica se a VPN continua conectada. Se cair, o sistema desloga. Mantém a VPN estável.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Pode ser instabilidade de conexão ou problema no sistema. Vou te direcionar para análise.',
          },
        ],
      },
    ],
  },

  // ========== BUSINESS INTELLIGENCE - NOVOS CENÁRIOS ==========
  {
    id: 'bi_dashboard_nao_atualiza',
    category: 'ti_bi',
    keywords: ['dashboard nao atualiza', 'relatorio desatualizado', 'dados nao atualizaram', 'power bi nao atualiza', 'nao esta atualizando', 'dashboard desatualizado', 'dados antigos bi'],
    troubleshooting: [
      {
        question: 'Qual dashboard não está atualizando?',
        nextSteps: [
          {
            response: 'Quando foi a última atualização que você vê nos dados?',
          },
        ],
      },
      {
        question: 'Você sabe qual o horário de atualização desse dashboard?',
        possibleAnswers: ['sim', 'não', 'não sei'],
        nextSteps: [
          {
            answer: 'não',
            response: 'A maioria dos dashboards atualiza de madrugada. Você acessou depois das 8h da manhã?',
          },
          {
            answer: 'sim',
            response: 'Já passou do horário de atualização?',
          },
        ],
      },
      {
        question: 'Você já tentou clicar em "Atualizar" no Power BI?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'No canto superior direito do Power BI tem um botão de atualizar. Clica nele e aguarda. Funcionou?',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Mesmo atualizando continua com dados antigos? Pode ser problema na carga. Vou te direcionar para BI verificar.',
          },
        ],
      },
    ],
  },
  {
    id: 'bi_erro_abrir',
    category: 'ti_bi',
    keywords: ['erro abrir relatorio', 'nao abre dashboard', 'power bi nao abre', 'erro carregar bi'],
    troubleshooting: [
      {
        question: 'Qual mensagem de erro aparece quando você tenta abrir?',
        nextSteps: [
          {
            response: 'Você está tentando abrir pelo navegador ou aplicativo Power BI Desktop?',
          },
        ],
      },
      {
        question: 'Pelo navegador ou aplicativo?',
        possibleAnswers: ['navegador', 'aplicativo', 'desktop'],
        nextSteps: [
          {
            answer: 'navegador',
            response: 'Tenta abrir em modo anônimo/privado (Ctrl + Shift + N). Funcionou?',
          },
          {
            answer: 'aplicativo',
            response: 'Você está logado no Power BI com sua conta da empresa?',
          },
        ],
      },
      {
        question: 'No modo anônimo funcionou?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Era cache do navegador. Limpa o cache (Ctrl + Shift + Delete) e deve funcionar no modo normal também.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Pode ser problema de permissão ou no arquivo. Vou te direcionar para BI analisar.',
          },
        ],
      },
    ],
  },
  {
    id: 'bi_dados_errados',
    category: 'ti_bi',
    keywords: ['dados errados', 'informacao incorreta', 'divergencia dados', 'numero errado relatorio'],
    troubleshooting: [
      {
        question: 'Quais dados estão errados? Me dá um exemplo específico.',
        nextSteps: [
          {
            response: 'Você está comparando com qual fonte? De onde você tirou os dados corretos?',
          },
        ],
      },
      {
        question: 'De onde vem os dados corretos que você está comparando?',
        possibleAnswers: ['sistema', 'planilha', 'outro relatorio'],
        nextSteps: [
          {
            answer: 'sistema',
            response: 'Você verificou se está usando o mesmo período/filtro no sistema e no dashboard?',
          },
          {
            answer: 'planilha',
            response: 'A planilha está atualizada? Planilhas manuais podem divergir dos dados automatizados.',
          },
        ],
      },
      {
        question: 'Está usando mesmo filtro/período?',
        possibleAnswers: ['sim', 'não', 'não sei'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Tenta ajustar os filtros para ficarem iguais. Isso pode explicar a diferença.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Se os filtros são iguais e os dados divergem, pode ter erro na query. Vou te direcionar para BI investigar.',
          },
        ],
      },
    ],
  },
  {
    id: 'bi_nao_encontra',
    category: 'ti_bi',
    keywords: ['nao encontro relatorio', 'cadê dashboard', 'onde esta relatorio', 'sumiu dashboard'],
    troubleshooting: [
      {
        question: 'Qual relatório você está procurando?',
        nextSteps: [
          {
            response: 'Você já acessou esse relatório antes ou é primeira vez?',
          },
        ],
      },
      {
        question: 'Já acessou antes?',
        possibleAnswers: ['sim', 'não', 'primeira vez'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Quando foi a última vez que você viu ele? Hoje, semana passada?',
          },
          {
            answer: 'primeira vez',
            response: 'Alguém te indicou esse relatório ou você viu em algum lugar? Você tem certeza que ele existe?',
          },
        ],
      },
      {
        question: 'Você tentou buscar no Power BI usando a caixa de pesquisa?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'No Power BI, usa a barra de pesquisa no topo. Digita palavras-chave relacionadas ao relatório.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Se buscou e não achou, pode não ter permissão ou o relatório pode ter mudado de nome. Vou te direcionar para BI te ajudar.',
          },
        ],
      },
    ],
  },
  {
    id: 'bi_permissao',
    category: 'ti_bi',
    keywords: ['sem permissao bi', 'acesso negado power bi', 'nao tenho acesso dashboard', 'permissao negada relatorio'],
    troubleshooting: [
      {
        question: 'Qual dashboard está com acesso negado?',
        nextSteps: [
          {
            response: 'Você já teve acesso a esse dashboard antes?',
          },
        ],
      },
      {
        question: 'Já teve acesso antes?',
        possibleAnswers: ['sim', 'não', 'primeira vez pedindo'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Quando você perdeu o acesso? Foi hoje ou já faz tempo?',
          },
          {
            answer: 'primeira vez pedindo',
            response: 'Você precisa solicitar acesso ao dashboard. Seu gestor aprovou?',
          },
        ],
      },
      {
        question: 'Seu gestor aprovou o acesso?',
        possibleAnswers: ['sim', 'não', 'não pedi ainda'],
        nextSteps: [
          {
            answer: 'não pedi ainda',
            response: 'Primeiro precisa do aval do gestor. Depois solicita o acesso formalmente.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Com aprovação, vou te direcionar para solicitar liberação do acesso ao dashboard.',
          },
        ],
      },
    ],
  },
  {
    id: 'bi_lento',
    category: 'ti_bi',
    keywords: ['power bi lento', 'dashboard lento', 'relatorio demora', 'carrega devagar bi'],
    troubleshooting: [
      {
        question: 'Qual dashboard está lento?',
        nextSteps: [
          {
            response: 'Está lento apenas hoje ou sempre foi assim?',
          },
        ],
      },
      {
        question: 'Sempre foi lento ou só hoje?',
        possibleAnswers: ['sempre', 'só hoje', 'essa semana'],
        nextSteps: [
          {
            answer: 'sempre',
            response: 'Dashboards com muitos dados podem ser lentos mesmo. Quantos filtros você tem aplicados?',
          },
          {
            answer: 'só hoje',
            response: 'Outros dashboards também estão lentos ou só esse?',
          },
        ],
      },
      {
        question: 'Tem muitos filtros aplicados?',
        possibleAnswers: ['sim', 'não', 'alguns'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Tenta remover alguns filtros ou reduzir o período de datas. Isso ajuda na performance.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Se não tem muitos filtros e está lento, pode ser volume de dados. Vou te direcionar para BI otimizar.',
          },
        ],
      },
    ],
  },
  {
    id: 'bi_exportar',
    category: 'ti_bi',
    keywords: ['erro exportar', 'nao baixa relatorio', 'download falha', 'erro download excel', 'nao consigo baixar', 'baixar relatorio', 'exportar excel', 'download nao funciona'],
    troubleshooting: [
      {
        question: 'Você está tentando exportar para qual formato? (Excel, PDF, PowerPoint)',
        nextSteps: [
          {
            response: 'Quando você clica para exportar, aparece alguma mensagem de erro?',
          },
        ],
      },
      {
        question: 'Aparece mensagem de erro?',
        possibleAnswers: ['sim', 'não', 'só não baixa'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Qual é a mensagem? Me conta o que diz.',
          },
          {
            answer: 'só não baixa',
            response: 'Verifica na pasta de Downloads do seu computador. Às vezes baixa mas você não percebe.',
          },
        ],
      },
      {
        question: 'Verificou na pasta Downloads?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Abre a pasta Downloads (normalmente C:\\Users\\SeuNome\\Downloads) e procura o arquivo. Está lá?',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Se não está na pasta, pode ser bloqueio do navegador. Verifica se o navegador não bloqueou o download (ícone de download com X).',
          },
        ],
      },
      {
        question: 'Navegador bloqueou o download?',
        possibleAnswers: ['sim', 'não', 'não sei'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Clica no ícone de bloqueio e permite o download. Ou tenta em outro navegador.',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Pode ser problema no Power BI ou permissão. Vou te direcionar para análise.',
          },
        ],
      },
    ],
  },
  {
    id: 'bi_grafico_nao_aparece',
    category: 'ti_bi',
    keywords: ['grafico nao aparece', 'visual nao carrega', 'grafico vazio', 'nao mostra grafico', 'nao esta aparecendo', 'grafico sumiu', 'grafico nao mostra', 'grafico', 'aparecendo', 'visual vazio'],
    troubleshooting: [
      {
        question: 'O gráfico fica totalmente em branco ou aparece alguma mensagem?',
        possibleAnswers: ['branco', 'mensagem erro', 'carregando'],
        nextSteps: [
          {
            answer: 'branco',
            response: 'Outros gráficos no mesmo dashboard aparecem normalmente?',
          },
          {
            answer: 'mensagem erro',
            response: 'Qual mensagem aparece? Me conta.',
          },
          {
            answer: 'carregando',
            response: 'Há quanto tempo está carregando? Aguarda mais 1 minuto.',
          },
        ],
      },
      {
        question: 'Outros gráficos aparecem?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Se só um gráfico específico não aparece, pode ter erro nele. Tenta aplicar/limpar filtros. Funcionou?',
          },
          {
            answer: 'não',
            response: 'Se nenhum gráfico aparece, pode ser problema de conexão ou permissão. Vou te direcionar para verificação.',
          },
        ],
      },
      {
        question: 'Funcionou após mexer nos filtros?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Ótimo! Era filtro que não tinha dados. Qualquer coisa, estou aqui! 😊',
            solved: true,
          },
          {
            answer: 'não',
            response: 'Pode ter erro no visual. Vou te direcionar para BI corrigir.',
          },
        ],
      },
    ],
  },
  {
    id: 'bi_filtro_nao_funciona',
    category: 'ti_bi',
    keywords: ['filtro nao funciona', 'nao filtra', 'filtro nao aplica', 'segmentacao nao funciona'],
    troubleshooting: [
      {
        question: 'Qual filtro não está funcionando?',
        nextSteps: [
          {
            response: 'Quando você seleciona o filtro, os dados mudam ou continuam iguais?',
          },
        ],
      },
      {
        question: 'Os dados mudam quando aplica o filtro?',
        possibleAnswers: ['não mudam', 'mudam errado', 'desaparecem todos'],
        nextSteps: [
          {
            answer: 'não mudam',
            response: 'Tenta limpar todos os filtros e aplicar de novo, um por vez.',
          },
          {
            answer: 'desaparecem todos',
            response: 'Se sumiram todos os dados, pode não ter informação para esse filtro específico. Tenta outro valor.',
            solved: true,
          },
        ],
      },
      {
        question: 'Limpou e reaplicou os filtros?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'No canto do filtro, tem uma borrachinha/X para limpar. Clica nela, limpa tudo e tenta de novo.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Se mesmo assim não funciona, pode ter bug no dashboard. Vou te direcionar para BI verificar.',
          },
        ],
      },
    ],
  },
  {
    id: 'bi_compartilhar',
    category: 'ti_bi',
    keywords: ['nao consigo compartilhar', 'erro compartilhar dashboard', 'nao compartilha power bi', 'compartilhamento falha'],
    troubleshooting: [
      {
        question: 'Você está tentando compartilhar com quem? (Pessoa específica, grupo, toda empresa)',
        nextSteps: [
          {
            response: 'Aparece alguma mensagem de erro quando você tenta compartilhar?',
          },
        ],
      },
      {
        question: 'Aparece erro?',
        possibleAnswers: ['sim', 'não', 'não aparece opção compartilhar'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Qual mensagem de erro aparece?',
          },
          {
            answer: 'não aparece opção compartilhar',
            response: 'Se não aparece a opção de compartilhar, você pode não ter permissão. É seu dashboard ou de outra pessoa?',
          },
        ],
      },
      {
        question: 'É seu dashboard ou de outra pessoa?',
        possibleAnswers: ['meu', 'outra pessoa', 'não sei'],
        nextSteps: [
          {
            answer: 'outra pessoa',
            response: 'Você só pode compartilhar dashboards que você criou. Se é de outra pessoa, pede para essa pessoa compartilhar.',
            solved: true,
          },
          {
            answer: 'meu',
            response: 'Se é seu e não consegue compartilhar, pode ser limite de licença do Power BI. Vou te direcionar para verificar.',
          },
        ],
      },
    ],
  },

  // ========== TICKET RAIZ - NOVOS CENÁRIOS ==========
  {
    id: 'ticket_novo_usuario',
    category: 'ti_ticket_raiz',
    keywords: ['novo usuario', 'criar conta', 'cadastrar usuario', 'preciso criar login', 'nova conta'],
    troubleshooting: [
      {
        question: 'É para criar usuário para você ou para outra pessoa?',
        possibleAnswers: ['para mim', 'outra pessoa', 'colaborador novo'],
        nextSteps: [
          {
            answer: 'para mim',
            response: 'Você é novo na empresa ou precisa de um usuário adicional?',
          },
          {
            answer: 'outra pessoa',
            response: 'Você tem autorização para solicitar criação de usuário? (precisa ser gestor ou RH)',
          },
        ],
      },
      {
        question: 'Você tem autorização/é gestor?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Para criar usuário para terceiros, precisa ser gestor ou RH. Peça para seu gestor solicitar.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Vou te direcionar para o formulário de criação de usuário. Vai precisar informar: nome completo, setor, cargo e sistemas necessários.',
          },
        ],
      },
    ],
  },
  {
    id: 'ticket_alterar_permissao',
    category: 'ti_ticket_raiz',
    keywords: ['alterar permissao', 'mudar perfil', 'trocar nivel acesso', 'aumentar permissao', 'preciso mais acesso'],
    troubleshooting: [
      {
        question: 'Qual sistema você precisa alterar as permissões?',
        nextSteps: [
          {
            response: 'Você precisa de mais permissões ou menos permissões?',
          },
        ],
      },
      {
        question: 'Mais ou menos permissões?',
        possibleAnswers: ['mais', 'menos', 'diferente'],
        nextSteps: [
          {
            answer: 'mais',
            response: 'Seu gestor já aprovou essa permissão adicional?',
          },
          {
            answer: 'menos',
            response: 'Por que quer reduzir? É boas práticas de segurança. Vou te direcionar para ajustar.',
          },
        ],
      },
      {
        question: 'Gestor aprovou?',
        possibleAnswers: ['sim', 'não', 'não sei'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Primeiro precisa da aprovação do gestor. Depois volta para solicitar.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Com aprovação, vou te direcionar para solicitar a alteração de permissão.',
          },
        ],
      },
    ],
  },
  {
    id: 'ticket_liberar_acesso',
    category: 'ti_ticket_raiz',
    keywords: ['liberar acesso', 'preciso acesso', 'dar acesso', 'conceder permissao', 'acesso pasta', 'acesso sistema'],
    troubleshooting: [
      {
        question: 'Você precisa de acesso a qual sistema ou pasta?',
        nextSteps: [
          {
            response: 'Outros colegas do seu setor têm acesso a isso?',
          },
        ],
      },
      {
        question: 'Outros colegas têm acesso?',
        possibleAnswers: ['sim', 'não', 'não sei'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Se outros do seu setor têm, provavelmente você deveria ter também. Seu gestor está ciente?',
          },
          {
            answer: 'não',
            response: 'Se ninguém do setor tem, é acesso especial. Precisa de aprovação do gestor e justificativa.',
          },
        ],
      },
      {
        question: 'Gestor está ciente e aprovou?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Primeiro valida com seu gestor. Depois volta para solicitar formalmente.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Com aprovação, vou te direcionar para solicitar liberação de acesso.',
          },
        ],
      },
    ],
  },
  {
    id: 'ticket_remover_acesso',
    category: 'ti_ticket_raiz',
    keywords: ['remover acesso', 'tirar permissao', 'bloquear usuario', 'desativar conta', 'revogar acesso'],
    troubleshooting: [
      {
        question: 'Você quer remover acesso de quem? É sua própria conta ou de outra pessoa?',
        possibleAnswers: ['minha', 'outra pessoa'],
        nextSteps: [
          {
            answer: 'minha',
            response: 'Você quer remover acesso a algum sistema específico ou desativar sua conta completamente?',
          },
          {
            answer: 'outra pessoa',
            response: 'Você é gestor ou RH? Remoção de acesso requer autorização.',
          },
        ],
      },
      {
        question: 'Você é gestor/RH?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Apenas gestores e RH podem solicitar remoção de acesso de terceiros. Fale com seu gestor.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Por qual motivo? (Saída da empresa, mudança de função, segurança...)',
          },
        ],
      },
      {
        question: 'Qual o motivo da remoção?',
        nextSteps: [
          {
            response: 'Vou te direcionar para formalizar a solicitação de remoção de acesso. Em casos de saída da empresa, é urgente.',
          },
        ],
      },
    ],
  },
  {
    id: 'ticket_grupo_seguranca',
    category: 'ti_ticket_raiz',
    keywords: ['grupo seguranca', 'adicionar grupo', 'grupo ad', 'active directory', 'grupo acesso'],
    troubleshooting: [
      {
        question: 'Qual grupo de segurança você precisa ser adicionado?',
        nextSteps: [
          {
            response: 'Você sabe o nome exato do grupo ou só sabe a finalidade?',
          },
        ],
      },
      {
        question: 'Sabe o nome do grupo?',
        possibleAnswers: ['sim', 'não', 'só a finalidade'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Você precisa descobrir o nome correto do grupo. Pergunta para algum colega que já tem esse acesso.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Seu gestor aprovou sua inclusão nesse grupo?',
          },
        ],
      },
      {
        question: 'Gestor aprovou?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Grupos de segurança precisam de aprovação do gestor. Valida primeiro.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Com aprovação, vou te direcionar para solicitar inclusão no grupo.',
          },
        ],
      },
    ],
  },
  {
    id: 'ticket_autenticacao',
    category: 'ti_ticket_raiz',
    keywords: ['problema autenticacao', 'nao autentica', 'erro autenticacao', 'falha login geral', 'nao reconhece senha'],
    troubleshooting: [
      {
        question: 'Esse problema é em qual sistema? (Windows, rede, todos os sistemas)',
        nextSteps: [
          {
            response: 'Você consegue fazer login no computador (Windows)?',
          },
        ],
      },
      {
        question: 'Consegue logar no Windows?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Se não consegue logar no Windows, pode ser sua senha da rede que expirou ou está incorreta. Vou te direcionar para reset.',
          },
          {
            answer: 'sim',
            response: 'Windows funciona mas outros sistemas não? Pode ser problema de sincronização. Vou te direcionar para investigar.',
          },
        ],
      },
    ],
  },
  {
    id: 'ticket_software_especifico',
    category: 'ti_ticket_raiz',
    keywords: ['instalar software', 'preciso programa', 'solicitar instalacao', 'software especifico', 'aplicativo'],
    troubleshooting: [
      {
        question: 'Qual software você precisa instalar?',
        nextSteps: [
          {
            response: 'Esse software é pago/licenciado ou gratuito?',
          },
        ],
      },
      {
        question: 'É pago ou gratuito?',
        possibleAnswers: ['pago', 'gratuito', 'não sei'],
        nextSteps: [
          {
            answer: 'pago',
            response: 'Softwares pagos precisam de aprovação de orçamento. Seu gestor já aprovou a compra?',
          },
          {
            answer: 'gratuito',
            response: 'Mesmo gratuito, precisa de aprovação do gestor. Você já validou com ele?',
          },
        ],
      },
      {
        question: 'Gestor aprovou?',
        possibleAnswers: ['sim', 'não'],
        nextSteps: [
          {
            answer: 'não',
            response: 'Primeiro valida com o gestor a necessidade e aprovação. Depois solicita formalmente.',
            solved: true,
          },
          {
            answer: 'sim',
            response: 'Com aprovação, vou te direcionar para solicitar a instalação do software.',
          },
        ],
      },
    ],
  },
  {
    id: 'ticket_chamado_generico',
    category: 'ti_ticket_raiz',
    keywords: ['abrir chamado', 'novo chamado', 'preciso ajuda', 'tenho duvida', 'nao sei onde pedir'],
    troubleshooting: [
      {
        question: 'Sobre qual assunto você precisa de ajuda? (Infraestrutura, Sistema, BI, outro)',
        nextSteps: [
          {
            response: 'Você já tentou resolver sozinho ou é a primeira vez que encontra esse problema?',
          },
        ],
      },
      {
        question: 'Já tentou resolver?',
        possibleAnswers: ['sim', 'não', 'não sei como'],
        nextSteps: [
          {
            answer: 'não sei como',
            response: 'Sem problema! Descreve o problema que está tendo que vou te direcionar para a área certa.',
          },
          {
            answer: 'sim',
            response: 'O que você já tentou fazer?',
          },
        ],
      },
      {
        question: 'Me conta mais sobre o problema. É urgente?',
        possibleAnswers: ['sim', 'não', 'impede trabalho'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Se é urgente e impede seu trabalho, vou te direcionar como prioridade.',
          },
          {
            answer: 'não',
            response: 'Vou te direcionar para abrir o chamado normalmente.',
          },
        ],
      },
    ],
  },
  {
    id: 'ticket_acompanhar',
    category: 'ti_ticket_raiz',
    keywords: ['acompanhar chamado', 'status chamado', 'andamento ticket', 'chamado aberto', 'onde esta meu chamado'],
    troubleshooting: [
      {
        question: 'Você tem o número do chamado?',
        possibleAnswers: ['sim', 'não', 'não lembro'],
        nextSteps: [
          {
            answer: 'sim',
            response: 'Com o número do chamado, você pode consultar direto no sistema. Qual o número?',
          },
          {
            answer: 'não',
            response: 'Quando você abriu o chamado? Hoje, ontem, semana passada?',
          },
        ],
      },
      {
        question: 'Quando abriu o chamado?',
        possibleAnswers: ['hoje', 'ontem', 'semana passada', 'mais tempo'],
        nextSteps: [
          {
            answer: 'hoje',
            response: 'Chamados abertos hoje podem levar algumas horas para serem atribuídos. Verifica seu email, normalmente enviam confirmação.',
            solved: true,
          },
          {
            answer: 'mais tempo',
            response: 'Faz mais de uma semana? Vou te direcionar para verificar o status com a equipe.',
          },
        ],
      },
    ],
  },
  {
    id: 'ticket_treinamento',
    category: 'ti_ticket_raiz',
    keywords: ['solicitar treinamento', 'preciso treinamento', 'como usar sistema', 'aprender', 'capacitacao'],
    troubleshooting: [
      {
        question: 'Treinamento de qual sistema ou ferramenta você precisa?',
        nextSteps: [
          {
            response: 'É para você ou para um grupo de pessoas?',
          },
        ],
      },
      {
        question: 'Para você ou grupo?',
        possibleAnswers: ['só eu', 'grupo', 'time todo'],
        nextSteps: [
          {
            answer: 'só eu',
            response: 'Você já tentou acessar materiais de treinamento (tutoriais, manuais) disponíveis?',
          },
          {
            answer: 'grupo',
            response: 'Treinamento para grupo precisa de agendamento. Você é gestor ou responsável pelo time?',
          },
        ],
      },
      {
        question: 'Já acessou materiais disponíveis?',
        possibleAnswers: ['sim', 'não', 'não encontrei'],
        nextSteps: [
          {
            answer: 'não encontrei',
            response: 'Vou te direcionar para solicitar materiais ou agendamento de treinamento individual.',
          },
          {
            answer: 'sim',
            response: 'Se já estudou e ainda tem dúvidas específicas, vou te direcionar para suporte mais especializado.',
          },
        ],
      },
    ],
  },
];
