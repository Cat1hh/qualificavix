/* =========================================================
   SISTEMA MESTRE-DETALHE (REAL COM BANCO DE DADOS)
========================================================= */

let cursosGlobais = []; 
let cursoAbertoAtual = null; 
let alunosGlobais = []; // NOVO: Guarda a lista de alunos daquele curso

/* =========================================================
   1. FUNÇÃO PARA BUSCAR E DESENHAR OS CURSOS (TELA 1)
========================================================= */
async function carregarCursos() {
    try {
        const res = await fetch('/cursos'); 
        cursosGlobais = await res.json();

        const tbody = document.getElementById('tabelaCursosBody');
        tbody.innerHTML = '';

        if (cursosGlobais.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">Nenhum curso cadastrado.</td></tr>`;
            return;
        }

        cursosGlobais.forEach(curso => {
            const estaEsgotado = (curso.status === 'esgotado');
            const statusHtml = estaEsgotado 
                ? '<span class="badge esgotado">ESGOTADO</span>' 
                : '<span class="badge aberto">ABERTO</span>';

            tbody.innerHTML += `
                <tr>
                    <td><strong>${curso.nome}</strong></td>
                    <td>${curso.local}</td>
                    <td>${curso.vagas} restantes</td>
                    <td>${statusHtml}</td>
                    <td>
                        <button onclick="abrirListaAlunos(${curso.id})" class="btn-acao btn-ver">👥 Ver Lista</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Erro ao carregar cursos:", err);
        document.getElementById('tabelaCursosBody').innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">Erro ao conectar com o banco.</td></tr>`;
    }
}

/* =========================================================
   2. FUNÇÃO PARA BUSCAR E DESENHAR OS ALUNOS (TELA 2)
========================================================= */
async function abrirListaAlunos(idCurso) {
    cursoAbertoAtual = cursosGlobais.find(c => c.id === idCurso);

    document.getElementById('tituloCursoDetalhe').innerText = cursoAbertoAtual.nome;
    document.getElementById('localCursoDetalhe').innerText = cursoAbertoAtual.local;
    document.getElementById('vagasCursoDetalhe').innerText = `${cursoAbertoAtual.vagas} vagas restantes`;

    const tbody = document.getElementById('tabelaAlunosBody');
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Buscando alunos... 🐢</td></tr>`;

    document.getElementById('telaCursos').classList.add('tela-oculta');
    document.getElementById('telaAlunos').classList.remove('tela-oculta');

    try {
        const res = await fetch(`/inscritos/${idCurso}`);
        alunosGlobais = await res.json(); // Salva os alunos na memória para a ficha

        tbody.innerHTML = ''; 

        if (alunosGlobais.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Nenhum aluno inscrito ainda.</td></tr>`;
        } else {
            alunosGlobais.forEach(aluno => {
                const bairroAluno = aluno.bairro || 'Não informado';
                const foneLimpo = (aluno.telefone || '').replace(/\D/g, '');

                tbody.innerHTML += `
                    <tr>
                        <td><strong>${aluno.nome}</strong></td>
                        <td>${aluno.cpf || '-'}</td>
                        <td>${aluno.telefone || '-'}</td>
                        <td>${bairroAluno}</td>
                        <td style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button onclick="abrirFichaAluno(${aluno.id})" class="btn-acao" style="background: #3b82f6;">📄 Ver Ficha</button>
                            <a href="https://wa.me/55${foneLimpo}" target="_blank" class="btn-acao btn-whats">💬 Whats</a>
                            <button onclick="excluirAluno(${aluno.id}, '${aluno.nome}')" class="btn-acao btn-excluir">❌ Excluir</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error("Erro ao buscar alunos:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">Erro ao carregar lista de alunos.</td></tr>`;
    }
}

/* =========================================================
   3. SISTEMA DA FICHA COMPLETA DO ALUNO (MODAL)
========================================================= */
function abrirFichaAluno(idAluno) {
    // Procura o aluno na lista global
    const aluno = alunosGlobais.find(a => a.id === idAluno);
    if (!aluno) return;

    const conteudo = document.getElementById('conteudoDetalhes');
    
    // Função auxiliar para evitar "null" na tela
    const checar = (valor) => valor ? valor : '<em style="color:#64748b">Não inf.</em>';

    // Monta a grade com os detalhes organizados
    conteudo.innerHTML = `
        <div class="detalhe-secao">👤 Dados Pessoais</div>
        <div class="detalhe-item"><span>Nome Completo</span><strong>${checar(aluno.nome)}</strong></div>
        <div class="detalhe-item"><span>Nome Social</span><strong>${checar(aluno.nome_social)}</strong></div>
        <div class="detalhe-item"><span>CPF</span><strong>${checar(aluno.cpf)}</strong></div>
        <div class="detalhe-item"><span>RG</span><strong>${checar(aluno.rg)} - ${checar(aluno.uf_rg)}</strong></div>
        <div class="detalhe-item"><span>Nascimento</span><strong>${checar(aluno.data_nascimento)}</strong></div>
        <div class="detalhe-item"><span>Escolaridade</span><strong>${checar(aluno.escolaridade)}</strong></div>
        <div class="detalhe-item"><span>Sexo / Orientação</span><strong>${checar(aluno.sexo)} / ${checar(aluno.orientacao_sexual)}</strong></div>
        <div class="detalhe-item"><span>Raça/Cor / Religião</span><strong>${checar(aluno.raca_cor)} / ${checar(aluno.religiosidade)}</strong></div>
        
        <div class="detalhe-secao">📞 Contato & Endereço</div>
        <div class="detalhe-item"><span>E-mail</span><strong>${checar(aluno.email)}</strong></div>
        <div class="detalhe-item"><span>Celular Principal</span><strong>${checar(aluno.telefone)}</strong></div>
        <div class="detalhe-item"><span>CEP</span><strong>${checar(aluno.cep)}</strong></div>
        <div class="detalhe-item"><span>Endereço</span><strong>${checar(aluno.rua)}, Nº ${checar(aluno.numero)} - ${checar(aluno.bairro)}</strong></div>
        <div class="detalhe-item"><span>Complemento / Ref.</span><strong>${checar(aluno.complemento)} / ${checar(aluno.ponto_referencia)}</strong></div>
        <div class="detalhe-item"><span>Mora/Trabalha em Vitória?</span><strong>${aluno.mora_vitoria === 'sim' ? '✅ Sim' : '❌ Não'}</strong></div>

        <div class="detalhe-secao">♿ Deficiências & Autorizações</div>
        <div class="detalhe-item"><span>Possui Deficiência?</span><strong>${aluno.tem_def === 'sim' ? '⚠️ Sim' : 'Nenhuma'}</strong></div>
        <div class="detalhe-item"><span>Quais Deficiências:</span><strong>${checar(aluno.deficiencias)}</strong></div>
        <div class="detalhe-item" style="grid-column: 1 / -1;"><span>Autoriza Uso de Imagem?</span><strong>${aluno.imagem_autorizada === 'sim' ? '📸 Sim' : '🚫 Não autorizada'}</strong></div>
    `;

    // Mostra a janela preta
    document.getElementById('modalDetalhes').style.display = 'flex';
}

function fecharModalDetalhes() {
    document.getElementById('modalDetalhes').style.display = 'none';
}


/* =========================================================
   4. VOLTAR PARA CURSOS E EXCLUIR
========================================================= */
function voltarParaCursos() {
    document.getElementById('telaAlunos').classList.add('tela-oculta');
    document.getElementById('telaCursos').classList.remove('tela-oculta');
    carregarCursos();
}

async function excluirAluno(idAluno, nomeAluno) {
    const confirmacao2 = confirm(`⚠️ Tem certeza? Isso vai excluir ${nomeAluno} e LIBERAR UMA VAGA automaticamente.`);
    
    if (confirmacao2) {
        try {
            const res = await fetch(`/api/inscricoes/${idAluno}`, { method: 'DELETE' });
            if (res.ok) {
                alert(`✅ Inscrição removida! Vaga devolvida.`);
                abrirListaAlunos(cursoAbertoAtual.id);
            } else {
                alert("Erro ao tentar excluir no banco de dados.");
            }
        } catch (err) {
            alert("Falha na comunicação com o servidor.");
        }
    }
}

carregarCursos();