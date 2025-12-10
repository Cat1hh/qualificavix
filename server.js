const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const ngrok = require("ngrok"); // OK aqui

const app = express();
app.use(cors());
app.use(express.json());

// Servir frontend
app.use(express.static(path.join(__dirname, "public")));

async function start() {

    // ======================================
    // MYSQL
    // ======================================
    const db = await mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "portal_cursos",
        waitForConnections: true,
        connectionLimit: 10
    });

    // ======================================
    // EMAIL
    // ======================================
    const mailer = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "vixzinho5@gmail.com",
            pass: "jyftlpujsqcvurlk"
        }
    });

    const tabelas = {
        nome: "filtro_nome",
        idade: "filtro_idade",
        categoria: "filtro_categoria",
        modalidade: "filtro_modalidade",
        local: "filtro_local"
    };

    // ============================================================
    // FILTROS
    // ============================================================
    app.get("/public/:tipo", async (req, res) => {
        try {
            const tabela = tabelas[req.params.tipo];
            if (!tabela) return res.status(400).json({ error: "Filtro inválido" });

            const [rows] = await db.query(`SELECT * FROM ${tabela} ORDER BY id ASC`);
            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao buscar filtro" });
        }
    });

    // ============================================================
    // LISTAR CURSOS
    // ============================================================
    app.get("/cursos", async (req, res) => {
        try {
            const { id } = req.query;

            const where = id ? "WHERE c.id = ?" : "";
            const params = id ? [id] : [];

            const [rows] = await db.query(`
                SELECT 
                    c.id, fn.nome AS nome, c.descricao, c.vagas, c.status,
                    fc.categoria, fiMin.idade AS idade_min, fiMax.idade AS idade_max,
                    fm.modalidade, fl.local, c.criado_em
                FROM cursos c
                LEFT JOIN filtro_nome fn ON fn.id = c.nome_id
                LEFT JOIN filtro_categoria fc ON fc.id = c.categoria_id
                LEFT JOIN filtro_idade fiMin ON fiMin.id = c.idade_min
                LEFT JOIN filtro_idade fiMax ON fiMax.id = c.idade_max
                LEFT JOIN filtro_modalidade fm ON fm.id = c.modalidade_id
                LEFT JOIN filtro_local fl ON fl.id = c.local_id
                ${where}
                ORDER BY c.id DESC
            `, params);

            res.json(rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao listar cursos" });
        }
    });

    // ============================================================
    // CURSO POR ID
    // ============================================================
    app.get("/curso/:id", async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT 
                    c.id, fn.nome AS nome, c.descricao, c.vagas, c.status,
                    fc.categoria, fiMin.idade AS idade_min, fiMax.idade AS idade_max,
                    fm.modalidade, fl.local, c.criado_em
                FROM cursos c
                LEFT JOIN filtro_nome fn ON fn.id = c.nome_id
                LEFT JOIN filtro_categoria fc ON fc.id = c.categoria_id
                LEFT JOIN filtro_idade fiMin ON fiMin.id = c.idade_min
                LEFT JOIN filtro_idade fiMax ON fiMax.id = c.idade_max
                LEFT JOIN filtro_modalidade fm ON fm.id = c.modalidade_id
                LEFT JOIN filtro_local fl ON fl.id = c.local_id
                WHERE c.id = ?
                LIMIT 1
            `, [req.params.id]);

            if (!rows.length) {
                return res.status(404).json({ error: "Curso não encontrado" });
            }

            res.json(rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao buscar curso" });
        }
    });

    // ============================================================
    // CRIAR CURSO
    // ============================================================
    app.post("/cursos", async (req, res) => {
        try {
            const { nome, descricao, vagas, categoria, idade_min, idade_max, modalidade, local } = req.body;

            if (!nome) {
                return res.status(400).json({ error: "Campo 'nome' é obrigatório." });
            }

            await db.query(`
                INSERT INTO cursos 
                (nome_id, descricao, vagas, categoria_id, idade_min, idade_max, modalidade_id, local_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                nome,
                descricao || "",
                vagas || 0,
                categoria || null,
                idade_min,
                idade_max,
                modalidade || null,
                local || null
            ]);

            res.json({ status: "curso criado" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao criar curso" });
        }
    });

    // ============================================================
    // ESGOTAR CURSO
    // ============================================================
    app.put("/cursos/esgotar/:id", async (req, res) => {
        try {
            await db.query(`UPDATE cursos SET status = 'esgotado' WHERE id = ?`, [req.params.id]);
            res.json({ status: "curso esgotado" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao atualizar status" });
        }
    });

    // ============================================================
    // INSCRIÇÃO
    // ============================================================
    app.post("/inscricao", async (req, res) => {
        try {
            const { nome, email, telefone, curso_id } = req.body;

            const [curso] = await db.query(`SELECT vagas, status FROM cursos WHERE id = ?`, [curso_id]);

            if (!curso.length) return res.status(404).json({ error: "Curso não encontrado" });

            const vagas = curso[0].vagas;

            if (vagas <= 0) return res.json({ error: "Vagas esgotadas" });

            await db.query(`
                INSERT INTO pre_inscricoes (nome, email, telefone, curso_id)
                VALUES (?, ?, ?, ?)
            `, [nome, email, telefone, curso_id]);

            const novasVagas = vagas - 1;

            await db.query(
                `UPDATE cursos SET vagas = ?, status = ? WHERE id = ?`,
                [novasVagas, novasVagas === 0 ? "esgotado" : "ativo", curso_id]
            );

            res.json({
                status: "ok",
                msg: "Inscrição realizada com sucesso",
                vagas_restantes: novasVagas
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro no servidor" });
        }
    });

    // ============================================================
    // CHATBOT
    // ============================================================
    app.post("/chat", async (req, res) => {
        try {
            let text = (req.body.message || "")
                .toString()
                .trim()
                .toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (!text) {
                return res.json({ reply: "Diga algo como: 'curso 5', 'vagas', 'locais', 'lista de cursos'." });
            }

            const has = words => words.some(w => text.includes(w));
            const matchId = text.match(/curso\s*(\d+)/) || text.match(/id\s*(\d+)/);

            if (matchId) {
                const id = matchId[1];

                const [rows] = await db.query(`
                    SELECT c.id, fn.nome, c.descricao, c.vagas, c.status,
                           fl.local, fm.modalidade
                    FROM cursos c
                    LEFT JOIN filtro_nome fn ON fn.id = c.nome_id
                    LEFT JOIN filtro_local fl ON fl.id = c.local_id
                    LEFT JOIN filtro_modalidade fm ON fm.id = c.modalidade_id
                    WHERE c.id = ?
                `, [id]);

                if (!rows.length) return res.json({ reply: "Curso não encontrado." });

                const c = rows[0];

                return res.json({
                    reply:
`📘 *${c.nome}*
${c.descricao ? "📝 " + c.descricao : ""}
📍 Local: ${c.local}
🏫 Modalidade: ${c.modalidade}
👥 Vagas: ${c.vagas} — ${c.status}`
                });
            }

            if (has(["vaga", "vagas", "disponivel", "tem vaga"])) {
                const [rows] = await db.query(`SELECT SUM(vagas) AS total FROM cursos WHERE status = 'ativo'`);
                const total = rows[0].total || 0;
                return res.json({ reply: `Atualmente temos *${total} vagas disponíveis*.` });
            }

            if (has(["curso", "cursos", "lista", "catalogo", "mostrar cursos"])) {
                const [rows] = await db.query(`
                    SELECT c.id, fn.nome, c.vagas, c.status, fl.local
                    FROM cursos c
                    LEFT JOIN filtro_nome fn ON fn.id = c.nome_id
                    LEFT JOIN filtro_local fl ON fl.id = c.local_id
                `);

                const lista = rows
                    .map(r => `📘 ${r.id} — ${r.nome}\n📍 Local: ${r.local}\n👥 ${r.vagas} vagas — ${r.status}\n`)
                    .join("\n");

                return res.json({ reply: lista });
            }

            return res.json({
                reply:
`Não entendi 😅  
Tente perguntar:

• "curso 12"
• "vagas"
• "lista de cursos"
• "praia do canto"`
            });

        } catch (err) {
            console.error(err);
            return res.json({ reply: "Erro ao processar mensagem." });
        }
    });

    // ============================================================
    // SPA FALLBACK
    // ============================================================
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    // ============================================================
    // START SERVER + NGROK
    // ============================================================
    const PORT = 3000;
    app.listen(PORT, async () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);

        try {
            const url = await ngrok.connect({
                addr: PORT,
                proto: "http",
                authtoken: "36fMrhnvEmY4k9J4GQMufuRjxcy_5vCurTfwYaey1tdKqQCV5"
            });

            console.log(`🌍 NGROK ONLINE: ${url}`);
        } catch (err) {
            console.log("❌ Erro ao iniciar NGROK:", err);
        }
    });
}

start();