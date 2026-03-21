async function carregarCursos() {
    try {
        const res = await fetch("http://localhost:3000/cursos");

        if (!res.ok) {
            console.error("Erro no servidor:", res.status);
            return;
        }

        const cursos = await res.json();
        const container = document.getElementById("containerCursos");
        
        if (!container) {
            console.error("Erro: Elemento 'containerCursos' não encontrado no HTML!");
            return;
        }

        container.innerHTML = ""; 

        if (!Array.isArray(cursos) || cursos.length === 0) {
            container.innerHTML = `<p style="text-align:center; width:100%;">Nenhum curso disponível no momento.</p>`;
            return;
        }

cursos.forEach(curso => {
            const statusClass = curso.status === 'esgotado' ? 'card-esgotado' : 'card-aberto';
            const statusTexto = curso.status === 'esgotado' ? 'Esgotado' : 'Inscrições Abertas';
            
            // Tratamento inteligente para o Horário
            let textoHorario = "A definir";
            if (curso.horario_inicio && curso.horario_termino) {
                textoHorario = `${curso.horario_inicio} às ${curso.horario_termino}`;
            } else if (curso.horario_inicio) {
                textoHorario = `A partir das ${curso.horario_inicio}`;
            }

            // Tratamento inteligente para a Duração (Data)
            let textoDuracao = "A definir";
            if (curso.data_inicio && curso.data_termino) {
                textoDuracao = `${curso.data_inicio} até ${curso.data_termino}`;
            } else if (curso.data_inicio) {
                textoDuracao = `Início em ${curso.data_inicio}`;
            }

            container.innerHTML += `
                <div class="curso-card ${statusClass}" 
                    data-idade-min="${curso.idade_min}" 
                    data-idade-max="${curso.idade_max}" 
                    data-categoria="${curso.categoria || ''}" 
                    data-local="${curso.local || ''}">
                    
                    <div class="card-header">
                        <span class="categoria-tag">${curso.categoria || 'Geral'}</span>
                        <span class="vagas-badge">${curso.vagas} vagas</span>
                    </div>
                    
                    <div class="card-body">
                        <h3 class="curso-titulo">${curso.nome}</h3>
                        <p class="curso-info"> <strong>Local:</strong> ${curso.local || 'Não informado'}</p>
                        <p class="curso-info"> <strong>Idade:</strong> ${curso.idade_min} a ${curso.idade_max} anos</p>
                        <p class="curso-info"> <strong>Horário:</strong> ${textoHorario}</p>
                        <p class="curso-info"> <strong>Duração:</strong> ${textoDuracao}</p>
                    </div>

                    <div class="card-footer">
                        <button class="btn-card-detalhes" 
                                onclick="irParaDetalhes(${curso.id})">
                            Saiba Mais
                        </button>
                        <span class="status-indicador">${statusTexto}</span>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Erro ao carregar cursos:", err);
    }
}

carregarCursos();
// Função global para evitar erro de escopo e cache
function irParaDetalhes(id) {
    if (!id) {
        console.error("Erro: ID do curso é inválido.");
        return;
    }
    // Adicionamos a / no início do caminho para evitar a duplicação de pastas
    const timestamp = new Date().getTime();
    window.location.href = `/pages/detalhes.html?id=${id}&v=${timestamp}`;
}

async function carregarFiltros() {
    // IDADE
    let r1 = await fetch("http://localhost:3000/public/idade");
    let idades = await r1.json();
    let selIdade = document.querySelector("#filtro-idade");
    selIdade.innerHTML = '<option value="">Todas</option>';
    idades.forEach(i => selIdade.innerHTML += `<option>${i.idade}</option>`);

    // CATEGORIA
    let r2 = await fetch("http://localhost:3000/public/categoria");
    let categorias = await r2.json();
    let selCategoria = document.querySelector("#filtro-categoria");
    selCategoria.innerHTML = '<option value="">Todas</option>';
    categorias.forEach(c => selCategoria.innerHTML += `<option>${c.categoria}</option>`);

    // A PARTE DA MODALIDADE FOI REMOVIDA DAQUI

    // LOCAL
    let r4 = await fetch("http://localhost:3000/public/local");
    let locais = await r4.json();
    let selLocal = document.querySelector("#filtro-local");
    selLocal.innerHTML = '<option value="">Todos</option>';
    locais.forEach(l => selLocal.innerHTML += `<option>${l.local}</option>`);
}
carregarFiltros();

async function inscrever(curso_id) {
    const nome = prompt("Seu nome:");
    const email = prompt("Seu email:");
    const telefone = prompt("Seu telefone:");

    const res = await fetch("http://localhost:3000/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, curso_id })
    });

    const resposta = await res.json();
    alert(resposta.status || resposta.error);
}

// =========================================================
// 🔴 CARREGAR ESTATÍSTICAS (VAGAS HOJE E PREENCHIDAS) 🔴
// =========================================================
async function carregarEstatisticas() {
    try {
        const res = await fetch('http://localhost:3000/api/estatisticas');
        if (!res.ok) return;
        
        const data = await res.json();
        
        const elVagasHoje = document.getElementById('vagasHoje');
        const elVagas2026 = document.getElementById('vagas2026');

        if (elVagasHoje) elVagasHoje.innerText = data.vagasHoje;
        if (elVagas2026) elVagas2026.innerText = data.vagas2026;

    } catch (err) {
        console.error("Erro ao puxar estatísticas:", err);
    }
}


document.addEventListener('DOMContentLoaded', () => {
  const chatBtn = document.getElementById('chatBtn');
  const chatWindow = document.getElementById('chatWindow');
  const chatBody = document.getElementById('chatBody');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const muteToggle = document.getElementById('muteToggle');
  const avatarBubble = document.getElementById('avatarBubble');
  
  let muted = false;
  let avatarTimeout = null;

  // abrir/fechar chat
chatBtn.addEventListener('click', () => {
    const isOpening = chatWindow.style.display !== 'block';
    
    if (isOpening) {
        chatWindow.style.display = 'block';
        document.body.classList.add('chat-active'); // Move o Vitoruga
        chatInput.focus();
    } else {
        chatWindow.style.display = 'none';
        document.body.classList.remove('chat-active'); // Volta o Vitoruga
    }
});

  // TTS respeitando mute
  function speak(text) {
  if (muted || !text.trim()) return;

  if (speechSynthesis.speaking) speechSynthesis.cancel();

  let t = text;

  // Remove HTML
  t = t.replace(/<[^>]+>/g, "");

  // Remove markdown
  t = t.replace(/[*_~`]/g, "");

  // Remove emojis
  t = t.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF][\uDC00-\uDFFF])/g,
    ""
  );

  // Substitui símbolos por fala
  t = t
    .replace(/📘/g, "") // ícone de livro
    .replace(/📍/g, "Local: ")
    .replace(/👥/g, "vagas: ")
    .replace(/👉/g, "")
    .replace(/🚀/g, "")
    .replace(/—/g, " - ")
    .replace(/\s+/g, " ") // limpa espaços extras
    .trim();

  const utter = new SpeechSynthesisUtterance(t);
  utter.lang = "pt-BR";
  utter.rate = 1;
  utter.pitch = 1;
  utter.volume = 1;

  utter.onstart = startAvatarTalking;
  utter.onend = stopAvatarTalking;

  speechSynthesis.speak(utter);
}



