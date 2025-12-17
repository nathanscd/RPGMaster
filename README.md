# RPGMaster - Gerenciador de Fichas

Um sistema de gerenciamento de personagens para RPG inspirado no universo de **Ordem Paranormal**. O projeto foca em uma interface neon, sombria e funcional para facilitar a vida de mestres e jogadores.

---

## 🚀 Funcionalidades

* **Dashboard de Agentes**: Visualização organizada de todos os personagens recrutados.
* **Ficha Completa**: Controle de atributos, recursos (Vida, PE, Sanidade) e perícias.
* **Rolo de Dados Inteligente**:
* Dados Livres com animação de "shake" e pré-configuração.
* Rolagem direta de perícias, armas e rituais.


* **Inventário Dinâmico**: Adicione itens do catálogo ou crie itens personalizados com peso automático.
* **Persistência Fullstack**: Backend em Node.js com banco de dados JSON.

---

## 🛠️ Tecnologias Utilizadas

### Frontend

* **React + Vite** (Fast Refresh e Performance)
* **Tailwind CSS** (Estilização baseada em utilitários)
* **Lucide React** (Ícones)
* **Axios** (Comunicação com API)

### Backend

* **Node.js + Express**
* **LowDB** (Banco de dados JSON local/efêmero)
* **CORS** (Segurança de acesso)

---

## 📦 Como Rodar o Projeto

### 1. Clonar o Repositório

```bash
git clone https://github.com/nathanscd/RPGMaster.git
cd RPGMaster

```

### 2. Configurar o Backend

```bash
cd backend
npm install
node server.js

```

*O servidor rodará em `http://localhost:3001*`

### 3. Configurar o Frontend

Abra um novo terminal na pasta raiz:

```bash
npm install
npm run dev

```

*O site abrirá em `http://localhost:5173*`

---

## 🌐 Deploy (Produção)

Este projeto foi estruturado para ser hospedado nas seguintes plataformas:

* **Backend**: Render (Web Service com porta dinâmica).
* **Frontend**: Vercel (Configurado com variáveis de ambiente `VITE_API_URL`).

> **Nota**: No ambiente de produção, certifique-se de configurar a `VITE_API_URL` apontando para a URL gerada pelo Render.

---

## 📄 Licença

Este projeto é para uso pessoal e de fãs. Todos os direitos sobre a marca *Ordem Paranormal* pertencem aos seus respectivos criadores.