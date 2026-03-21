/* =========================================================
   VARIÁVEL GLOBAL PARA O GRÁFICO
   Índices: 0=Gastronomia, 1=Tecnologia, 2=Beleza, 3=Manutenção
========================================================= */
let contagemGrafico = [0, 0, 0, 0];

/* =========================================================
   1. CARREGAR DADOS DO BANCO (Tabela, Gráfico e Automação)
========================================================= */
async function carregarInteressados() {
    try {
        // 1. Primeiro, buscamos os CURSOS ATIVOS no banco
        const resCursos = await fetch('/cursos');
        const todosCursos = await resCursos.json();
        // Filtramos apenas os cursos que não estão esgotados
        const cursosAtivos = todosCursos.filter(c => c.status !== 'esgotado');

        // 2. Agora, buscamos a FILA DE INTERESSADOS (Leads)
        const resLeads = await fetch('/api/interessados');
        const dados = await resLeads.json();
        
        const tbody = document.querySelector('.tabela-admin tbody');
        tbody.innerHTML = '';

        contagemGrafico = [0, 0, 0, 0]; // Zera gráfico

        if (dados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Nenhum interessado ainda.</td></tr>';
            return;
        }
        
        dados.forEach(lead => {
            // Conta os perfis para o Gráfico
            const perfilBusca = (lead.perfil_curso || '').toLowerCase();
            if (perfilBusca === 'gastronomia') contagemGrafico[0]++;
            else if (perfilBusca === 'tecnologia') contagemGrafico[1]++;
            else if (perfilBusca === 'beleza') contagemGrafico[2]++;
            else if (perfilBusca === 'manutencao') contagemGrafico[3]++;

            // =========================================================
            // A MÁGICA DA AUTOMAÇÃO AQUI 🪄
            // Verifica se existe algum curso ativo da mesma categoria do Lead
            // =========================================================
// =========================================================
            // A MÁGICA DA AUTOMAÇÃO COM MAPEAMENTO AVANÇADO 🧠🪄
            // =========================================================
            
            // Ensinando o sistema a associar os 4 perfis do Quiz com as suas 38 categorias reais do banco
            const mapaCategorias = {
                'gastronomia': [
                    'gastronomia', 'panificação / confeitaria', 'eventos', 'turismo / hotelaria'
                ],
                'beleza': [
                    'beleza', 'estética', 'moda', 'confecção', 'artesanato'
                ],
                'manutencao': [
                    'manutenção', 'mecânica', 'eletricista / energia', 'eletrônica', 
                    'automação industrial', 'soldagem', 'construção civil / serviço', 
                    'segurança do trabalho', 'meio ambiente'
                ],
                'tecnologia': [
                    'informática / tecnologia', 'programação / ti', 'redes / telecom', 
                    'administração', 'gestão', 'comércio / gestão empresarial', 
                    'recursos humanos', 'logística', 'vendas / marketing'
                ]
            };

            // Pega a lista de categorias que batem com o perfil que o cara tirou no quiz
            // (Se o perfil for 'gastronomia', ele pega o array de gastronomia ali de cima)
            const categoriasValidasProLead = mapaCategorias[perfilBusca] || [perfilBusca];

            const temVagaAberta = cursosAtivos.some(curso => {
                const categoriaCurso = (curso.categoria || '').toLowerCase();
                const nomeCurso = (curso.nome || '').toLowerCase();
                
                // O sistema verifica se a categoria do curso que você abriu está dentro da lista mapeada do aluno
                const matchCategoria = categoriasValidasProLead.some(cat => categoriaCurso.includes(cat));
                
                // E também verifica se, por acaso, a palavra chave está no nome do curso
                const matchNome = nomeCurso.includes(perfilBusca);

                return matchCategoria || matchNome;
            });

            // Configura a "etiqueta" de status
            let classeStatus = '';
            let textoStatus = '';

            if (lead.status === 'enviado') {
                classeStatus = 'enviado';
                textoStatus = '✅ Mensagem enviada';
            } else if (temVagaAberta) {
                // Se não foi enviado AINDA e tem curso aberto, alerta o Admin!
                classeStatus = 'disponivel'; 
                textoStatus = '🚨 Curso Disponível!';
            } else {
                // Se não tem curso aberto pra ele, fica aguardando
                classeStatus = 'aguardando';
                textoStatus = '⏳ Aguardando Vaga';
            }
            
            // Limpa o número para o link do zap
            const foneLimpo = lead.whatsapp.replace(/\D/g, '');

            // Formatação do nome da categoria com a primeira letra maiúscula
            const perfilCapitalizado = lead.perfil_curso.charAt(0).toUpperCase() + lead.perfil_curso.slice(1);

            tbody.innerHTML += `
                <tr>
                    <td><strong>${lead.nome}</strong></td>
                    <td>${lead.whatsapp}</td>
                    <td style="text-transform: capitalize;">${lead.regiao.replace('_', ' ')}</td>
                    <td>${perfilCapitalizado}</td>
                    <td>
                        <button class="status ${classeStatus}" onclick="mudarStatusBanco(this, ${lead.id})">
                            ${textoStatus}
                        </button>
                    </td>
                    <td>
                        <a href="https://wa.me/55${foneLimpo}" target="_blank" class="btn-whats">💬 Chamar</a>
                    </td>
                </tr>
            `;
        });
    } catch (e) { 
        console.error("Erro ao carregar dados:", e); 
        document.querySelector('.tabela-admin tbody').innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Erro ao carregar banco de dados.</td></tr>';
    }
}