// animação do avatar (Unificado com o ID avatarImg)
function startAvatarTalking() {
    const avatar = document.getElementById('avatarImg');
    if (!avatar) return;
    avatar.classList.add('talking');
}

function stopAvatarTalking() {
    const avatar = document.getElementById('avatarImg');
    if (!avatar) return;
    avatar.classList.remove('talking');
}

  // mute
  if (muteToggle) {
    muteToggle.addEventListener('click', () => {
      muted = !muted;
      muteToggle.textContent = muted ? '🔇' : '🔊';
      muteToggle.setAttribute('aria-pressed', muted);

      if (muted && speechSynthesis.speaking) speechSynthesis.cancel();
    });
  }

  // adiciona mensagens
  function addMessage(who, htmlText) {
    const div = document.createElement('div');
    div.className = `chat-msg ${who === 'user' ? 'user' : 'bot'}`;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    // melhora o regex do botão
    const text = htmlText.replace(
      /(https?:\/\/[^\s]*pre_inscricao\.html\?id=\d+|pre_inscricao\.html\?id=\d+)/g,
      `<a href="$1" style="background:#0aa;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:bold;display:block;margin-top:6px;">🚀 Fazer Pré-inscrição</a>`
    );

    bubble.innerHTML = text;
    div.appendChild(bubble);
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;

    if (who === 'bot') {
      speak(text.replace(/<[^>]*>?/gm, ''));
    }
  }

