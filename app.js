const DEFAULT_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Contas fixas",
  "Assinaturas pessoais",
  "Outros"
];

const PAYMENT_METHODS = ["Dinheiro", "Pix", "Débito", "Crédito", "Transferência", "Boleto", "Outros"];
const BLOG_POSTS = [
  {
    title: "Como organizar o orçamento familiar no Brasil",
    keyword: "orçamento familiar no Brasil",
    date: "2026-05-23",
    image: blogImage("Orçamento familiar", "#2563eb", "#059669"),
    excerpt: "Um guia direto para famílias brasileiras registrarem receitas, despesas fixas e gastos variáveis sem depender de conexão bancária.",
    body: "Comece listando toda renda mensal e separe os compromissos essenciais, como moradia, alimentação, transporte, saúde e educação. Depois defina limites por categoria e acompanhe semanalmente o que foi usado."
  },
  {
    title: "Reserva de emergência: quanto guardar e por onde começar",
    keyword: "reserva de emergência",
    date: "2026-05-23",
    image: blogImage("Reserva de emergência", "#0f766e", "#38bdf8"),
    excerpt: "Entenda como criar uma meta realista para proteger sua vida financeira diante de imprevistos no cenário brasileiro.",
    body: "A reserva de emergência deve cobrir alguns meses de despesas essenciais. Quem está começando pode definir uma primeira meta menor e evoluir até três a seis meses de custos."
  },
  {
    title: "Cartão de crédito: controle manual da fatura sem sustos",
    keyword: "controle de cartão de crédito",
    date: "2026-05-23",
    image: blogImage("Cartão de crédito", "#d97706", "#2563eb"),
    excerpt: "Veja como acompanhar limite, compras parceladas e vencimento da fatura sem integração com banco.",
    body: "Cadastre o limite total, data de fechamento e vencimento do cartão. Sempre que fizer uma compra, registre o valor total e o número de parcelas."
  },
  {
    title: "Planejamento mensal por categoria para reduzir gastos",
    keyword: "planejamento mensal financeiro",
    date: "2026-05-23",
    image: blogImage("Planejamento mensal", "#6d5dfc", "#059669"),
    excerpt: "Aprenda a usar limites mensais por categoria para identificar excessos e ajustar o consumo.",
    body: "Ao definir limites para alimentação, transporte, lazer e contas fixas, fica fácil perceber onde o dinheiro está escapando e proteger o resultado do mês."
  },
  {
    title: "Educação financeira pessoal: hábitos simples para todo o país",
    keyword: "educação financeira pessoal",
    date: "2026-05-23",
    image: blogImage("Educação financeira", "#059669", "#0f766e"),
    excerpt: "Cinco hábitos de educação financeira aplicáveis a qualquer cidade do Brasil, do autônomo ao assalariado.",
    body: "Registre entradas e saídas, revise pendências, acompanhe metas, evite parcelamentos sem planejamento e separe desejos de necessidades."
  }
];
const STORE_KEY = "cfp_users_v1";
let state = null;
let currentUser = localStorage.getItem("cfp_current_user") || "";

const $ = (id) => document.getElementById(id);
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function monthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function parseMoney(value) {
  return Number(value || 0);
}

function inSelectedMonth(itemDate) {
  return itemDate && itemDate.slice(0, 7) === $("monthFilter").value;
}

function formatDate(value) {
  if (!value) return "-";
  return dateFmt.format(new Date(`${value}T00:00:00Z`));
}

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(STORE_KEY, JSON.stringify(users));
}

async function simpleHash(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function blogImage(title, from, to) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="680" viewBox="0 0 1200 680">
    <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
    <rect width="1200" height="680" fill="url(#g)"/>
    <circle cx="965" cy="135" r="150" fill="rgba(255,255,255,.18)"/>
    <circle cx="210" cy="560" r="190" fill="rgba(255,255,255,.12)"/>
    <rect x="95" y="120" width="1010" height="440" rx="28" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.35)"/>
    <text x="140" y="310" fill="#fff" font-family="Arial, sans-serif" font-size="58" font-weight="800">${title}</text>
    <text x="140" y="385" fill="rgba(255,255,255,.9)" font-family="Arial, sans-serif" font-size="30">Controle Financeiro Pessoal</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function emptyData() {
  return {
    profile: {},
    categories: [...DEFAULT_CATEGORIES],
    incomes: [],
    expenses: [],
    cards: [],
    purchases: [],
    budgets: [],
    goals: [],
    preferences: {
      theme: "light"
    }
  };
}

