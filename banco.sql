DROP DATABASE IF EXISTS portal_cursos;
CREATE DATABASE portal_cursos;
USE portal_cursos;

-- 🟦 Idades
CREATE TABLE filtro_idade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idade INT
);

-- 🟧 Categorias
CREATE TABLE filtro_categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(100)
);

-- 🟩 Modalidades
CREATE TABLE filtro_modalidade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modalidade VARCHAR(100)
);

-- 🟨 Locais
CREATE TABLE filtro_local (
    id INT AUTO_INCREMENT PRIMARY KEY,
    local VARCHAR(100)
);

-- 🟪 Nomes de Curso (PRECISA vir ANTES dos cursos)
CREATE TABLE filtro_nome (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 👨‍💼 Usuários ADMIN
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE,
    senha VARCHAR(255)
);

-- 🎓 Tabela de Cursos
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nome_id INT,
    descricao TEXT,
    vagas INT DEFAULT 0,
    status ENUM('ativo', 'esgotado') DEFAULT 'ativo',

    categoria_id INT,
    idade_min INT,
    idade_max INT,

    modalidade_id INT,
    local_id INT,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX(nome_id),
    INDEX(categoria_id),
    INDEX(modalidade_id),
    INDEX(local_id),

    FOREIGN KEY (nome_id) REFERENCES filtro_nome(id),
    FOREIGN KEY (categoria_id) REFERENCES filtro_categoria(id),
    FOREIGN KEY (modalidade_id) REFERENCES filtro_modalidade(id),
    FOREIGN KEY (local_id) REFERENCES filtro_local(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
ALTER TABLE cursos 
MODIFY modalidade_id INT NULL;
ALTER TABLE cursos 
MODIFY categoria_id INT NULL,
MODIFY local_id INT NULL;


-- 📝 Pré-inscrições
CREATE TABLE pre_inscricoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    curso_id INT NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
ALTER TABLE pre_inscricoes
ADD COLUMN curso_nome VARCHAR(150) NOT NULL AFTER curso_id;


-- 🔢 Idades automáticas (10 a 81)
INSERT INTO filtro_idade (idade)
SELECT seq
FROM seq_1_to_100 AS s
WHERE seq BETWEEN 10 AND 81;




INSERT INTO filtro_categoria (categoria) VALUES
('Administração'),
('Artesanato'),
('AUTOMAÇÃO INDUSTRIAL'),
('Beleza'),
('Cinema'),
('Comércio / Gestão Empresarial'),
('Confecção'),
('Construção Civil / Serviço'),
('Cultura'),
('Dança'),
('Dança e Teatro'),
('Educação'),
('Eletrônica'),
('Eletricista / Energia'),
('Enfermagem / Saúde'),
('Estética'),
('Eventos'),
('Fotografia'),
('Gastronomia'),
('Gestão'),
('Idiomas'),
('Informática / Tecnologia'),
('Logística'),
('Manutenção'),
('Mecânica'),
('Meio Ambiente'),
('Moda'),
('Música'),
('Panificação / Confeitaria'),
('Produção Cultural'),
('Programação / TI'),
('Recursos Humanos'),
('Redes / Telecom'),
('Segurança do Trabalho'),
('Serviço Social'),
('Soldagem'),
('Turismo / Hotelaria'),
('Vendas / Marketing');
INSERT INTO filtro_nome (nome) VALUES
('Administração'),
('Artesanato'),
('AUTOMAÇÃO INDUSTRIAL'),
('Beleza'),
('Cinema'),
('Comércio / Gestão Empresarial'),
('Confecção'),
('Construção Civil / Serviço'),
('Cultura'),
('Dança'),
('Dança e Teatro'),
('Educação'),
('Eletrônica'),
('Eletricista / Energia'),
('Enfermagem / Saúde'),
('Estética'),
('Eventos'),
('Fotografia'),
('Gastronomia'),
('Gestão'),
('Idiomas'),
('Informática / Tecnologia'),
('Logística'),
('Manutenção'),
('Mecânica'),
('Meio Ambiente'),
('Moda'),
('Música'),
('Panificação / Confeitaria'),
('Produção Cultural'),
('Programação / TI'),
('Recursos Humanos'),
('Redes / Telecom'),
('Segurança do Trabalho'),
('Serviço Social'),
('Soldagem'),
('Turismo / Hotelaria'),
('Vendas / Marketing');
INSERT INTO filtro_modalidade (modalidade) VALUES
('Administração'),
('Artesanato'),
('AUTOMAÇÃO INDUSTRIAL'),
('Beleza'),
('Cinema'),
('Comércio / Gestão Empresarial'),
('Confecção'),
('Construção Civil / Serviço'),
('Cultura'),
('Dança'),
('Dança e Teatro'),
('Educação'),
('Eletrônica'),
('Eletricista / Energia'),
('Enfermagem / Saúde'),
('Estética'),
('Eventos'),
('Fotografia'),
('Gastronomia'),
('Gestão'),
('Idiomas'),
('Informática / Tecnologia'),
('Logística'),
('Manutenção'),
('Mecânica'),
('Meio Ambiente'),
('Moda'),
('Música'),
('Panificação / Confeitaria'),
('Produção Cultural'),
('Programação / TI'),
('Recursos Humanos'),
('Redes / Telecom'),
('Segurança do Trabalho'),
('Serviço Social'),
('Soldagem'),
('Turismo / Hotelaria'),
('Vendas / Marketing');
INSERT INTO filtro_local (local) VALUES
('Administração Regional da Praia do Canto'),
('Academia Popular de Santa Martha'),
('Andorinhas'),
('Área de Lazer e Eventos de Jardim Camburi'),
('Bairro da Penha'),
('Bento Ferreira'),
('Bonfim'),
('Caratoíra'),
('Carreta de Eletricidade (Local itinerante - consultar curso específico)'),
('Carreta de Informática (Local itinerante - consultar curso específico)'),
('Carreta de Refrigeração e Climatização (Local itinerante - consultar curso específico)'),
('Centro de Formação Profissional do Senac Vitória'),
('Centro de Referência da Assistência Social (CRAS) Jucutuquara'),
('Centro de Referência da Assistência Social (CRAS) São Pedro V'),
('Centro de Referência para a Juventude (CRJ) Andorinhas'),
('Comunidade de Piedade'),
('Horto de Maruípe'),
('Ilha de Santa Maria'),
('Jardim Camburi'),
('Jardim da Penha'),
('Mata da Praia'),
('Mário Cypreste'),
('Parque Moscoso'),
('Praça do Hi-Fi'),
('Residencial Santo André'),
('SENAI Cícero Freire'),
('SENAI Porto de Santana'),
('Santa Martha'),
('Santos Dumont'),
('São Benedito');

select*from cursos;
select*from pre_inscricoes;