async function enviarMensagem() {
    const text = chatInput.value.trim();
    if (!text) return;

    // 1. Muda o visual do Vitoruga conforme o curso digitado
    atualizarAvatarSeCurso(text); 

    // 2. Adiciona a mensagem do usuário na tela
    addMessage('user', text);
    chatInput.value = ''; // Limpa o campo após enviar

    // 3. Lógica de resposta para inscrições
    if (/inscri|inscrever|matricul|pre[- ]?inscri/i.test(text)) {
        addMessage('bot', `
            Claro! Clique no botão abaixo para fazer sua pré-inscrição:
            <br><br>
            <a href="pre_inscricao.html" style="background:#0aa;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Fazer Pré-inscrição</a>
        `);
        return;
    }

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        const data = await res.json();
        const respostaFiltrada = filtrarCursos(data.reply, text);
        addMessage('bot', respostaFiltrada);

    } catch (err) {
        addMessage('bot', 'Erro ao enviar. Tente novamente.');
    }
}

  chatSend.addEventListener('click', enviarMensagem);
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') enviarMensagem();
  });

  if (avatarBubble) {
    avatarBubble.addEventListener('click', () => {
      chatWindow.style.display = 'block';
      chatInput.focus();
    });
  }
});
function removerEmojis(texto) {
  return texto.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF][\uDC00-\uDFFF])/g,
    ""
  ).trim();
}
// Dicionário de cursos + abreviações/sinônimos
const mapaCursos = {
  "administração": ["adm", "admin", "administracao"],
  "artesanato": ["artes", "artesan"],
  "automação industrial": ["auto", "automacao", "industrial", "automa"],
  "beleza": ["estetica", "beleza"],
  "cinema": ["cine"],
  "comércio / gestão empresarial": ["comercio", "gestao", "empresarial", "gest"],
  "confecção": ["confeccao", "confec"],
  "construção civil / serviço": ["construcao", "civil", "servico", "obra"],
  "cultura": ["cultur"],
  "dança": ["danca"],
  "dança e teatro": ["teatro", "danca"],
  "educação": ["educa"],
  "eletrônica": ["eletron", "eletronica"],
  "eletricista / energia": ["eletric", "energia"],
  "enfermagem / saúde": ["enf", "enfermagem", "saude"],
  "estética": ["estetica"],
  "eventos": ["event"],
  "fotografia": ["foto", "fotografia"],
  "gastronomia": ["gastro", "cozinha"],
  "gestão": ["gestao", "gest"],
  "idiomas": ["idioma", "ingles", "espanhol", "frances"],
  "informática / tecnologia": ["info", "informatica", "tec", "tecnologia", "ti"],
  "logística": ["log", "logistica"],
  "manutenção": ["manutencao", "manu"],
  "mecânica": ["mec", "mecanica"],
  "meio ambiente": ["ambiente", "meio"],
  "moda": ["moda", "fashion"],
  "música": ["mus", "musica"],
  "panificação / confeitaria": ["pani", "pao", "confeitaria"],
  "produção cultural": ["producao", "cultural"],
  "programação / ti": ["programacao", "programar", "prog", "dev", "codigo", "ti"],
  "recursos humanos": ["rh", "recurso", "humanos"],
  "redes / telecom": ["redes", "telecom", "net", "wifi", "rede"],
  "segurança do trabalho": ["seg", "seguranca", "trabalho", "sst"],
  "serviço social": ["servico", "social", "ss"],
  "soldagem": ["solda", "sold"],
  "turismo / hotelaria": ["tur", "turismo", "hotelaria", "hotel"],
  "vendas / marketing": ["vendas", "marketing", "mkt"]
};

