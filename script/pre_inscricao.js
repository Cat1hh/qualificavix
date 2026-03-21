document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================================
    // 1. TRAVA DE SEGURANÇA (VERIFICA SE TEM CURSO NA URL)
    // =========================================================
    const urlParams = new URLSearchParams(window.location.search);
    const cursoId = urlParams.get('id');

    if (!cursoId) {
        alert("⚠️ Atenção: Você precisa selecionar um curso primeiro!");
        window.location.href = "index.html"; // Manda de volta pra tela inicial
        return;
    }

    // =========================================================
    // 2. TRAVA DE DEFICIÊNCIA (BLOQUEIA/DESBLOQUEIA CHECKBOXES)
    // =========================================================
    const radiosDeficiencia = document.querySelectorAll('input[name="tem_def"]');
    const checkboxesDeficiencia = document.querySelectorAll('.checkbox-grid input[type="checkbox"]');

    function atualizarDeficiencias() {
        // Verifica qual rádio está selecionado
        const temDeficiencia = document.querySelector('input[name="tem_def"]:checked').value === 'sim';
        
        checkboxesDeficiencia.forEach(box => {
            box.disabled = !temDeficiencia; // Desativa se for NÃO
            if (!temDeficiencia) {
                box.checked = false; // Desmarca tudo se a pessoa mudar pra NÃO
            }
        });
    }

    radiosDeficiencia.forEach(radio => radio.addEventListener('change', atualizarDeficiencias));
    atualizarDeficiencias(); // Roda a primeira vez pra já começar bloqueado

    // =========================================================
    // 3. AVISO DE MUNICÍPIO (MORADORES DE VITÓRIA)
    // =========================================================
    const radiosMoradia = document.querySelectorAll('input[name="mora_vitoria"]');
    
    radiosMoradia.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'nao') {
                alert("ℹ️ Lembrete: Os cursos da Prefeitura de Vitória oferecem prioridade para moradores ou trabalhadores do município. Sua inscrição ficará em lista de espera secundária.");
            }
        });
    });

    // =========================================================
    // 4. MÁSCARAS DE INPUT (CPF, CEP E TELEFONE)
    // =========================================================
    const campoCpf = document.getElementById('cpf');
    const campoTelefone = document.getElementById('telefone');
    const campoCep = document.getElementById('cep');

    if(campoCpf) {
        campoCpf.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g,""); // Tira tudo que não é número
            valor = valor.replace(/(\d{3})(\d)/,"$1.$2");
            valor = valor.replace(/(\d{3})(\d)/,"$1.$2");
            valor = valor.replace(/(\d{3})(\d{1,2})$/,"$1-$2");
            e.target.value = valor;
        });
    }

    if(campoTelefone) {
        campoTelefone.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g,"");
            valor = valor.replace(/^(\d{2})(\d)/g,"($1) $2");
            valor = valor.replace(/(\d)(\d{4})$/,"$1-$2");
            e.target.value = valor;
        });
    }

    if(campoCep) {
        campoCep.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g,"");
            valor = valor.replace(/^(\d{5})(\d)/,"$1-$2");
            e.target.value = valor;
        });
    }

    // =========================================================
    // 5. AUTOCOMPLETAR ENDEREÇO (API VIACEP)
    // =========================================================
    if(campoCep) {
        campoCep.addEventListener('blur', async function() {
            let cepNum = this.value.replace(/\D/g, '');
            
            if (cepNum.length === 8) {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cepNum}/json/`);
                    const data = await response.json();
                    
                    if (!data.erro) {
                        document.getElementById('rua').value = data.logradouro;
                        document.getElementById('bairro').value = data.bairro;
                        // O município já está fixo como Vitória no HTML
                    } else {
                        alert("❌ CEP não encontrado!");
                    }
                } catch (error) {
                    console.error("Erro ao buscar CEP:", error);
                }
            }
        });
    }

    // =========================================================
    // 6. ENVIO DO FORMULÁRIO (CONECTANDO COM O BACKEND)
    // =========================================================
    // =========================================================
    // 6. ENVIO DO FORMULÁRIO (CONECTANDO COM O BACKEND)
    // =========================================================
    const form = document.getElementById('formInscricao');
    
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede a página de recarregar
            
            const btnSubmit = document.querySelector('.btn-confirmar');
            const textoOriginal = btnSubmit.innerHTML;
            btnSubmit.innerHTML = "⏳ Enviando...";
            btnSubmit.disabled = true;

            // Transforma magicamente todos os campos do form em um objeto
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());
            payload.curso_id = cursoId; // Adiciona o ID da URL

            // Junta as deficiências marcadas em um texto só (ex: "Autismo, Surdez")
            const deficiencias = [];
            document.querySelectorAll('.checkbox-grid input[type="checkbox"]:checked').forEach(box => {
                deficiencias.push(box.parentElement.innerText.trim());
            });
            payload.deficiencias = deficiencias.join(", ");

            try {
                const res = await fetch('/inscricao', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const resposta = await res.json();
                
                if (res.ok && !resposta.error) {
                    alert(`✅ Pré-inscrição realizada com sucesso!\n\n${resposta.msg}`);
                    window.location.href = "index.html"; 
                } else {
                    alert(`❌ Erro: ${resposta.error || 'Vagas Esgotadas'}`);
                    btnSubmit.innerHTML = textoOriginal;
                    btnSubmit.disabled = false;
                }
            } catch (err) {
                alert("❌ Erro ao conectar com o servidor. Tente novamente.");
                btnSubmit.innerHTML = textoOriginal;
                btnSubmit.disabled = false;
            }
        });
    
    }
});