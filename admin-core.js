/* ============================================================
   Cada Gota Conta — painel do administrador (compartilhado)
   Usado em admin.html e no painel integrado do index.html
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  /* ---------- Dados padrão ---------- */
  const FRASES_PADRAO = [
    "“Cada gota que economiza hoje é água que sobra amanhã.” 💧",
    "“Fechar a torneira leva 1 segundo. Reparar um vazamento, 1 aviso.” 🚰",
    "“Não é só água: é energia, tratamento e dinheiro da escola.” ⚡",
    "“Quem cuida da água na escola, leva o hábito para casa.” 🏠",
    "“Pátio limpo não precisa de mangueira ligada o dia todo.” 🧽",
    "“Economizar água é o jeito mais fácil de ser sustentável.” 🌱"
  ];

  /* ---------- Credenciais de demonstração (projeto escolar) ---------- */
  const ADM_USUARIO = "admin";
  const ADM_SENHA = "cada-gota-2026";

  /* ---------- Chaves compartilhadas com a página pública ---------- */
  const CHAVE_EDICAO = "cadaGotaConta.edicao";
  const CHAVE_MURAL = "cadaGotaConta.mural";
  const CHAVE_PROBLEMAS = "cadaGotaConta.problemas";
  const CHAVE_SESSAO = "cadaGotaConta.sessao";

  function lerEdicao() {
    try { return JSON.parse(localStorage.getItem(CHAVE_EDICAO)) || {}; }
    catch (e) { return {}; }
  }
  function gravarEdicao(obj) {
    try { localStorage.setItem(CHAVE_EDICAO, JSON.stringify(obj)); } catch (e) {}
  }
  function lerMural() {
    try { return JSON.parse(localStorage.getItem(CHAVE_MURAL)) || []; }
    catch (e) { return []; }
  }
  function gravarMural(v) {
    try { localStorage.setItem(CHAVE_MURAL, JSON.stringify(v)); } catch (e) {}
  }
  function lerProblemas() {
    try { return JSON.parse(localStorage.getItem(CHAVE_PROBLEMAS)) || []; }
    catch (e) { return []; }
  }
  function gravarProblemas(v) {
    try { localStorage.setItem(CHAVE_PROBLEMAS, JSON.stringify(v)); } catch (e) {}
  }
  function sessaoAtiva() {
    try { return sessionStorage.getItem(CHAVE_SESSAO) === "admin"; }
    catch (e) { return false; }
  }

  /* ---------- Nuvem (avisos entre computadores, Firebase RTDB) ---------- */
  const NUVEM = ((typeof window !== "undefined") &&
    window.CADA_GOTA_CONFIG && window.CADA_GOTA_CONFIG.rtdb) || "";

  function fpProblema(p) {
    return p.id || (p.quando || "") + "|" + (p.local || "") + "|" + (p.tipo || "");
  }
  function tsProblema(p) {
    if (p.ts) return Number(p.ts) || 0;
    const m = /^(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})/.exec(p.quando || "");
    return m ? Date.UTC(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]) : 0;
  }
  async function nuvemGet() {
    if (!NUVEM) return null;
    try {
      const r = await fetch(NUVEM + "/problemas.json", { cache: "no-store" });
      if (!r.ok) return null;
      const obj = await r.json();
      if (!obj || typeof obj !== "object") return [];
      return Object.keys(obj).map((id) => Object.assign({ id: id }, obj[id]));
    } catch (e) { return null; }
  }
  async function nuvemApagar(id) {
    if (!NUVEM || !id) return;
    try { await fetch(NUVEM + "/problemas/" + id + ".json", { method: "DELETE" }); } catch (e) {}
  }
  async function nuvemLimpar() {
    if (!NUVEM) return;
    try { await fetch(NUVEM + "/problemas.json", { method: "DELETE" }); } catch (e) {}
  }
  function atualizarStatusNuvem() {
    const el = $("#admin-sync-status");
    if (!el) return;
    el.textContent = NUVEM
      ? "☁️ Sincronizado — avisos chegam de qualquer computador."
      : "⚠️ Nuvem ainda não configurada — avisos aparecem só no mesmo navegador.";
  }

  /* ---------- Login ---------- */
  const loginView = $("#admin-login");
  const painelView = $("#admin-painel");
  const loginForm = $("#admin-login-form");

  function entrar() {
    if (loginView) loginView.hidden = true;
    if (painelView) painelView.hidden = false;
    marcarLidos();
    carregarPainel();
    const sair = $("#admin-sair");
    if (sair) sair.focus();
  }

  function sair() {
    try { sessionStorage.removeItem(CHAVE_SESSAO); } catch (e) {}
    if (painelView) painelView.hidden = true;
    if (loginView) loginView.hidden = false;
    const u = $("#admin-usuario"); if (u) u.value = "";
    const s = $("#admin-senha"); if (s) s.value = "";
    const err = $("#admin-erro"); if (err) err.hidden = true;
    if (u) u.focus();
    naoLidos = 0;
    atualizarBadge();
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = $("#admin-usuario").value.trim();
      const s = $("#admin-senha").value.trim();
      if (u === ADM_USUARIO && s === ADM_SENHA) {
        try { sessionStorage.setItem(CHAVE_SESSAO, "admin"); } catch (err) {}
        const errEl = $("#admin-erro"); if (errEl) errEl.hidden = true;
        entrar();
      } else {
        const errEl = $("#admin-erro"); if (errEl) errEl.hidden = false;
        const senha = $("#admin-senha"); if (senha) senha.focus();
      }
    });
  }

  const sairBtn = $("#admin-sair");
  if (sairBtn) sairBtn.addEventListener("click", sair);

  /* ---------- Estado compartilhado (frases) ---------- */
  function estadoAtual() {
    const ed = lerEdicao();
    const frases = Array.isArray(ed.frases) ? ed.frases.slice() : FRASES_PADRAO.slice();
    return { ed, frases };
  }

  function salvarFrases(frases) {
    const ed = lerEdicao();
    ed.frases = frases;
    gravarEdicao(ed);
  }

  /* ---------- Frases de conscientização ---------- */
  const elAdminFrases = $("#admin-frases");

  function renderAdminFrases() {
    if (!elAdminFrases) return;
    const { frases } = estadoAtual();
    elAdminFrases.innerHTML = "";
    frases.forEach((f, i) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = f;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "remover";
      btn.setAttribute("aria-label", "Remover frase: " + f);
      btn.addEventListener("click", () => {
        const atual = estadoAtual();
        atual.frases.splice(i, 1);
        salvarFrases(atual.frases);
        renderAdminFrases();
      });
      li.append(span, btn);
      elAdminFrases.appendChild(li);
    });
  }

  const fraseForm = $("#admin-frase-form");
  if (fraseForm) {
    fraseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#admin-frase-input");
      if (!input) return;
      const t = input.value.trim();
      if (!t) return;
      const atual = estadoAtual();
      atual.frases.push(t);
      salvarFrases(atual.frases);
      input.value = "";
      renderAdminFrases();
      input.focus();
    });
  }

  /* ---------- Mural de ações ---------- */
  const elAdminMural = $("#admin-mural-lista");
  const elAdminMuralCount = $("#admin-mural-count");
  const elAdminMuralVazio = $("#admin-mural-vazio");

  function renderAdminMural() {
    if (!elAdminMural) return;
    const acoes = lerMural();
    if (elAdminMuralCount) elAdminMuralCount.textContent = acoes.length;
    if (elAdminMuralVazio) elAdminMuralVazio.hidden = acoes.length > 0;
    elAdminMural.innerHTML = "";
    acoes.forEach((texto, i) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = texto;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "apagar";
      btn.setAttribute("aria-label", "Apagar ação: " + texto);
      btn.addEventListener("click", () => {
        const atuais = lerMural();
        atuais.splice(i, 1);
        gravarMural(atuais);
        renderAdminMural();
      });
      li.append(span, btn);
      elAdminMural.appendChild(li);
    });
  }

  const limparMuralBtn = $("#admin-limpar-mural");
  if (limparMuralBtn) {
    limparMuralBtn.addEventListener("click", () => {
      gravarMural([]);
      renderAdminMural();
    });
  }

  /* ---------- Problemas comunicados pelos alunos ---------- */
  const elAdminProblemas = $("#admin-problemas-lista");
  const elAdminProblemasCount = $("#admin-problemas-count");
  const elAdminProblemasVazio = $("#admin-problemas-vazio");

  function resumoProblema(p) {
    const titulo = (p.tipo || "Problema") + (p.local ? " — " + p.local : "");
    const quando = p.quando ? " · " + p.quando : "";
    const extra = [p.descricao, p.nome].filter(Boolean).join(" · ");
    return titulo + quando + (extra ? " · " + extra : "");
  }

  function renderAdminProblemas() {
    if (!elAdminProblemas) return;
    const avisos = lerProblemas();
    if (elAdminProblemasCount) elAdminProblemasCount.textContent = avisos.length;
    if (elAdminProblemasVazio) elAdminProblemasVazio.hidden = avisos.length > 0;
    elAdminProblemas.innerHTML = "";
    avisos.forEach((p, i) => {
      const li = document.createElement("li");
      const info = document.createElement("span");
      info.textContent = resumoProblema(p);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "apagar";
      btn.setAttribute("aria-label", "Apagar aviso: " + (p.tipo || "Problema"));
      btn.addEventListener("click", () => {
        const atuais = lerProblemas();
        const alvo = atuais[i];
        atuais.splice(i, 1);
        gravarProblemas(atuais);
        if (alvo && alvo.id) nuvemApagar(alvo.id);
        renderAdminProblemas();
      });
      li.append(info, btn);
      elAdminProblemas.appendChild(li);
    });
  }

  const limparProblemasBtn = $("#admin-limpar-problemas");
  if (limparProblemasBtn) {
    limparProblemasBtn.addEventListener("click", () => {
      gravarProblemas([]);
      nuvemLimpar();
      renderAdminProblemas();
    });
  }

  /* ---------- Restaurar frases padrão ---------- */
  const restaurarBtn = $("#admin-restaurar");
  if (restaurarBtn) {
    restaurarBtn.addEventListener("click", () => {
      gravarEdicao({});
      renderAdminFrases();
    });
  }

  /* ---------- Notificações (tela + computador) ---------- */
  const btnNotificar = $("#admin-notificar");

  function suporteNotificacao() {
    return typeof window.Notification !== "undefined";
  }

  function atualizarBtnNotificar() {
    if (!btnNotificar) return;
    if (!suporteNotificacao()) {
      btnNotificar.hidden = true;
      return;
    }
    if (Notification.permission === "granted") {
      btnNotificar.textContent = "✅ Notificações do computador ativadas";
      btnNotificar.disabled = true;
    } else if (Notification.permission === "denied") {
      btnNotificar.textContent = "🔕 Notificações bloqueadas no navegador";
      btnNotificar.disabled = true;
    } else {
      btnNotificar.textContent = "🔔 Ativar notificações do computador";
      btnNotificar.disabled = false;
    }
  }

  if (btnNotificar) {
    btnNotificar.addEventListener("click", () => {
      if (!suporteNotificacao()) return;
      Notification.requestPermission().then(() => atualizarBtnNotificar());
    });
  }

  let ultimoJSON = JSON.stringify(lerProblemas());
  const notificados = new Set();

  function novidadePrincipal(aviso) {
    return (aviso.quando || "") + "|" + (aviso.local || "") + "|" + (aviso.tipo || "");
  }

  function avisarNovos(novos) {
    if (!novos || !novos.length) return;
    const pendentes = novos.filter((p) => !notificados.has(novidadePrincipal(p)));
    if (!pendentes.length) return;
    pendentes.forEach((p) => notificados.add(novidadePrincipal(p)));
    if (!(drawer && drawer.classList.contains("aberta"))) {
      naoLidos += pendentes.length;
      atualizarBadge();
    }
    pendentes.slice(0, 3).forEach((n) => {
      mostrarToast(n);
      notificarSistema(n);
    });
  }

  function verificarNovos() {
    const lista = lerProblemas();
    const json = JSON.stringify(lista);
    if (!sessaoAtiva()) {
      ultimoJSON = json; // acompanha as mudanças mesmo deslogado para não notificar coisas antigas
      return;
    }
    if (json === ultimoJSON) return;

    let antes = [];
    try { antes = JSON.parse(ultimoJSON); } catch (e) {}
    ultimoJSON = json;

    renderAdminProblemas();

    const fpa = new Set(antes.map(novidadePrincipal));
    const novos = lista.filter((p) => !fpa.has(novidadePrincipal(p)));
    avisarNovos(novos);
  }

  /* ---------- Nuvem: sincroniza a cada 5s entre computadores ---------- */
  let sincronizando = false;
  async function sincronizarProblemas() {
    const nuvem = await nuvemGet();
    if (nuvem === null) return; // sem nuvem ou offline: usa apenas o navegador
    const locais = lerProblemas();
    const fpLocais = new Set(locais.map(fpProblema));
    const novos = nuvem.filter((p) => !fpLocais.has(fpProblema(p)));
    const fpNuvem = new Set(nuvem.map(fpProblema));
    const lista = nuvem.slice();
    locais.forEach((p) => { if (!fpNuvem.has(fpProblema(p))) lista.push(p); });
    lista.sort((a, b) => tsProblema(b) - tsProblema(a));
    if (JSON.stringify(lista) !== JSON.stringify(locais)) gravarProblemas(lista);
    if (sessaoAtiva() && novos.length) {
      renderAdminProblemas();
      avisarNovos(novos);
    }
  }

  function construtorIcone() {
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">💧</text></svg>';
  }

  function notificarSistema(aviso) {
    if (!suporteNotificacao() || Notification.permission !== "granted") return;
    const corpo = (aviso.tipo || "Problema") +
      (aviso.local ? " — " + aviso.local : "") +
      (aviso.nome ? " · " + aviso.nome : "") +
      (aviso.descricao ? " · " + aviso.descricao : "");
    try {
      const n = new Notification("💧 Novo aviso para o admin", {
        body: corpo.slice(0, 140),
        icon: construtorIcone()
      });
      n.onclick = () => { window.focus(); };
    } catch (e) {}
  }

  let notifContainer = $("#notificacoes");

  function garantirContainer() {
    if (!notifContainer) {
      notifContainer = document.createElement("div");
      notifContainer.id = "notificacoes";
      notifContainer.className = "admin-notificacoes";
      notifContainer.setAttribute("aria-live", "polite");
      document.body.appendChild(notifContainer);
    }
    return notifContainer;
  }

  function mostrarToast(aviso) {
    const c = garantirContainer();
    const t = document.createElement("div");
    t.className = "admin-toast";
    t.setAttribute("role", "status");
    const strong = document.createElement("strong");
    strong.textContent = "💧 Novo aviso do aluno";
    const p = document.createElement("p");
    p.textContent = (aviso.tipo || "Problema") +
      (aviso.local ? " — " + aviso.local : "") +
      (aviso.nome ? " · " + aviso.nome : "");
    t.append(strong, p);
    t.addEventListener("click", () => t.remove());
    c.appendChild(t);
    setTimeout(() => t.remove(), 9000);
  }

  window.addEventListener("storage", (e) => {
    if (e.key === CHAVE_PROBLEMAS) verificarNovos();
  });
  window.addEventListener("cadaGota:problema", () => verificarNovos());
  setInterval(() => verificarNovos(), 3000);

  /* ---------- Painel integrado (index.html) ---------- */
  const drawer = $("#admin-drawer");
  const fundo = $("#admin-drawer-fundo");
  const botaoFlutuante = $("#admin-botao-flutuante");
  const elBadge = $("#admin-badge");
  let naoLidos = 0;

  function atualizarBadge() {
    if (!elBadge) return;
    elBadge.textContent = naoLidos;
    elBadge.hidden = naoLidos <= 0;
  }

  function marcarLidos() {
    naoLidos = 0;
    atualizarBadge();
  }

  function abrirPainel() {
    if (!drawer) return;
    drawer.classList.add("aberta");
    if (fundo) fundo.classList.add("aberta");
    document.body.style.overflow = "hidden";
    marcarLidos();
    carregarPainel();
    if (sessaoAtiva()) {
      const sairEl = $("#admin-sair");
      if (sairEl) sairEl.focus();
    } else {
      const u = $("#admin-usuario");
      if (u) u.focus();
    }
  }

  function fecharPainel() {
    if (!drawer) return;
    drawer.classList.remove("aberta");
    if (fundo) fundo.classList.remove("aberta");
    document.body.style.overflow = "";
  }

  if (botaoFlutuante) botaoFlutuante.addEventListener("click", abrirPainel);
  if (fundo) fundo.addEventListener("click", fecharPainel);

  const fecharBtn = $("#admin-fechar");
  if (fecharBtn) fecharBtn.addEventListener("click", fecharPainel);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharPainel();
  });

  /* ---------- Inicialização ---------- */
  function carregarPainel() {
    renderAdminFrases();
    renderAdminMural();
    renderAdminProblemas();
  }

  atualizarBtnNotificar();
  atualizarStatusNuvem();

  if (NUVEM) {
    sincronizarProblemas().catch(() => {});
    setInterval(() => {
      if (sincronizando) return;
      sincronizando = true;
      sincronizarProblemas().then(
        () => { sincronizando = false; },
        () => { sincronizando = false; }
      );
    }, 5000);
  }

  if (sessaoAtiva()) {
    entrar();
  } else if (loginView && !drawer) {
    loginView.hidden = false;
    const u = $("#admin-usuario");
    if (u) u.focus();
  }
})();