function filtrarCursos(respostaBruta, textoUsuario) {
  const normalizar = t =>
    removerEmojis(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const user = normalizar(textoUsuario);

  // extrair termo
  let termo = user
    .replace(/curso(s)?\s*(de)?\s*/g, "")
    .trim();

  if (!termo) return respostaBruta;

  const termoNorm = normalizar(termo);

  // montar lista de sinônimos e abreviações
  const sinonimos = [];

  for (const nome in mapaCursos) {
    const nomeNorm = normalizar(nome);
    sinonimos.push({ nome, nomeNorm, keys: mapaCursos[nome].map(normalizar) });
  }

  // identificar cursos que correspondem ao termo
  const cursosDetectados = sinonimos.filter(c => {
    if (c.nomeNorm.includes(termoNorm) || termoNorm.includes(c.nomeNorm)) return true;
    if (c.keys.some(k => k.startsWith(termoNorm))) return true;
    if (c.keys.some(k => termoNorm.startsWith(k))) return true;
    return false;
  });

  if (cursosDetectados.length === 0) {
    return `Nenhum curso encontrado para "${termo}".`;
  }

  // separar em blocos pelo 📘
  const blocos = respostaBruta
    .split(/📘/g)
    .map(b => b.trim())
    .filter(b => b.length > 5)
    .map(b => "📘 " + b);

  const resultados = [];

  for (const bloco of blocos) {
    const blocoNorm = normalizar(bloco);

    if (cursosDetectados.some(c => blocoNorm.includes(c.nomeNorm))) {
      resultados.push(bloco);
    }
  }

  if (resultados.length === 0) {
    return `Curso encontrado, mas nenhum resultado disponível no momento.`;
  }

  return `
📚 <b>${resultados.length}</b> curso(s) encontrado(s) relacionado(s) a <b>${termo}</b>:
<br><br>
${resultados.join("<br><br>")}
  `;
}
function aplicarFiltros() {
    // Pega os valores atuais dos selects
    const idadeSel = document.querySelector("#filtro-idade").value;
    const categoriaSel = document.querySelector("#filtro-categoria").value;
    const localSel = document.querySelector("#filtro-local").value;

    const cards = document.querySelectorAll(".curso-card");
    let encontrouAlgum = false;

    cards.forEach(card => {
        // Pega os dados salvos nos atributos data-
        const min = parseInt(card.dataset.idadeMin);
        const max = parseInt(card.dataset.idadeMax);
        const cat = card.dataset.categoria;
        const loc = card.dataset.local;

        // Lógica: se o filtro estiver vazio, ele ignora a regra (true)
        const bateIdade = !idadeSel || (parseInt(idadeSel) >= min && parseInt(idadeSel) <= max);
        const bateCategoria = !categoriaSel || cat === categoriaSel;
        const bateLocal = !localSel || loc === localSel;

        // Aplica a visibilidade
        if (bateIdade && bateCategoria && bateLocal) {
            card.style.display = "flex";
            encontrouAlgum = true;
        } else {
            card.style.display = "none";
        }
    });

    // Feedback visual se não sobrar nenhum card
    gerenciarMensagemVazia(encontrouAlgum);
}

function gerenciarMensagemVazia(temCursos) {
    const container = document.getElementById("containerCursos");
    let msg = document.getElementById("msg-vazia");

    if (!temCursos) {
        if (!msg) {
            container.insertAdjacentHTML('beforeend', `
                <div id="msg-vazia" style="width:100%; text-align:center; padding:50px; color:#666;">
                    <p>Nenhum curso encontrado para os filtros selecionados. 🐢</p>
                </div>
            `);
        }
    } else if (msg) {
        msg.remove();
    }
}
async function inicializarPortal() {
    try {
        const containerCursos = document.getElementById("containerCursos");
        const temFiltros = document.getElementById("filtro-idade");

        if (containerCursos) {
            console.log("📂 Carregando lista de cursos...");
            await carregarCursos(); 
            await carregarEstatisticas(); // 🔴 AQUI! Chama as estatísticas junto com os cursos
        }
        
       

        if (temFiltros) {
            console.log("🔍 Carregando filtros...");
            await carregarFiltros(); 
            
            // 2. Mapeia e Vincula os eventos apenas se os elementos existirem
            const selIdade = document.getElementById("filtro-idade");
            const selCategoria = document.getElementById("filtro-categoria");
            const selLocal = document.getElementById("filtro-local");
            const btnLimpar = document.getElementById("btn-limpar");

            if (selIdade) selIdade.addEventListener("change", aplicarFiltros);
            if (selCategoria) selCategoria.addEventListener("change", aplicarFiltros);
            if (selLocal) selLocal.addEventListener("change", aplicarFiltros);
            
            if (btnLimpar) {
                btnLimpar.addEventListener("click", () => {
                    limparFiltros();
                    if (typeof mascoteImg !== 'undefined' && mascoteImg) {
                        mascoteImg.src = avatarPadrao;
                    }
                });
            }
        }

        // 3. Inicializa o Chat (Isso geralmente tem em todas as páginas)
        if (document.getElementById("chatBtn")) {
            console.log("🤖 Chatbot pronto.");
        }

        console.log("✅ Script geral inicializado!");

    } catch (error) {
        // Usamos um warning para não assustar o console se for apenas um elemento faltando
        console.warn("⚠️ Nota: Alguns elementos não foram carregados nesta página.", error);
    }
}

// Garante que o script espere o DOM carregar completamente antes de iniciar
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarPortal);
} else {
    inicializarPortal();
}
function limparFiltros() {
    // Reseta os valores de todos os selects para o padrão (vazio)
    document.getElementById("filtro-idade").value = "";
    document.getElementById("filtro-categoria").value = "";
    document.getElementById("filtro-local").value = "";

    // Aplica a filtragem (como tudo está vazio, todos os cards voltam a aparecer)
    aplicarFiltros();

    // Se quiser dar um toque extra, volta o Vitoruga para o modo padrão
    if (typeof mascoteImg !== 'undefined') mascoteImg.src = avatarPadrao;
}

