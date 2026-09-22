/* ============================================================
   Cada Gota Conta — painel do administrador (admin.html)
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  /* ---------- Dados padrão ---------- */
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
  const ACACOES_DESAFIO = {
    fechei: "Fechei a torneira corretamente.",
    avisei: "Avisei sobre um vazamento.",
    evitei: "Evitei desperdiçar água.",
    incentivei: "Incentivei outra pessoa a economizar água."
  };

  /* ---------- Credenciais de demonstração (projeto escolar) ---------- */
  const ADM_USUARIO = "admin";
  const ADM_SENHA = "cada-gota-2026";

  /* ---------- Chaves compartilhadas com a página pública ---------- */
  const CHAVE_EDICAO = "cadaGotaConta.edicao";
  const CHAVE_MURAL = "cadaGotaConta.mural";
  const CHAVE_DESAFIO = "cadaGotaConta.desafio";
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
  function lerDesafio() {
    try { return JSON.parse(localStorage.getItem(CHAVE_DESAFIO)) || []; }
    catch (e) { return []; }
  }
  function gravarDesafio(v) {
    try { localStorage.setItem(CHAVE_DESAFIO, JSON.stringify(v)); } catch (e) {}
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

  /* ---------- Estado compartilhado ---------- */
  function estadoAtual() {
    const ed = lerEdicao();
    const metas = Array.isArray(ed.metas)
      ? ed.metas.map((m) => ({ t: String(m.t || ""), p: Number(m.p) || 0 }))
      : METAS_PADRAO.map((m) => ({ ...m }));
    const frases = Array.isArray(ed.frases) ? ed.frases.slice() : FRASES_PADRAO.slice();
    return { ed, metas, frases };
  }

  function salvarEstado(metas, frases) {
    const ed = lerEdicao();
    ed.metas = metas;
    ed.frases = frases;
    gravarEdicao(ed);
  }

  /* ---------- Metas ---------- */
  const elAdminMetas = $("#admin-metas");

  function renderAdminMetas() {
    const { metas } = estadoAtual();
    elAdminMetas.innerHTML = "";
    metas.forEach((meta, i) => {
      const div = document.createElement("div");
      div.className = "admin-meta";

      const label = document.createElement("label");
      label.setAttribute("for", "admin-meta-t-" + i);
      label.textContent = "Meta " + (i + 1);

      const linha = document.createElement("div");
      linha.className = "admin-meta-linha";

      const inputT = document.createElement("input");
      inputT.type = "text";
      inputT.id = "admin-meta-t-" + i;
      inputT.value = meta.t;
      inputT.setAttribute("aria-label", "Texto da meta " + (i + 1));

      const inputP = document.createElement("input");
      inputP.type = "number";
      inputP.min = 0;
      inputP.max = 100;
      inputP.step = 1;
      inputP.value = meta.p;
      inputP.setAttribute("aria-label", "Percentual da meta " + (i + 1));

      const aoDigitar = () => atualizarMeta(i, inputT.value, inputP.valueAsNumber);
      inputT.addEventListener("input", aoDigitar);
      inputP.addEventListener("input", aoDigitar);

      linha.append(inputT, inputP);
      div.append(label, linha);
      elAdminMetas.appendChild(div);
    });
  }

  function atualizarMeta(i, titulo, pct) {
    const atual = estadoAtual();
    atual.metas[i] = {
      t: titulo,
      p: Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : 0
    };
    salvarEstado(atual.metas, atual.frases);
  }

  $("#admin-restaurar-metas").addEventListener("click", () => {
    const atual = estadoAtual();
    salvarEstado(METAS_PADRAO.map((m) => ({ ...m })), atual.frases);
    renderAdminMetas();
  });

  /* ---------- Frases ---------- */
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
        salvarEstado(atual.metas, atual.frases);
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
    salvarEstado(atual.metas, atual.frases);
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

  /* ---------- Desafio (estado local) ---------- */
  const elDesafioCount = $("#admin-desafio-count");
  const elDesafioLista = $("#admin-desafio-lista");
  const elDesafioVazio = $("#admin-desafio-vazio");

  function renderAdminDesafio() {
    const feitos = lerDesafio();
    elDesafioCount.textContent = feitos.length + " de 4";
    elDesafioVazio.hidden = feitos.length > 0;
    elDesafioLista.innerHTML = "";
    feitos.forEach((chave) => {
      const rotulo = ACACOES_DESAFIO[chave];
      if (!rotulo) return;
      const li = document.createElement("li");
      li.textContent = "✅ " + rotulo;
      elDesafioLista.appendChild(li);
    });
  }

  $("#admin-reset-desafio").addEventListener("click", () => {
    gravarDesafio([]);
    renderAdminDesafio();
  });

  /* ---------- Restaurar tudo ---------- */
  $("#admin-restaurar").addEventListener("click", () => {
    gravarEdicao({});
    renderAdminMetas();
    renderAdminFrases();
  });

  /* ---------- Inicialização ---------- */
  function carregarPainel() {
    renderAdminMetas();
    renderAdminFrases();
    renderAdminMural();
    renderAdminDesafio();
  }

  if (sessaoAtiva()) {
    entrar();
  } else {
    loginView.hidden = false;
    $("#admin-usuario").focus();
  }
})();