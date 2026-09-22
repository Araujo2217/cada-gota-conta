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
        atuais.splice(i, 1);
        gravarProblemas(atuais);
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
  let ultimoFingerprint = "";

  function novidadePrincipal(aviso) {
    return (aviso.quando || "") + "|" + (aviso.local || "") + "|" + (aviso.tipo || "");
  }

  function verificarNovos(aviso) {
    const lista = lerProblemas();
    const json = JSON.stringify(lista);
    if (!sessaoAtiva()) {
      ultimoJSON = json; // acompanha as mudanças mesmo deslogado para não notificar coisas antigas
      return;
    }
    if (json === ultimoJSON) return;

    let diff = lista.length;
    try { diff = lista.length - (JSON.parse(ultimoJSON).length || 0); } catch (e) {}
    ultimoJSON = json;

    renderAdminProblemas();
    if (!lista.length || diff <= 0) return;

    const novo = aviso || lista[0];
    if (novidadePrincipal(novo) === ultimoFingerprint) return; // já avisado por outra via
    ultimoFingerprint = novidadePrincipal(novo);

    if (!(drawer && drawer.classList.contains("aberta"))) {
      naoLidos += diff;
      atualizarBadge();
    }
    mostrarToast(novo);
    notificarSistema(novo);
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
  window.addEventListener("cadaGota:problema", (e) => verificarNovos(e.detail || undefined));
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

  if (sessaoAtiva()) {
    entrar();
  } else if (loginView && !drawer) {
    loginView.hidden = false;
    const u = $("#admin-usuario");
    if (u) u.focus();
  }
})();