// Registra o evento de clique no botão (coloque dentro do seu inicializarPortal ou DOMContentLoaded)
document.getElementById("btn-limpar").addEventListener("click", limparFiltros);

// ============================
//     AVATAR DO CHATBOT
// ============================
const avatarImg = document.getElementById("avatarImg");
const mascoteImg = document.getElementById("avatarMascote"); 
const avatarPadrao = "../imagem/Vitoruga.png";
// avatar padrão


// mapa de imagens do avatar por curso
const avatarCursos = {
  gastronomia: "../imagem/Vitoruga gastronômica.png",
  culinaria: "../imagem/Vitoruga gastronômica.png",
  cozinha: "../imagem/Vitoruga gastronômica.png",

  artesanato: "../imagem/Vitoruga artesã.png",
  artesanal: "../imagem/Vitoruga artesã.png",

  metalurgia: "../imagem/Vitoruga metalurgica.png",
  mecanica: "../imagem/Vitoruga metalurgica.png",
  soldagem: "../imagem/Vitoruga metalurgica.png",
  solda: "../imagem/Vitoruga metalurgica.png",

  construcao: "../imagem/Vitoruga construção civil.png",
  pedreiro: "../imagem/Vitoruga construção civil.png",
  obra: "../imagem/Vitoruga construção civil.png",
  civil: "../imagem/Vitoruga construção civil.png",
};

