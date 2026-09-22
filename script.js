/* ============================================================
   Cada Gota Conta — interações do site
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const semAnimacao = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Ano no rodapé ---------- */
  $("#ano").textContent = new Date().getFullYear();

  /* ============================================================
     MENU MOBILE + ROLAGEM SUAVE
     ============================================================ */
  const btnMenu = $("#btn-menu");
  const listaNav = $("#lista-nav");

  btnMenu.addEventListener("click", () => {
    const aberto = btnMenu.getAttribute("aria-expanded") === "true";
    btnMenu.setAttribute("aria-expanded", String(!aberto));
    btnMenu.setAttribute("aria-label", aberto ? "Abrir menu de navegação" : "Fechar menu de navegação");
    listaNav.classList.toggle("aberta", !aberto);
  });

  $$(".lista-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      listaNav.classList.remove("aberta");
      btnMenu.setAttribute("aria-expanded", "false");
      btnMenu.setAttribute("aria-label", "Abrir menu de navegação");
    });
  });

  /* ============================================================
     ANIMAÇÃO AO ROLAR (reveal) + NÚMEROS QUE CONTAM
     ============================================================ */
  const reveals = $$(".reveal");

  function animarContador(el) {
    const alvo = parseFloat(el.dataset.contador);
    const decimais = parseInt(el.dataset.decimais || "0", 10);
    const sufixo = el.dataset.sufixo || "";
    const duracao = 1400;
    const inicio = performance.now();

    function passo(agora) {
      const p = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - Math.pow(1 - p, 3);
      const valor = alvo * suave;
      el.textContent =
        (decimais
          ? valor.toFixed(decimais).replace(".", ",")
          : Math.round(valor).toLocaleString("pt-BR")) + sufixo;
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  if ("IntersectionObserver" in window && !semAnimacao) {
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visivel");
            $$(".numero", e.target).forEach((n) => {
              if (!n.dataset.rodou) {
                n.dataset.rodou = "1";
                animarContador(n);
              }
            });
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach((r) => obs.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add("visivel"));
  }

  /* ============================================================
     LINK ATIVO NO MENU CONFORME A ROLAGEM
     ============================================================ */
  const secoes = $$("main section[id]");
  const linksMenu = $$(".lista-nav a");

  if ("IntersectionObserver" in window) {
    const obsSecao = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            linksMenu.forEach((l) =>
              l.classList.toggle("ativo", l.getAttribute("href") === "#" + e.target.id)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    secoes.forEach((s) => obsSecao.observe(s));
  }

  /* ============================================================
     MAPA DA ESCOLA
     ============================================================ */
  const lugares = {
    banheiros: {
      titulo: "🚻 Banheiros",
      perdas: [
        "Descargas que não fecham bem ou são acionadas várias vezes.",
        "Torneiras deixadas correndo ao ensaboar as mãos.",
        "Registro aberto “para esfriar o banheiro” durante toda a aula."
      ],
      dicas: [
        "Ensaboe com a torneira fechada e reabra só para enxaguar.",
        "Avisar professor ou funcionário na hora em que notar goteira.",
        "Fechar o registro por completo, sem deixar “fiozinho” de água."
      ]
    },
    cozinha: {
      titulo: "🍽️ Cozinha",
      perdas: [
        "Louça lavada com a torneira aberta o tempo todo.",
        "Água jogada no ralo enquanto o lixo é separado.",
        "Encher a pia inteira só para lavar poucos itens."
      ],
      dicas: [
        "Lavar em etapas: encher uma bacia, ensaboar, enxaguar de uma vez.",
        "Usar a torneira só no enxágue final.",
        "Aproveitar água limpa da lavagem de legumes para regar plantas."
      ]
    },
    limpeza: {
      titulo: "🧼 Área de limpeza",
      perdas: [
        "Mangueira ligada durante toda a limpeza do pátio.",
        "Baldes enchidos além do necessário.",
        "Água correndo enquanto o funcionário esfrega as salas."
      ],
      dicas: [
        "Usar balde e rodo: dá para limpar muito mais com menos água.",
        "Ligar a mangueira só na hora de enxaguar, não por horas.",
        "Medir mais ou menos o volume necessário antes de encher."
      ]
    },
    bebedouro: {
      titulo: "🥤 Bebedouro",
      perdas: [
        "Copos enchidos até a borda e grande parte jogada fora.",
        "Gotejamento na válvula ou no piso molhado sem motivo.",
        "Garrafas reabastecidas sem necessidade."
      ],
      dicas: [
        "Encher o copo só com o que for beber agora.",
        "Avisar quando o bebedouro pingar — é vazamento, não “normal”.",
        "Usar garrafa reutilizável e reaproveitar a água que sobra."
      ]
    },
    torneiras: {
      titulo: "🚰 Torneiras (pátio e corredores)",
      perdas: [
        "Torneiras de registro abertas sem necessidade.",
        "Brincadeiras de jogar e molgar água nos colegas.",
        "Torneiras mal fechadas que ficam pingando depois do uso."
      ],
      dicas: [
        "Fechar com calma e conferir se parou de escorrer.",
        "Nunca ligar torneira para brincar — água não é brinquedo.",
        "Se fechar não resolver, registrar e avisar a equipe da escola."
      ]
    },
    jardim: {
      titulo: "🌱 Jardins",
      perdas: [
        "Rega no meio do sol: quase toda a água evapora.",
        "Mangueira deixada no gramado esquecida ligada.",
        "Regar em dias de chuva ou com o solo já encharcado."
      ],
      dicas: [
        "Regar no início da manhã ou no fim da tarde.",
        "Usar regador ou mangueira com gatilho (para quando para).",
        "Aproveitar água de chuva e água de lavagem de legumes."
      ]
    }
  };

  const detalheTitulo = $("#detalhe-titulo");
  const detalhePerdas = $("#detalhe-perdas");
  const detalheDicas = $("#detalhe-dicas");

  function preencherLista(el, itens) {
    el.innerHTML = "";
    itens.forEach((texto) => {
      const li = document.createElement("li");
      li.textContent = texto;
      el.appendChild(li);
    });
  }

  function mostrarLugar(chave) {
    const dados = lugares[chave];
    if (!dados) return;
    detalheTitulo.textContent = dados.titulo;
    preencherLista(detalhePerdas, dados.perdas);
    preencherLista(detalheDicas, dados.dicas);
  }

  $$(".hotspot").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".hotspot").forEach((b) => {
        b.classList.remove("ativo");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("ativo");
      btn.setAttribute("aria-pressed", "true");
      mostrarLugar(btn.dataset.lugar);
    });
  });

  mostrarLugar("banheiros");

  /* ============================================================
     DESAFIO DA ESCOLA (com localStorage)
     ============================================================ */
  const checks = $$(".check-acao");
  const barraFill = $("#barra-desafio-fill");
  const barra = $("#barra-desafio");
  const contador = $("#desafio-contador");
  const mensagem = $("#mensagem-desafio");
  const CHAVE_DESAFIO = "cadaGotaConta.desafio";

  const mensagens = [
    "Marque sua primeira ação para começar! 💧",
    "Bom começo! Continue assim. 🌱",
    "Já são 2 ações — a escola agradece! 🙌",
    "Quase lá! Falta só uma ação. 💪",
    "🏆 Desafio completo! Você é guardião da água da sua escola!"
  ];

  function salvarDesafio() {
    try {
      const feitos = checks.filter((c) => c.checked).map((c) => c.dataset.acao);
      localStorage.setItem(CHAVE_DESAFIO, JSON.stringify(feitos));
    } catch (e) { /* navegador sem localStorage */ }
  }

  function carregarDesafio() {
    try {
      const salvos = JSON.parse(localStorage.getItem(CHAVE_DESAFIO) || "[]");
      checks.forEach((c) => { c.checked = salvos.includes(c.dataset.acao); });
    } catch (e) { /* ignora */ }
  }

  function atualizarDesafio() {
    const total = checks.length;
    const feitos = checks.filter((c) => c.checked).length;
    const pct = (feitos / total) * 100;

    barraFill.style.width = pct + "%";
    barra.setAttribute("aria-valuenow", String(feitos));
    contador.innerHTML = "<strong>" + feitos + " de " + total + "</strong> ações realizadas";
    mensagem.textContent = mensagens[feitos];

    if (feitos === total && !semAnimacao) {
      barraFill.style.background = "#fff";
      setTimeout(() => { barraFill.style.background = ""; }, 900);
    }
    salvarDesafio();
  }

  checks.forEach((c) => c.addEventListener("change", atualizarDesafio));
  $("#btn-reset-desafio").addEventListener("click", () => {
    checks.forEach((c) => { c.checked = false; });
    atualizarDesafio();
    checks[0].focus();
  });

  carregarDesafio();
  atualizarDesafio();

  /* ============================================================
     CALCULADORA DE ECONOMIA
     ============================================================ */
  const PAR = {
    dentes: 15,      // L por vez (US EPA: ~4 gal por escovação com torneira aberta)
    minuto: 3.8,     // L por minuto (USGS: torneira de pia ≈ 1 gal/min)
    vazamento: 31    // L por dia por torneira (US EPA: +3.000 gal/ano ÷ 365)
  };

  const inpDentes = $("#calc-dentes");
  const inpMinutos = $("#calc-minutos");
  const inpVazamento = $("#calc-vazamento");

  function valorPositivo(input) {
    const v = parseFloat(input.value);
    return Number.isFinite(v) && v > 0 ? v : 0;
  }

  function formatar(n, decimais = 0) {
    return n.toLocaleString("pt-BR", {
      minimumFractionDigits: decimais,
      maximumFractionDigits: decimais
    });
  }

  function calcular() {
    const litrosDia =
      valorPositivo(inpDentes) * PAR.dentes +
      valorPositivo(inpMinutos) * PAR.minuto +
      valorPositivo(inpVazamento) * PAR.vazamento;

    const litrosMes = litrosDia * 30;
    const garrafas = litrosDia / 1.5;
    const diasPessoa = litrosDia / 192; // consumo per capita Grande SP (IAS/Sabesp, 2024)

    $("#calc-total-dia").textContent = formatar(litrosDia, litrosDia < 10 ? 1 : 0);
    $("#calc-total-mes").textContent = formatar(litrosMes, 0) + " L";
    $("#calc-garrafas").textContent = formatar(garrafas, garrafas < 10 ? 1 : 0);
    $("#calc-pessoas").textContent = formatar(diasPessoa, diasPessoa < 10 ? 1 : 0);
  }

  [inpDentes, inpMinutos, inpVazamento].forEach((i) => {
    i.addEventListener("input", calcular);
    i.addEventListener("change", calcular);
  });
  calcular();

  /* ============================================================
     MURAL DA CAMPANHA
     ============================================================ */
  const muralForm = $("#mural-form");
  const muralInput = $("#mural-input");
  const muralLista = $("#mural-lista");
  const muralVazio = $("#mural-vazio");
  const CHAVE_MURAL = "cadaGotaConta.mural";

  function lerMural() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_MURAL) || "[]");
    } catch (e) {
      return [];
    }
  }

  function gravarMural(acaoes) {
    try {
      localStorage.setItem(CHAVE_MURAL, JSON.stringify(acaoes));
    } catch (e) { /* ignora */ }
  }

  function renderMural() {
    const acoes = lerMural();
    muralLista.innerHTML = "";
    muralVazio.hidden = acoes.length > 0;

    acoes.forEach((texto, i) => {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.textContent = "💧 " + texto;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "remover";
      btn.setAttribute("aria-label", "Remover ação: " + texto);
      btn.addEventListener("click", () => {
        const atuais = lerMural();
        atuais.splice(i, 1);
        gravarMural(atuais);
        renderMural();
        muralInput.focus();
      });

      li.append(span, btn);
      muralLista.appendChild(li);
    });
  }

  muralForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = muralInput.value.trim();
    if (!texto) return;
    const acoes = lerMural();
    acoes.unshift(texto);
    gravarMural(acoes);
    muralInput.value = "";
    renderMural();
    muralInput.focus();
  });

  renderMural();

  /* ============================================================
     QUIZ
     ============================================================ */
  const perguntas = [
    {
      p: "O que é desperdício de água?",
      alt: [
        "Usar água em bom estado sem necessidade e jogá-la fora",
        "Beber água durante o intervalo",
        "Fechar a torneira depois de usar",
        "Usar água para higienizar as mãos"
      ],
      correta: 0,
      exp: "Desperdício é perder água que poderia ser usada: torneiras abertas, vazamentos e uso além do necessário."
    },
    {
      p: "Segundo o SINISA 2024, qual parte da água tratada no Brasil se perde nas redes de distribuição?",
      alt: ["Cerca de 5%", "Cerca de 40%", "Cerca de 75%", "Praticamente nenhuma"],
      correta: 1,
      exp: "Cerca de 40,3% do volume produzido se perde antes de chegar às torneiras (Ministério das Cidades / SNIS, 2024)."
    },
    {
      p: "Uma torneira pingando 1 gota por segundo pode desperdiçar quanto em um ano?",
      alt: ["Cerca de 100 litros", "Cerca de 1.100 litros", "Mais de 11 mil litros", "Nada, é gota mínima"],
      correta: 2,
      exp: "Mais de 3.000 galões por ano, o equivalente a mais de 11.356 litros (US EPA — WaterSense)."
    },
    {
      p: "Ao notar uma goteira ou uma descarga que não fecha, o que fazer?",
      alt: [
        "Ignorar, é coisa pequena",
        "Fechar a porta para ninguém ver",
        "Avisar imediatamente um professor ou funcionário",
        "Jogar mais água para “empurrar”"
      ],
      correta: 2,
      exp: "Avisar é a atitude mais eficiente: um vazamento pequeno somado a muitos dias desperdiça milhares de litros."
    },
    {
      p: "Para escovar os dentes, qual hábito gasta menos água?",
      alt: [
        "Deixar a torneira correndo o tempo todo",
        "Fechar a torneira enquanto escova e abrir só para enxaguar",
        "Escovar com a boca cheia de água",
        "Lavar os dentes só no fim do mês"
      ],
      correta: 1,
      exp: "Fechar a torneira durante a escovação evita cerca de 15 litros desperdiçados por vez (US EPA)."
    },
    {
      p: "Qual é a melhor opção para lavar o pátio da escola?",
      alt: [
        "Deixar a mangueira ligada o dia inteiro",
        "Usar a quantidade necessária com balde e rodo",
        "Lavar três vezes para ficar brilhando",
        "Molhar tudo de manhã e deixar secar sujo"
      ],
      correta: 1,
      exp: "A quantidade necessária é suficiente: balde e rodo gastam muito menos que a mangueira aberta sem parar."
    },
    {
      p: "Quantas pessoas no mundo ainda não têm acesso seguro à água potável?",
      alt: ["2,1 bilhões", "200 milhões", "2 milhões", "Ninguém mais"],
      correta: 0,
      exp: "1 em cada 4 pessoas — 2,1 bilhões — segundo o relatório OMS/UNICEF (JMP), 2025."
    },
    {
      p: "Quantos por cento da água da Terra é doce e fácil de usar?",
      alt: ["Cerca de 50%", "Cerca de 25%", "Cerca de 2,5%", "Cerca de 90%"],
      correta: 2,
      exp: "Só cerca de 2,5% é doce, e a maior parte está congelada em geleiras (USGS — Water Science School)."
    }
  ];

  let indice = 0;
  let pontos = 0;
  let respondida = false;

  const elPergunta = $("#quiz-pergunta");
  const elAlternativas = $("#quiz-alternativas");
  const elFeedback = $("#quiz-feedback");
  const elProxima = $("#quiz-proxima");
  const elProgresso = $("#quiz-progresso");
  const elBarraQuiz = $("#barra-quiz-fill");
  const elPontos = $("#quiz-pontos");
  const elConteudo = $("#quiz-conteudo");
  const elFinal = $("#quiz-final");

  function renderPergunta() {
    respondida = false;
    const atual = perguntas[indice];

    elPergunta.textContent = atual.p;
    elProgresso.textContent = "Pergunta " + (indice + 1) + " de " + perguntas.length;
    elBarraQuiz.style.width = ((indice + 1) / perguntas.length) * 100 + "%";
    elFeedback.hidden = true;
    elFeedback.className = "quiz-feedback";
    elProxima.hidden = true;
    elAlternativas.innerHTML = "";

    atual.alt.forEach((texto, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "alternativa";
      btn.textContent = texto;
      btn.addEventListener("click", () => responder(i, btn));
      elAlternativas.appendChild(btn);
    });

    elAlternativas.querySelector("button").focus();
  }

  function responder(escolha, botao) {
    if (respondida) return;
    respondida = true;

    const atual = perguntas[indice];
    const todos = $$(".alternativa", elAlternativas);

    todos.forEach((b, i) => {
      b.disabled = true;
      if (i === atual.correta) b.classList.add("certa");
    });

    const acertou = escolha === atual.correta;
    if (acertou) {
      pontos++;
      botao.classList.add("certa");
    } else {
      botao.classList.add("errada");
    }

    elPontos.textContent = pontos;
    elFeedback.hidden = false;
    elFeedback.className = "quiz-feedback " + (acertou ? "ok" : "nao");
    elFeedback.textContent =
      (acertou ? "✅ Isso mesmo! " : "❌ Não é isso. ") + atual.exp;

    elProxima.hidden = false;
    elProxima.textContent =
      indice === perguntas.length - 1 ? "Ver resultado 🏁" : "Próxima pergunta →";
    elProxima.focus();
  }

  function finalizar() {
    elConteudo.hidden = true;
    elFinal.hidden = false;
    elProgresso.textContent = "Quiz concluído!";
    elBarraQuiz.style.width = "100%";

    const total = perguntas.length;
    const pct = Math.round((pontos / total) * 100);
    $("#quiz-resultado").textContent = pontos + " de " + total + " (" + pct + "%)";

    let emoji = "🎉";
    let titulo = "Mandou muito bem!";
    let msg =
      "Você entendeu o básico do desperdício de água e já pode ensinar os colegas. Continue assim: cada gota conta!";

    if (pct < 40) {
      emoji = "🌱";
      titulo = "Continue aprendendo!";
      msg =
        "Vale revisar as seções “O problema” e “Você sabia?”. Pequenas mudanças de hábito fazem toda a diferença na escola.";
    } else if (pct < 75) {
      emoji = "💧";
      titulo = "Bom trabalho!";
      msg =
        "Você já sabe o essencial. Reveja as dicas do site e desafie um colega a fazer o quiz também.";
    }

    $("#quiz-emoji-final").textContent = emoji;
    $("#quiz-titulo-final").textContent = titulo;
    $("#quiz-mensagem-final").textContent = msg;
    $("#quiz-reiniciar").focus();
  }

  function reiniciarQuiz() {
    indice = 0;
    pontos = 0;
    elPontos.textContent = "0";
    elFinal.hidden = true;
    elConteudo.hidden = false;
    renderPergunta();
  }

  elProxima.addEventListener("click", () => {
    if (indice === perguntas.length - 1) {
      finalizar();
    } else {
      indice++;
      renderPergunta();
    }
  });

  $("#quiz-reiniciar").addEventListener("click", reiniciarQuiz);
  renderPergunta();

  /* ============================================================
     BOTÃO VOLTAR AO TOPO
     ============================================================ */
  const btnTopo = $("#voltar-topo");
  btnTopo.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: semAnimacao ? "auto" : "smooth" });
    $(".marca").focus?.();
  });

  window.addEventListener(
    "scroll",
    () => {
      btnTopo.hidden = window.scrollY < 600;
    },
    { passive: true }
  );

  /* ============================================================
     CAMPANHA: metas e frases editáveis (lidas do painel do admin)
     ============================================================ */

  const METAS_PADRAO = [
    { t: "Reduzir o consumo de água da escola em 10% em 3 meses", p: 62 },
    { t: "Mapear e reportar todos os vazamentos em 30 dias", p: 45 },
    { t: "90% das turmas participando do Desafio Cada Gota Conta", p: 80 }
  ];
  const FRASES_PADRAO = [
    "“Cada gota que economiza hoje é água que sobra amanhã.” 💧",
    "“Fechar a torneira leva 1 segundo. Reparar um vazamento, 1 aviso.” 🚰",
    "“Não é só água: é energia, tratamento e dinheiro da escola.” ⚡",
    "“Quem cuida da água na escola, leva o hábito para casa.” 🏠",
    "“Pátio limpo não precisa de mangueira ligada o dia todo.” 🧽",
    "“Economizar água é o jeito mais fácil de ser sustentável.” 🌱"
  ];
  const CHAVE_EDICAO = "cadaGotaConta.edicao";

  function lerEdicao() {
    try { return JSON.parse(localStorage.getItem(CHAVE_EDICAO)) || {}; }
    catch (e) { return {}; }
  }
  function gravarEdicao(obj) { try { localStorage.setItem(CHAVE_EDICAO, JSON.stringify(obj)); } catch (e) {} }

  const elFrasesLista = $("#frases-lista");
  const elMetaLista = $("#meta-lista");

  function renderFrases() {
    const ed = lerEdicao();
    const frases = Array.isArray(ed.frases) ? ed.frases : FRASES_PADRAO;
    elFrasesLista.innerHTML = "";
    frases.forEach((f) => {
      const li = document.createElement("li");
      li.textContent = f;
      elFrasesLista.appendChild(li);
    });
  }

  function renderMetas() {
    const ed = lerEdicao();
    const metas = Array.isArray(ed.metas) ? ed.metas : METAS_PADRAO;
    elMetaLista.innerHTML = "";
    metas.forEach((meta) => {
      if (!meta || !meta.t) return;
      const div = document.createElement("div");
      div.className = "meta";
      const info = document.createElement("div");
      info.className = "meta-info";
      const span = document.createElement("span");
      span.textContent = meta.t;
      const strong = document.createElement("strong");
      strong.textContent = meta.p + "%";
      info.append(span, strong);
      const barraDiv = document.createElement("div");
      barraDiv.className = "barra";
      const fill = document.createElement("div");
      fill.className = "barra-preenchida verde";
      fill.style.width = Math.min(100, Math.max(0, meta.p)) + "%";
      barraDiv.appendChild(fill);
      div.append(info, barraDiv);
      elMetaLista.appendChild(div);
    });
  }

  renderFrases();
  renderMetas();
})();
