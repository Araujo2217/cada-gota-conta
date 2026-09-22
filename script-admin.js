/* ============================================================
   Cada Gota Conta — painel do administrador (admin.html)
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
    loginView.hidden = true;
    painelView.hidden = false;
    carregarPainel();
    $("#admin-sair").focus();
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = $("#admin-usuario").value.trim();
    const s = $("#admin-senha").value.trim();
    if (u === ADM_USUARIO && s === ADM_SENHA) {
      try { sessionStorage.setItem(CHAVE_SESSAO, "admin"); } catch (err) {}
      $("#admin-erro").hidden = true;
      entrar();
    } else {
      $("#admin-erro").hidden = false;
      $("#admin-senha").focus();
    }
  });

  $("#admin-sair").addEventListener("click", () => {
    try { sessionStorage.removeItem(CHAVE_SESSAO); } catch (e) {}
    painelView.hidden = true;
    loginView.hidden = false;
    $("#admin-usuario").value = "";
    $("#admin-senha").value = "";
    $("#admin-erro").hidden = true;
    $("#admin-usuario").focus();
  });

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

  $("#admin-frase-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#admin-frase-input");
    const t = input.value.trim();
    if (!t) return;
    const atual = estadoAtual();
    atual.frases.push(t);
    salvarFrases(atual.frases);
    input.value = "";
    renderAdminFrases();
    input.focus();
  });

  /* ---------- Mural de ações ---------- */
  const elAdminMural = $("#admin-mural-lista");
  const elAdminMuralCount = $("#admin-mural-count");
  const elAdminMuralVazio = $("#admin-mural-vazio");

  function renderAdminMural() {
    const acoes = lerMural();
    elAdminMuralCount.textContent = acoes.length;
    elAdminMuralVazio.hidden = acoes.length > 0;
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

  $("#admin-limpar-mural").addEventListener("click", () => {
    gravarMural([]);
    renderAdminMural();
  });

  /* ---------- Problemas comunicados pelos alunos ---------- */
  const elAdminProblemas = $("#admin-problemas-lista");
  const elAdminProblemasCount = $("#admin-problemas-count");
  const elAdminProblemasVazio = $("#admin-problemas-vazio");

  function renderAdminProblemas() {
    const avisos = lerProblemas();
    elAdminProblemasCount.textContent = avisos.length;
    elAdminProblemasVazio.hidden = avisos.length > 0;
    elAdminProblemas.innerHTML = "";
    avisos.forEach((p, i) => {
      const li = document.createElement("li");
      const info = document.createElement("span");
      const titulo = (p.tipo || "Problema") + (p.local ? " — " + p.local : "");
      const quando = p.quando ? " · " + p.quando : "";
      const extra = [p.descricao, p.nome].filter(Boolean).join(" · ");
      info.textContent = titulo + quando + (extra ? " · " + extra : "");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "apagar";
      btn.setAttribute("aria-label", "Apagar aviso: " + titulo);
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

  $("#admin-limpar-problemas").addEventListener("click", () => {
    gravarProblemas([]);
    renderAdminProblemas();
  });

  /* ---------- Restaurar frases padrão ---------- */
  $("#admin-restaurar").addEventListener("click", () => {
    gravarEdicao({});
    renderAdminFrases();
  });

  /* ---------- Inicialização ---------- */
  function carregarPainel() {
    renderAdminFrases();
    renderAdminMural();
    renderAdminProblemas();
  }

  if (sessaoAtiva()) {
    entrar();
  } else {
    loginView.hidden = false;
    $("#admin-usuario").focus();
  }
})();