// normalizar texto
function normalizarAvatar(t) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ======== TROCAR AVATAR SOMENTE SE FOR FILTRO DE CURSOS ========
// SELEÇÃO CORRETA: Pegamos a tag <img> e não a <div>


// Garanta que essas constantes existam no topo do seu script de Avatar


function atualizarAvatarSeCurso(texto) {
    const t = normalizarAvatar(texto);

    // Se não falar "curso", volta ao Vitoruga normal
    if (!t.includes("curso")) {
        if(mascoteImg) mascoteImg.src = avatarPadrao;
        return;
    }

    // Procura no mapa de imagens
    let encontrou = false;
    for (const key in avatarCursos) {
        if (t.includes(key)) {
            if(mascoteImg) mascoteImg.src = avatarCursos[key];
            encontrou = true;
            break;
        }
    }

    if (!encontrou && mascoteImg) mascoteImg.src = avatarPadrao;
}

// Atualiza avatar enquanto o usuário DIGITA
document.getElementById("chatInput").addEventListener("input", e => {
  atualizarAvatarSeCurso(e.target.value);
});

// Atualiza avatar depois que ele ENVIA a mensagem
function enviarMensagem() {
  const texto = chatInput.value.trim();

  atualizarAvatarSeCurso(texto);

  // ... resto do seu código original ...
}
function filtrarCards() {
    const idadeSel = document.getElementById("filtro-idade").value;
    const categoriaSel = document.getElementById("filtro-categoria").value;
    const localSel = document.getElementById("filtro-local").value;

    const cards = document.querySelectorAll(".curso-card");

    cards.forEach(card => {
        const cIdadeMin = parseInt(card.getAttribute("data-idade-min"));
        const cIdadeMax = parseInt(card.getAttribute("data-idade-max"));
        const cCategoria = card.getAttribute("data-categoria");
        const cLocal = card.getAttribute("data-local");

        // Lógica de Comparação
        const bateIdade = !idadeSel || (parseInt(idadeSel) >= cIdadeMin && parseInt(idadeSel) <= cIdadeMax);
        const bateCategoria = !categoriaSel || cCategoria === categoriaSel;
        const bateLocal = !localSel || cLocal === localSel;

        // Mostrar ou Esconder
        if (bateIdade && bateCategoria && bateLocal) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}

/* =========================================================
   SISTEMA DO QUIZ VOCACIONAL - VIX CURSOS
========================================================= */

// 1. Banco de Dados das Perguntas
const perguntasQuiz = [
    {
        pergunta: "1. Como você prefere colocar a mão na massa no dia a dia?",
        respostas: [
            { texto: "A) Misturando ingredientes e testando receitas.", categoria: "gastronomia" },
            { texto: "B) Usando ferramentas para consertar ou montar coisas.", categoria: "manutencao" },
            { texto: "C) Cuidando da aparência, cabelo ou maquiagem.", categoria: "beleza" },
            { texto: "D) No computador ou celular, organizando coisas.", categoria: "tecnologia" }
        ]
    },
    {
        pergunta: "2. Se você fosse abrir um pequeno negócio hoje no seu bairro, o que seria?",
        respostas: [
            { texto: "A) Uma lojinha de doces, bolos ou lanches.", categoria: "gastronomia" },
            { texto: "B) Um salão de beleza ou estúdio de unhas.", categoria: "beleza" },
            { texto: "C) Uma oficina ou serviço de pequenos reparos.", categoria: "manutencao" },
            { texto: "D) Prestação de serviço no computador ou gestão.", categoria: "tecnologia" }
        ]
    },
    {
        pergunta: "3. Qual dessas ferramentas você tem mais facilidade ou vontade de usar?",
        respostas: [
            { texto: "A) Forno, batedeira e panelas.", categoria: "gastronomia" },
            { texto: "B) Teclado, mouse e planilhas.", categoria: "tecnologia" },
            { texto: "C) Secador, pincéis e tesouras.", categoria: "beleza" },
            { texto: "D) Chave de fenda, alicate e fios.", categoria: "manutencao" }
        ]
    },
    {
        pergunta: "4. Quando você está focado trabalhando ou estudando, você prefere...",
        respostas: [
            { texto: "A) Estar em movimento, produzindo algo com as mãos.", categoria: "gastronomia" },
            { texto: "B) Conversar com as pessoas e cuidar do visual delas.", categoria: "beleza" },
            { texto: "C) Ficar concentrado tentando descobrir como algo funciona.", categoria: "manutencao" },
            { texto: "D) Ficar sentado em um ambiente organizado, resolvendo coisas na tela.", categoria: "tecnologia" }
        ]
    },
    {
        pergunta: "5. Um vizinho precisa da sua ajuda urgente. O que você resolve mais rápido?",
        respostas: [
            { texto: "A) 'Minha internet travou, me ajuda?'", categoria: "tecnologia" },
            { texto: "B) 'A luz queimou e a tomada parou!'", categoria: "manutencao" },
            { texto: "C) 'Tenho uma festa e não sei me arrumar!'", categoria: "beleza" },
            { texto: "D) 'Vai ter visita, me ajuda a fazer um lanche?'", categoria: "gastronomia" }
        ]
    },
    {
        pergunta: "6. O que mais te motiva a buscar um curso nessas carretas da prefeitura?",
        respostas: [
            { texto: "A) Fazer produtos em casa para vender e ter renda extra.", categoria: "gastronomia" },
            { texto: "B) Arrumar um trabalho com carteira assinada em escritório.", categoria: "tecnologia" },
            { texto: "C) Oferecer serviços nas casas das pessoas (autônomo).", categoria: "manutencao" },
            { texto: "D) Trabalhar em um salão ou montar meu próprio espaço.", categoria: "beleza" }
        ]
    },
    {
        pergunta: "7. Imagine que você entrou no caminhão de cursos agora. O que você quer ver lá dentro?",
        respostas: [
            { texto: "A) Bancadas limpas, computadores e ar-condicionado.", categoria: "tecnologia" },
            { texto: "B) Espelhos, luzes fortes e cadeiras de atendimento.", categoria: "beleza" },
            { texto: "C) Fornos industriais, bancadas de inox e cheiro de comida.", categoria: "gastronomia" },
            { texto: "D) Painéis de energia, motores e ferramentas.", categoria: "manutencao" }
        ]
    }
];

// 2. Variáveis de Controle
let perguntaAtual = 0;
let pontuacao = {
    gastronomia: 0,
    beleza: 0,
    manutencao: 0,
    tecnologia: 0
};

// 3. Capturando os Elementos do HTML
const btnAbrirQuiz = document.getElementById('btnAbrirQuiz');
const quizModal = document.getElementById('quizModal');
const btnFecharQuiz = document.getElementById('fecharQuiz');
const quizBody = document.getElementById('quizBody');
const quizResultado = document.getElementById('quizResultado');
const btnSalvarLead = document.getElementById('btnSalvarLead');

// 4. Funções de Abrir e Fechar o Modal
btnAbrirQuiz.addEventListener('click', () => {
    // Zera o quiz sempre que abrir
    perguntaAtual = 0;
    pontuacao = { gastronomia: 0, beleza: 0, manutencao: 0, tecnologia: 0 };
    quizResultado.style.display = 'none';
    quizBody.style.display = 'block';
    
    mostrarPergunta();
    quizModal.style.display = 'flex'; // Mostra o modal
});

btnFecharQuiz.addEventListener('click', () => {
    quizModal.style.display = 'none'; // Esconde o modal
});

// 5. Função para Mostrar a Pergunta Atual na Tela
function mostrarPergunta() {
    const dadosPergunta = perguntasQuiz[perguntaAtual];
    
    // Limpa o HTML anterior
    quizBody.innerHTML = '';

    // Cria o título da pergunta
    const titulo = document.createElement('div');
    titulo.className = 'quiz-pergunta';
    titulo.innerText = dadosPergunta.pergunta;
    quizBody.appendChild(titulo);

    // Cria os botões de resposta
    dadosPergunta.respostas.forEach(resposta => {
        const botao = document.createElement('button');
        botao.className = 'quiz-option';
        botao.innerText = resposta.texto;
        
        // Quando clicar em uma resposta...
        botao.addEventListener('click', () => {
            pontuacao[resposta.categoria]++; // Soma 1 ponto na categoria escolhida
            perguntaAtual++; // Vai pra próxima pergunta
            
            if (perguntaAtual < perguntasQuiz.length) {
                mostrarPergunta(); // Mostra a próxima
            } else {
                mostrarResultado(); // Se acabou, mostra o resultado
            }
        });

        quizBody.appendChild(botao);
    });
}

// 6. Função para Calcular e Mostrar o Resultado
function mostrarResultado() {
    quizBody.style.display = 'none'; // Esconde as perguntas
    quizResultado.style.display = 'block'; // Mostra a tela final
    
    // Descobre qual categoria teve mais pontos
    let categoriaVencedora = Object.keys(pontuacao).reduce((a, b) => pontuacao[a] > pontuacao[b] ? a : b);
    
    const tituloRef = document.getElementById('resultadoTitulo');
    const textoRef = document.getElementById('resultadoTexto');

    // Textos personalizados para cada resultado
    const mensagens = {
        gastronomia: {
            titulo: "🍰 Seu Perfil é: Gastronomia!",
            texto: "Você tem talento para colocar a mão na massa e criar pratos deliciosos. Os caminhões de panificação e confeitaria são perfeitos para você gerar renda extra!"
        },
        beleza: {
            titulo: "✂️ Seu Perfil é: Beleza & Estética!",
            texto: "Você é detalhista e adora cuidar das pessoas. Cursos como maquiagem, cabeleireiro e manicure são a sua cara para atuar em salões ou ser autônomo."
        },
        manutencao: {
            titulo: "🔧 Seu Perfil é: Manutenção & Reparos!",
            texto: "Você é prático e tem facilidade com consertos. Cursos de elétrica, refrigeração ou mecânica vão te dar uma profissão rápida e muito requisitada!"
        },
        tecnologia: {
            titulo: "💻 Seu Perfil é: Tecnologia & Gestão!",
            texto: "Você se dá bem com telas e organização. Os caminhões de informática básica e rotinas administrativas vão abrir portas em escritórios e comércio para você."
        }
    };

    tituloRef.innerText = mensagens[categoriaVencedora].titulo;
    textoRef.innerText = mensagens[categoriaVencedora].texto;
}

// 7. 🔴 ENVIO REAL PARA O BANCO DE DADOS 🔴
btnSalvarLead.addEventListener('click', async () => {
    // Coleta os dados digitados
    const nome = document.getElementById('leadNome').value;
    const whatsapp = document.getElementById('leadWhatsapp').value;
    const email = document.getElementById('leadEmail').value;
    const regiao = document.getElementById('leadRegiao').value;
    
    // Descobre qual foi o perfil vencedor novamente
    const perfil = Object.keys(pontuacao).reduce((a, b) => pontuacao[a] > pontuacao[b] ? a : b);

    if (nome && whatsapp && email && regiao) {
        try {
            // Manda o POST para o server.js
            const res = await fetch('/api/interessados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, whatsapp, email, regiao, perfil })
            });
            
            if (res.ok) {
                alert(`🎉 Perfeito, ${nome}! Seus dados foram salvos. Vamos te avisar assim que a carreta chegar na sua região!`);
                quizModal.style.display = 'none'; // Fecha o modal
                
                // Limpa os campos para a próxima pessoa
                document.getElementById('leadNome').value = '';
                document.getElementById('leadWhatsapp').value = '';
                document.getElementById('leadEmail').value = '';
                document.getElementById('leadRegiao').value = '';
            } else {
                alert('Erro ao salvar no banco de dados. Tente novamente.');
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            alert('Falha na comunicação com o servidor.');
        }
    } else {
        alert('⚠️ Por favor, preencha todos os campos para ser avisado!');
    }
});