function normalizeData(data = {}) {
  return {
    ...emptyData(),
    ...data,
    profile: data.profile || {},
    categories: Array.isArray(data.categories) && data.categories.length ? data.categories : [...DEFAULT_CATEGORIES],
    incomes: Array.isArray(data.incomes) ? data.incomes : [],
    expenses: Array.isArray(data.expenses) ? data.expenses : [],
    cards: Array.isArray(data.cards) ? data.cards : [],
    purchases: Array.isArray(data.purchases) ? data.purchases : [],
    budgets: Array.isArray(data.budgets) ? data.budgets : [],
    goals: Array.isArray(data.goals) ? data.goals : [],
    preferences: {
      theme: data.preferences?.theme || "light"
    }
  };
}

function saveState() {
  const users = loadUsers();
  if (!users[currentUser]) return;
  state = normalizeData(state);
  users[currentUser].data = state;
  saveUsers(users);
  renderAll();
}

function showApp() {
  $("authView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  $("currentUserName").textContent = currentUser;
  $("monthFilter").value = $("monthFilter").value || monthKey();
  applyTheme(state.preferences?.theme || "light", false);
  renderAll();
  requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
}

function showAuth() {
  $("authView").classList.remove("hidden");
  $("appView").classList.add("hidden");
}

function logout() {
  localStorage.removeItem("cfp_current_user");
  currentUser = "";
  state = null;
  showAuth();
}

function switchSection(section) {
  document.querySelectorAll("#nav button, .profile-shortcut").forEach((btn) => btn.classList.toggle("active", btn.dataset.section === section));
  document.querySelectorAll(".section").forEach((el) => el.classList.toggle("active-section", el.id === section));
  const active = document.querySelector(`[data-section="${section}"]`);
  $("sectionTitle").textContent = active?.querySelector(".nav-label")?.textContent || active?.querySelector("strong")?.textContent || active?.textContent || "Dashboard";
  if (section === "dados") loadProfileForm();
  if (section === "relatorios") setTimeout(drawCharts, 50);
  window.scrollTo({ top: 0, left: 0 });
}

function fillSelect(select, values, placeholder) {
  select.innerHTML = placeholder ? `<option value="">${placeholder}</option>` : "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function syncSelects() {
  const categories = state.categories;
  ["incomeCategory", "expenseCategory", "purchaseCategory", "budgetCategory"].forEach((id) => fillSelect($(id), categories));
  fillSelect($("filterCategory"), categories, "Todas as categorias");
  fillSelect($("expensePayment"), PAYMENT_METHODS);
  fillSelect($("filterPayment"), PAYMENT_METHODS, "Todas as formas");
  fillSelect($("purchaseCard"), state.cards.map((card) => card.id));
  Array.from($("purchaseCard").options).forEach((option) => {
    const card = state.cards.find((item) => item.id === option.value);
    if (card) option.textContent = card.name;
  });
}

function total(values, field = "amount") {
  return values.reduce((sum, item) => sum + Number(item[field] || 0), 0);
}

function selectedMonthExpenses() {
  return state.expenses.filter((expense) => inSelectedMonth(expense.dueDate));
}

function selectedMonthIncomes() {
  return state.incomes.filter((income) => inSelectedMonth(income.date));
}

function selectedMonthPurchases() {
  return state.purchases.filter((purchase) => inSelectedMonth(purchase.date));
}

function renderDashboard() {
  const incomes = selectedMonthIncomes();
  const expenses = selectedMonthExpenses();
  const cardTotal = total(selectedMonthPurchases(), "installmentAmount");
  const incomeTotal = total(incomes);
  const expenseTotal = total(expenses);
  const allBalance = total(state.incomes) - total(state.expenses);
  const goalPercent = state.goals.length ? Math.round(total(state.goals, "current") / Math.max(total(state.goals, "target"), 1) * 100) : 0;

  $("saldoAtual").textContent = brl.format(allBalance);
  $("receitasMes").textContent = brl.format(incomeTotal);
  $("despesasMes").textContent = brl.format(expenseTotal);
  $("resultadoMes").textContent = brl.format(incomeTotal - expenseTotal);
  $("cartoesTotal").textContent = brl.format(cardTotal);
  $("metasProgresso").textContent = `${Math.min(goalPercent, 100)}%`;
  renderAlerts();
  renderBudgetSummary();
}

function renderAlerts() {
  const today = new Date(`${todayIso()}T00:00:00`);
  const alerts = state.expenses
    .filter((expense) => expense.status !== "pago")
    .map((expense) => {
      const due = new Date(`${expense.dueDate}T00:00:00`);
      const days = Math.ceil((due - today) / 86400000);
      return { ...expense, days };
    })
    .filter((expense) => expense.days <= 7)
    .sort((a, b) => a.days - b.days);

  $("alertsList").innerHTML = alerts.length ? alerts.map((expense) => {
    const label = expense.days < 0 ? `${Math.abs(expense.days)} dia(s) atrasado` : expense.days === 0 ? "vence hoje" : `vence em ${expense.days} dia(s)`;
    return `<div class="progress-item ${expense.days < 0 ? "over" : ""}">
      <div class="progress-row"><span>${escapeHtml(expense.description)}</span><span>${brl.format(expense.amount)}</span></div>
      <small>${label} em ${formatDate(expense.dueDate)}</small>
    </div>`;
  }).join("") : `<p>Nenhuma conta pendente próxima do vencimento.</p>`;
}

function billStatusItems() {
  const today = new Date(`${todayIso()}T00:00:00`);
  return state.expenses
    .filter((expense) => expense.status !== "pago")
    .map((expense) => {
      const due = new Date(`${expense.dueDate}T00:00:00`);
      const days = Math.ceil((due - today) / 86400000);
      return { ...expense, days };
    })
    .sort((a, b) => a.days - b.days);
}

function billTemplate(expense) {
  const label = expense.days < 0 ? `${Math.abs(expense.days)} dia(s) atrasado` : expense.days === 0 ? "vence hoje" : `vence em ${expense.days} dia(s)`;
  return `<div class="progress-item ${expense.days < 0 ? "over" : ""}">
    <div class="progress-row"><span>${escapeHtml(expense.description)}</span><span>${brl.format(expense.amount)}</span></div>
    <small>${label} em ${formatDate(expense.dueDate)} | ${escapeHtml(expense.category)} | ${escapeHtml(expense.payment)}</small>
  </div>`;
}

function renderBills() {
  const bills = billStatusItems();
  const pending = bills.filter((expense) => expense.days >= 0 && expense.days <= 15);
  const overdue = bills.filter((expense) => expense.days < 0);
  $("pendingBillsList").innerHTML = pending.length ? pending.map(billTemplate).join("") : `<p>Nenhuma conta pendente para os proximos 15 dias.</p>`;
  $("overdueBillsList").innerHTML = overdue.length ? overdue.map(billTemplate).join("") : `<p>Nenhuma conta atrasada encontrada.</p>`;
}

function renderBudgetSummary() {
  const items = budgetUsage();
  $("budgetSummary").innerHTML = items.length ? items.slice(0, 5).map(progressTemplate).join("") : `<p>Cadastre limites mensais por categoria para acompanhar seu planejamento.</p>`;
}

function renderIncomes() {
  const rows = selectedMonthIncomes();
  $("incomeList").innerHTML = table(["Descrição", "Valor", "Data", "Categoria", "Conta", "Ações"], rows.map((income) => [
    escapeHtml(income.description),
    brl.format(income.amount),
    formatDate(income.date),
    escapeHtml(income.category),
    escapeHtml(income.wallet),
    actions("income", income.id)
  ]));
}

function renderExpenses() {
  const search = $("searchInput").value.trim().toLowerCase();
  const category = $("filterCategory").value;
  const status = $("filterStatus").value;
  const payment = $("filterPayment").value;
  const rows = selectedMonthExpenses().filter((expense) => {
    return (!search || expense.description.toLowerCase().includes(search)) &&
      (!category || expense.category === category) &&
      (!status || expense.status === status) &&
      (!payment || expense.payment === payment);
  });
  $("expenseList").innerHTML = table(["Descrição", "Valor", "Vencimento", "Pagamento", "Categoria", "Forma", "Status", "Foto", "Ações"], rows.map((expense) => [
    escapeHtml(expense.description),
    brl.format(expense.amount),
    formatDate(expense.dueDate),
    formatDate(expense.paidDate),
    escapeHtml(expense.category),
    escapeHtml(expense.payment),
    `<span class="status ${expense.status}">${expense.status}</span>`,
    expense.receiptPhoto ? `<img class="receipt-thumb" src="${expense.receiptPhoto}" alt="Foto da despesa ${escapeAttr(expense.description)}" />` : "-",
    actions("expense", expense.id)
  ]));
}

function renderCards() {
  $("cardList").innerHTML = state.cards.length ? state.cards.map((card) => {
    const used = total(state.purchases.filter((purchase) => purchase.cardId === card.id), "installmentAmount");
    const available = Math.max(Number(card.limit) - used, 0);
    return `<div class="credit-card" style="background:${card.color}">
      <strong>${escapeHtml(card.name)}</strong>
      <small>Fatura atual: ${brl.format(currentCardInvoice(card.id))}</small>
      <small>Limite usado: ${brl.format(used)}</small>
      <small>Disponível: ${brl.format(available)}</small>
      <div class="row-actions">
        <button class="icon-btn" onclick="editItem('card','${card.id}')" title="Editar">Editar</button>
        <button class="icon-btn danger" onclick="deleteItem('card','${card.id}')" title="Excluir">Excluir</button>
      </div>
    </div>`;
  }).join("") : `<p>Nenhum cartão cadastrado.</p>`;

  $("purchaseList").innerHTML = table(["Cartão", "Descrição", "Parcela", "Valor", "Data", "Categoria"], state.purchases.map((purchase) => {
    const card = state.cards.find((item) => item.id === purchase.cardId);
    return [
      escapeHtml(card?.name || "Cartão removido"),
      escapeHtml(purchase.description),
      `${purchase.installment}/${purchase.installments}`,
      brl.format(purchase.installmentAmount),
      formatDate(purchase.date),
      escapeHtml(purchase.category)
    ];
  }));
}

function currentCardInvoice(cardId) {
  return total(selectedMonthPurchases().filter((purchase) => purchase.cardId === cardId), "installmentAmount");
}

function budgetUsage() {
  const expenses = selectedMonthExpenses();
  return state.budgets.map((budget) => {
    const used = total(expenses.filter((expense) => expense.category === budget.category));
    const limit = Number(budget.limit);
    const percent = Math.round(used / Math.max(limit, 1) * 100);
    return { id: budget.id, label: budget.category, used, limit, percent, available: limit - used };
  });
}

function progressTemplate(item) {
  const width = Math.min(item.percent, 100);
  return `<div class="progress-item ${item.percent > 100 ? "over" : ""}">
    <div class="progress-row"><span>${escapeHtml(item.label)}</span><span>${item.percent}%</span></div>
    <div class="bar"><span style="width:${width}%"></span></div>
    <small>Usado: ${brl.format(item.used)} | Limite: ${brl.format(item.limit)} | Disponível: ${brl.format(item.available)}</small>
  </div>`;
}

function renderBudgets() {
  const items = budgetUsage();
  $("budgetList").innerHTML = items.length ? items.map((item) => `${progressTemplate(item)}<div class="row-actions">
    <button class="icon-btn" onclick="editItem('budget','${item.id}')">Editar</button>
    <button class="icon-btn danger" onclick="deleteItem('budget','${item.id}')">Excluir</button>
  </div>`).join("") : `<p>Nenhum orçamento cadastrado.</p>`;
}

function renderGoals() {
  $("goalList").innerHTML = state.goals.length ? state.goals.map((goal) => {
    const percent = Math.round(Number(goal.current) / Math.max(Number(goal.target), 1) * 100);
    return `<div class="progress-item">
      <div class="progress-row"><span>${escapeHtml(goal.name)}</span><span>${Math.min(percent, 100)}%</span></div>
      <div class="bar"><span style="width:${Math.min(percent, 100)}%"></span></div>
      <small>${brl.format(goal.current)} de ${brl.format(goal.target)} até ${formatDate(goal.deadline)}</small>
      <div class="row-actions">
        <button class="icon-btn" onclick="addToGoal('${goal.id}')">Adicionar valor</button>
        <button class="icon-btn" onclick="editItem('goal','${goal.id}')">Editar</button>
        <button class="icon-btn danger" onclick="deleteItem('goal','${goal.id}')">Excluir</button>
      </div>
    </div>`;
  }).join("") : `<p>Nenhuma meta cadastrada.</p>`;
}

function renderCategories() {
  $("categoryList").innerHTML = state.categories.map((category) => {
    const isDefault = DEFAULT_CATEGORIES.includes(category);
    return `<span class="chip">${escapeHtml(category)}
      <button class="icon-btn" onclick="editCategory('${escapeAttr(category)}')">Editar</button>
      ${isDefault ? "" : `<button class="icon-btn danger" onclick="deleteCategory('${escapeAttr(category)}')">Excluir</button>`}
    </span>`;
  }).join("");
}

function renderProfile() {
  const profile = state.profile || {};
  $("profilePreview").innerHTML = `<div class="profile-preview">
    ${profile.photo ? `<img src="${profile.photo}" alt="Foto de ${escapeAttr(profile.name || "usuário")}" />` : `<div class="profile-placeholder">CF</div>`}
    <div>
      <strong>${escapeHtml(profile.name || "Nome não informado")}</strong>
      <span>${escapeHtml(profile.job || "Ocupação não informada")}</span>
      <small>${escapeHtml(profile.phone || "Telefone não informado")}</small>
      <small>${escapeHtml(profile.city || "Cidade não informada")}</small>
      <p>${escapeHtml(profile.note || "Informações básicas do usuário, sem CPF ou dados bancários.")}</p>
    </div>
  </div>`;
}

function loadProfileForm() {
  const profile = state?.profile || {};
  $("profileName").value = profile.name || "";
  $("profilePhone").value = profile.phone || "";
  $("profileCity").value = profile.city || "";
  $("profileJob").value = profile.job || "";
  $("profileNote").value = profile.note || "";
}

function renderBlog() {
  $("blogList").innerHTML = BLOG_POSTS.map((post) => `<article class="blog-card">
    <img src="${post.image}" alt="${escapeAttr(post.title)}" loading="lazy" />
    <div>
      <span class="blog-keyword">${escapeHtml(post.keyword)}</span>
      <h3>${escapeHtml(post.title)}</h3>
      <small>${formatDate(post.date)}</small>
      <p>${escapeHtml(post.excerpt)}</p>
      <p>${escapeHtml(post.body)}</p>
    </div>
  </article>`).join("");
}

function renderExport() {
  $("exportOutput").value = buildCsv();
}

function applyTheme(theme = "light", persist = true) {
  document.body.dataset.theme = theme;
  if (state) {
    state.preferences = { ...(state.preferences || {}), theme };
    if (persist) {
      const users = loadUsers();
      if (users[currentUser]) {
        users[currentUser].data = state;
        saveUsers(users);
      }
    }
  }
  document.querySelectorAll("[data-theme-option]").forEach((button) => button.classList.toggle("active", button.dataset.themeOption === theme));
}

function renderSettings() {
  applyTheme(state.preferences?.theme || "light", false);
}

function renderAll() {
  if (!state) return;
  syncSelects();
  renderDashboard();
  renderIncomes();
  renderExpenses();
  renderCards();
  renderBudgets();
  renderGoals();
  renderCategories();
  renderProfile();
  renderBills();
  renderSettings();
  renderBlog();
  renderExport();
  drawCharts();
}

function table(headers, rows) {
  if (!rows.length) return "<p>Nenhum registro encontrado.</p>";
  return `<table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function actions(type, id) {
  return `<div class="row-actions">
    <button class="icon-btn" onclick="editItem('${type}','${id}')">Editar</button>
    <button class="icon-btn danger" onclick="deleteItem('${type}','${id}')">Excluir</button>
  </div>`;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function escapeAttr(value = "") {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function collectionName(type) {
  return {
    income: "incomes",
    expense: "expenses",
    card: "cards",
    budget: "budgets",
    goal: "goals"
  }[type];
}

window.editItem = function editItem(type, id) {
  const item = state[collectionName(type)].find((entry) => entry.id === id);
  if (!item) return;

  if (type === "income") {
    $("incomeId").value = id;
    $("incomeDescription").value = item.description;
    $("incomeAmount").value = item.amount;
    $("incomeDate").value = item.date;
    $("incomeCategory").value = item.category;
    $("incomeWallet").value = item.wallet;
    $("incomeNote").value = item.note || "";
    switchSection("receitas");
  }
  if (type === "expense") {
    $("expenseId").value = id;
    $("expenseDescription").value = item.description;
    $("expenseAmount").value = item.amount;
    $("expenseDueDate").value = item.dueDate;
    $("expensePaidDate").value = item.paidDate || "";
    $("expenseCategory").value = item.category;
    $("expensePayment").value = item.payment;
    $("expenseStatus").value = item.status;
    $("expenseNote").value = item.note || "";
    switchSection("despesas");
  }
  if (type === "card") {
    $("cardId").value = id;
    $("cardName").value = item.name;
    $("cardLimit").value = item.limit;
    $("cardCloseDay").value = item.closeDay;
    $("cardDueDay").value = item.dueDay;
    $("cardColor").value = item.color;
  }
  if (type === "budget") {
    $("budgetId").value = id;
    $("budgetCategory").value = item.category;
    $("budgetLimit").value = item.limit;
  }
  if (type === "goal") {
    $("goalId").value = id;
    $("goalName").value = item.name;
    $("goalTarget").value = item.target;
    $("goalCurrent").value = item.current;
    $("goalDeadline").value = item.deadline;
  }
};

window.deleteItem = function deleteItem(type, id) {
  const key = collectionName(type);
  state[key] = state[key].filter((item) => item.id !== id);
  if (type === "card") state.purchases = state.purchases.filter((purchase) => purchase.cardId !== id);
  saveState();
};

window.addToGoal = function addToGoal(id) {
  const goal = state.goals.find((item) => item.id === id);
  if (!goal) return;
  const value = Number(prompt("Valor a adicionar à meta:") || 0);
  if (value > 0) {
    goal.current = Number(goal.current) + value;
    saveState();
  }
};

window.editCategory = function editCategory(category) {
  $("categoryId").value = category;
  $("categoryName").value = category;
};

window.deleteCategory = function deleteCategory(category) {
  state.categories = state.categories.filter((item) => item !== category);
  saveState();
};

function upsert(collection, item) {
  const index = state[collection].findIndex((entry) => entry.id === item.id);
  if (index >= 0) state[collection][index] = item;
  else state[collection].push(item);
}

function setupForms() {
  $("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const users = loadUsers();
    const username = $("loginUser").value.trim();
    const passwordHash = await simpleHash($("loginPass").value);
    if (!users[username] || users[username].passwordHash !== passwordHash) {
      $("loginMessage").textContent = "Usuário ou senha inválidos.";
      return;
    }
    currentUser = username;
    localStorage.setItem("cfp_current_user", currentUser);
    state = normalizeData(users[username].data);
    users[username].data = state;
    saveUsers(users);
    showApp();
  });

  $("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const users = loadUsers();
    const username = $("registerUser").value.trim();
    if (users[username]) {
      $("registerMessage").textContent = "Esse usuário já existe.";
      return;
    }
    users[username] = {
      passwordHash: await simpleHash($("registerPass").value),
      recoveryHash: await simpleHash($("registerRecovery").value.trim().toLowerCase()),
      data: emptyData()
    };
    saveUsers(users);
    $("registerMessage").textContent = "Conta criada. Entre para continuar.";
    $("registerForm").classList.add("hidden");
    $("loginForm").classList.remove("hidden");
    $("resetForm").classList.add("hidden");
    $("loginUser").value = username;
  });

  $("resetForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const users = loadUsers();
    const username = $("resetUser").value.trim();
    const recoveryHash = await simpleHash($("resetRecovery").value.trim().toLowerCase());
    if (!users[username]?.recoveryHash || users[username].recoveryHash !== recoveryHash) {
      $("resetMessage").textContent = "Usuário ou frase de recuperação inválidos.";
      return;
    }
    users[username].passwordHash = await simpleHash($("resetPass").value);
    saveUsers(users);
    $("resetMessage").textContent = "Senha alterada. Entre com a nova senha.";
    $("loginUser").value = username;
    $("loginForm").classList.remove("hidden");
    $("registerForm").classList.add("hidden");
    $("resetForm").classList.add("hidden");
  });

  $("showRegister").addEventListener("click", () => {
    $("loginForm").classList.add("hidden");
    $("registerForm").classList.remove("hidden");
    $("resetForm").classList.add("hidden");
  });

  $("showLogin").addEventListener("click", () => {
    $("registerForm").classList.add("hidden");
    $("loginForm").classList.remove("hidden");
    $("resetForm").classList.add("hidden");
  });

  $("showReset").addEventListener("click", () => {
    $("loginForm").classList.add("hidden");
    $("registerForm").classList.add("hidden");
    $("resetForm").classList.remove("hidden");
  });

  $("resetBackLogin").addEventListener("click", () => {
    $("resetForm").classList.add("hidden");
    $("registerForm").classList.add("hidden");
    $("loginForm").classList.remove("hidden");
  });

  $("logoutBtn").addEventListener("click", () => {
    logout();
  });

  $("settingsLogoutBtn").addEventListener("click", logout);

  document.querySelectorAll("#nav button, .profile-shortcut").forEach((button) => button.addEventListener("click", () => switchSection(button.dataset.section)));
  document.querySelectorAll("[data-go-section]").forEach((button) => button.addEventListener("click", () => switchSection(button.dataset.goSection)));
  document.querySelectorAll("[data-theme-option]").forEach((button) => button.addEventListener("click", () => {
    applyTheme(button.dataset.themeOption);
    drawCharts();
  }));
  ["monthFilter", "searchInput", "filterCategory", "filterStatus", "filterPayment"].forEach((id) => $(id).addEventListener("input", renderAll));

  $("incomeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const id = $("incomeId").value || uid();
    upsert("incomes", {
      id,
      description: $("incomeDescription").value.trim(),
      amount: parseMoney($("incomeAmount").value),
      date: $("incomeDate").value,
      category: $("incomeCategory").value,
      wallet: $("incomeWallet").value.trim(),
      note: $("incomeNote").value.trim()
    });
    event.target.reset();
    $("incomeId").value = "";
    $("incomeDate").value = todayIso();
    saveState();
  });

  $("expenseForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = $("expenseId").value || uid();
    const existing = state.expenses.find((expense) => expense.id === id);
    const receiptPhoto = $("expensePhoto").files[0] ? await fileToDataUrl($("expensePhoto").files[0]) : existing?.receiptPhoto || "";
    upsert("expenses", {
      id,
      description: $("expenseDescription").value.trim(),
      amount: parseMoney($("expenseAmount").value),
      dueDate: $("expenseDueDate").value,
      paidDate: $("expensePaidDate").value,
      category: $("expenseCategory").value,
      payment: $("expensePayment").value,
      status: $("expenseStatus").value,
      note: $("expenseNote").value.trim(),
      receiptPhoto
    });
    event.target.reset();
    $("expenseId").value = "";
    $("expenseDueDate").value = todayIso();
    saveState();
  });

  $("cardForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const id = $("cardId").value || uid();
    upsert("cards", {
      id,
      name: $("cardName").value.trim(),
      limit: parseMoney($("cardLimit").value),
      closeDay: Number($("cardCloseDay").value),
      dueDay: Number($("cardDueDay").value),
      color: $("cardColor").value
    });
    event.target.reset();
    $("cardId").value = "";
    $("cardColor").value = "#2563eb";
    saveState();
  });

  $("purchaseForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const installments = Math.max(Number($("purchaseInstallments").value), 1);
    const amount = parseMoney($("purchaseAmount").value);
    const installmentAmount = Number((amount / installments).toFixed(2));
    const baseDate = new Date(`${$("purchaseDate").value}T00:00:00`);
    for (let index = 0; index < installments; index += 1) {
      const date = new Date(baseDate);
      date.setMonth(date.getMonth() + index);
      state.purchases.push({
        id: uid(),
        cardId: $("purchaseCard").value,
        description: $("purchaseDescription").value.trim(),
        amount,
        installmentAmount,
        installment: index + 1,
        installments,
        date: date.toISOString().slice(0, 10),
        category: $("purchaseCategory").value
      });
    }
    event.target.reset();
    $("purchaseInstallments").value = 1;
    $("purchaseDate").value = todayIso();
    saveState();
  });

  $("budgetForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const id = $("budgetId").value || uid();
    upsert("budgets", {
      id,
      category: $("budgetCategory").value,
      limit: parseMoney($("budgetLimit").value)
    });
    event.target.reset();
    $("budgetId").value = "";
    saveState();
  });

  $("goalForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const id = $("goalId").value || uid();
    upsert("goals", {
      id,
      name: $("goalName").value.trim(),
      target: parseMoney($("goalTarget").value),
      current: parseMoney($("goalCurrent").value),
      deadline: $("goalDeadline").value
    });
    event.target.reset();
    $("goalId").value = "";
    $("goalDeadline").value = todayIso();
    saveState();
  });

  $("categoryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const oldName = $("categoryId").value;
    const name = $("categoryName").value.trim();
    if (!name) return;
    if (oldName) {
      state.categories = state.categories.map((item) => item === oldName ? name : item);
      ["incomes", "expenses", "purchases", "budgets"].forEach((collection) => state[collection].forEach((item) => {
        if (item.category === oldName) item.category = name;
      }));
    } else if (!state.categories.includes(name)) {
      state.categories.push(name);
    }
    event.target.reset();
    $("categoryId").value = "";
    saveState();
  });

  $("profileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const currentPhoto = state.profile?.photo || "";
    state.profile = {
      photo: $("profilePhoto").files[0] ? await fileToDataUrl($("profilePhoto").files[0]) : currentPhoto,
      name: $("profileName").value.trim(),
      phone: $("profilePhone").value.trim(),
      city: $("profileCity").value.trim(),
      job: $("profileJob").value.trim(),
      note: $("profileNote").value.trim()
    };
    event.target.reset();
    saveState();
  });

  $("exportCsvBtn").addEventListener("click", () => {
    const blob = new Blob([buildCsv()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `controle-financeiro-${todayIso()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });

  $("copyTableBtn").addEventListener("click", async () => {
    $("exportOutput").value = buildCsv();
    await navigator.clipboard.writeText($("exportOutput").value);
  });
}