/* =========================================================
   2. MUDAR STATUS E SALVAR NO BANCO
========================================================= */
async function mudarStatusBanco(botao, id) {
    // Se o botão for "Mensagem enviada", volta pro sistema automático
    const estaEnviado = botao.classList.contains('enviado');
    const novoStatus = estaEnviado ? 'aguardando' : 'enviado';
    
    // Atualiza visualmente na hora (o "aguardando" depois será recalculado na próx vez q carregar a tela)
    if (novoStatus === 'enviado') {
        botao.className = "status enviado";
        botao.innerText = "✅ Mensagem enviada";
    } else {
        botao.className = "status aguardando";
        botao.innerText = "⏳ Recalculando...";
    }

    // Salva no banco de dados
    try {
        await fetch(`/api/interessados/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });
        
        // Recarrega a tabela para a automação cruzar os dados de novo
        if(novoStatus !== 'enviado') carregarInteressados();
        
    } catch(err) {
        alert("Erro ao conectar com o servidor para salvar o status.");
    }
}

/* =========================================================
   3. LÓGICA DO GRÁFICO (CHART.JS)
========================================================= */
let meuGrafico;

function inicializarGrafico(tipo) {
    const ctx = document.getElementById('graficoDemanda').getContext('2d');
    if (meuGrafico) meuGrafico.destroy();

    meuGrafico = new Chart(ctx, {
        type: tipo,
        data: {
            labels: ['Gastronomia 🍰', 'Tecnologia 💻', 'Beleza ✂️', 'Manutenção 🔧'],
            datasets: [{
                label: 'Número de Interessados (Demanda Real)',
                data: contagemGrafico, 
                backgroundColor: ['rgba(214, 34, 64, 0.7)', 'rgba(15, 34, 71, 0.7)', 'rgba(249, 200, 82, 0.7)', 'rgba(153, 153, 153, 0.7)'],
                borderColor: ['#D62240', '#0f2247', '#f9c852', '#999999'],
                borderWidth: 2,
                tension: 0.3 
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

function mudarTipoGrafico(tipo) {
    document.getElementById('btnBarra').classList.remove('ativo');
    document.getElementById('btnLinha').classList.remove('ativo');
    if(tipo === 'bar') document.getElementById('btnBarra').classList.add('ativo');
    if(tipo === 'line') document.getElementById('btnLinha').classList.add('ativo');
    inicializarGrafico(tipo);
}

function abrirModalGrafico() {
    document.getElementById('modalGrafico').style.display = 'flex';
    mudarTipoGrafico('bar'); 
}
function fecharModalGrafico() { document.getElementById('modalGrafico').style.display = 'none'; }

// Iniciar a Página
carregarInteressados();