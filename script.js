/* ============================================================
   Cada Gota Conta — interações do site
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  let semAnimacao = false;
  try { semAnimacao = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

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

  /* Garantia contra página em branco: se o observer não disparar
     (webview, iframe, layout incomum), revela tudo após 2,5s. */
  setTimeout(() => {
    reveals.forEach((r) => r.classList.add("visivel"));
  }, 2500);

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
     COMUNICAR UM PROBLEMA AO ADMINISTRADOR
     ============================================================ */
  const CHAVE_PROBLEMAS = "cadaGotaConta.problemas";

  function lerProblemas() {
    try { return JSON.parse(localStorage.getItem(CHAVE_PROBLEMAS)) || []; }
    catch (e) { return []; }
  }
  function gravarProblemas(v) {
    try { localStorage.setItem(CHAVE_PROBLEMAS, JSON.stringify(v)); } catch (e) {}
  }

  /* Nuvem (Firebase RTDB) — envia o aviso para chegar em qualquer computador */
  const NUVEM = ((typeof window !== "undefined") &&
    window.CADA_GOTA_CONFIG && window.CADA_GOTA_CONFIG.rtdb) || "";

  async function enviarProblemaNuvem(p) {
    if (!NUVEM) return null;
    try {
      const r = await fetch(NUVEM + "/problemas.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quando: p.quando, ts: p.ts, local: p.local,
          tipo: p.tipo, descricao: p.descricao, nome: p.nome
        })
      });
      if (!r.ok) return null;
      const j = await r.json();
      return (j && j.name) ? j.name : null;
    } catch (e) { return null; }
  }

  const reportarForm = $("#reportar-form");
  const reportarErro = $("#reportar-erro");
  const reportarOk = $("#reportar-ok");

  reportarForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const local = $("#reportar-local").value.trim();
    const tipo = $("#reportar-tipo").value.trim();
    if (!local || !tipo) {
      reportarErro.hidden = false;
      $("#reportar-local").focus();
      return;
    }
    reportarErro.hidden = true;
    const agora = new Date();
    const novoItem = {
      id: "",
      quando: agora.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      ts: agora.getTime(),
      local: local,
      tipo: tipo,
      descricao: $("#reportar-desc").value.trim(),
      nome: $("#reportar-nome").value.trim()
    };
    const novos = lerProblemas();
    novos.unshift(novoItem);
    gravarProblemas(novos);
    window.dispatchEvent(new CustomEvent("cadaGota:problema", { detail: novoItem }));
    enviarProblemaNuvem(novoItem).then((id) => {
      if (!id) return;
      const lista = lerProblemas();
      const alvo = lista.find((p) => p.ts === novoItem.ts && !p.id);
      if (alvo) { alvo.id = id; gravarProblemas(lista); }
    });
    reportarForm.reset();
    reportarOk.hidden = false;
    setTimeout(() => { reportarOk.hidden = true; }, 9000);
  });

  /* ============================================================
     CAMPANHA: frases editáveis (lidas do painel do admin)
     ============================================================ */

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

  renderFrases();
})();