function buildCsv() {
  if (!state) return "";
  const lines = [["tipo", "descricao", "valor", "data", "categoria", "status", "forma", "detalhe"]];
  state.incomes.forEach((item) => lines.push(["receita", item.description, item.amount, item.date, item.category, "", "", item.wallet]));
  state.expenses.forEach((item) => lines.push(["despesa", item.description, item.amount, item.dueDate, item.category, item.status, item.payment, item.note || ""]));
  state.purchases.forEach((item) => lines.push(["cartao", item.description, item.installmentAmount, item.date, item.category, "", "Crédito", `${item.installment}/${item.installments}`]));
  state.goals.forEach((item) => lines.push(["meta", item.name, item.current, item.deadline, "", "", "", `objetivo ${item.target}`]));
  state.budgets.forEach((item) => lines.push(["orcamento", item.category, item.limit, $("monthFilter").value, item.category, "", "", "limite mensal"]));
  return lines.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")).join("\n");
}

function aggregateBy(items, key, value = "amount") {
  return items.reduce((acc, item) => {
    const label = item[key] || "Outros";
    acc[label] = (acc[label] || 0) + Number(item[value] || 0);
    return acc;
  }, {});
}

function monthlySeries() {
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return monthKey(date);
  });
  return months;
}

function drawCharts() {
  if (!state) return;
  drawBar("chartCategories", aggregateBy(selectedMonthExpenses(), "category"), "#2563eb");
  const months = monthlySeries();
  drawGrouped("chartMonthly", months.map((m) => ({
    label: m.slice(5),
    income: total(state.incomes.filter((item) => item.date.slice(0, 7) === m)),
    expense: total(state.expenses.filter((item) => item.dueDate.slice(0, 7) === m))
  })));
  let running = 0;
  drawLine("chartBalance", months.map((m) => {
    running += total(state.incomes.filter((item) => item.date.slice(0, 7) === m)) - total(state.expenses.filter((item) => item.dueDate.slice(0, 7) === m));
    return { label: m.slice(5), value: running };
  }));
  drawBar("chartCards", aggregateBy(selectedMonthPurchases().map((purchase) => ({ ...purchase, card: state.cards.find((card) => card.id === purchase.cardId)?.name || "Cartão" })), "card", "installmentAmount"), "#d97706");
  drawBar("chartBudgets", Object.fromEntries(budgetUsage().map((item) => [item.label, item.percent])), "#059669", "%");
}

function prepareCanvas(id) {
  const canvas = $(id);
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.font = "12px system-ui";
  ctx.fillStyle = "#607083";
  return { canvas, ctx, width: rect.width, height: rect.height };
}

function chartEmpty(ctx, width, height) {
  ctx.fillStyle = "#607083";
  ctx.textAlign = "center";
  ctx.fillText("Sem dados para o período", width / 2, height / 2);
}

function drawBar(id, data, color, suffix = "") {
  const { ctx, width, height } = prepareCanvas(id);
  const entries = Object.entries(data).filter(([, value]) => value > 0);
  if (!entries.length) return chartEmpty(ctx, width, height);
  const max = Math.max(...entries.map(([, value]) => value), 1);
  const pad = 38;
  const gap = 12;
  const barWidth = Math.max((width - pad * 2 - gap * (entries.length - 1)) / entries.length, 18);
  entries.forEach(([label, value], index) => {
    const x = pad + index * (barWidth + gap);
    const barHeight = (height - 82) * value / max;
    ctx.fillStyle = color;
    ctx.fillRect(x, height - 42 - barHeight, barWidth, barHeight);
    ctx.fillStyle = "#182334";
    ctx.textAlign = "center";
    ctx.fillText(suffix ? `${Math.round(value)}${suffix}` : brl.format(value).replace("R$", ""), x + barWidth / 2, height - 48 - barHeight);
    ctx.fillStyle = "#607083";
    ctx.fillText(label.slice(0, 12), x + barWidth / 2, height - 18);
  });
}

function drawGrouped(id, rows) {
  const { ctx, width, height } = prepareCanvas(id);
  const max = Math.max(...rows.flatMap((row) => [row.income, row.expense]), 1);
  const pad = 36;
  const group = (width - pad * 2) / rows.length;
  rows.forEach((row, index) => {
    const x = pad + index * group + group * 0.18;
    const w = Math.max(group * 0.22, 12);
    const incomeH = (height - 78) * row.income / max;
    const expenseH = (height - 78) * row.expense / max;
    ctx.fillStyle = "#059669";
    ctx.fillRect(x, height - 38 - incomeH, w, incomeH);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(x + w + 4, height - 38 - expenseH, w, expenseH);
    ctx.fillStyle = "#607083";
    ctx.textAlign = "center";
    ctx.fillText(row.label, x + w, height - 14);
  });
}

function drawLine(id, rows) {
  const { ctx, width, height } = prepareCanvas(id);
  if (!rows.length) return chartEmpty(ctx, width, height);
  const max = Math.max(...rows.map((row) => row.value), 1);
  const min = Math.min(...rows.map((row) => row.value), 0);
  const pad = 38;
  const usableH = height - 74;
  const points = rows.map((row, index) => {
    const x = pad + index * ((width - pad * 2) / Math.max(rows.length - 1, 1));
    const y = height - 38 - ((row.value - min) / Math.max(max - min, 1)) * usableH;
    return { x, y, row };
  });
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
  ctx.stroke();
  points.forEach((point) => {
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#607083";
    ctx.textAlign = "center";
    ctx.fillText(point.row.label, point.x, height - 14);
  });
}

function bootstrap() {
  setupForms();
  $("monthFilter").value = monthKey();
  ["incomeDate", "expenseDueDate", "purchaseDate", "goalDeadline"].forEach((id) => $(id).value = todayIso());
  const users = loadUsers();
  if (currentUser && users[currentUser]) {
    state = normalizeData(users[currentUser].data);
    users[currentUser].data = state;
    saveUsers(users);
    showApp();
  } else {
    showAuth();
  }
}

window.addEventListener("resize", () => {
  clearTimeout(window.__chartTimer);
  window.__chartTimer = setTimeout(drawCharts, 120);
});

bootstrap();
