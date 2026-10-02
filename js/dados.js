/* =========================================================
   LAR VIRA-LATA — EDITE AQUI
   Tudo que aparece no site sai deste arquivo.
   ========================================================= */

/* ---------- PIX ----------
   chave:  sua chave Pix (CPF, e-mail, celular com +55, ou aleatória)
   nome:   nome do titular, sem acento (máx. 25 letras)
   cidade: cidade do titular, sem acento (máx. 15 letras)
   valores: sugestões de apoio mensal em reais (0 = valor livre)          */
const PIX = {
  chave: "larviralata@gmail.com",
  nome: "MARCELLA PEREIRA DA SILVA",
  cidade: "RIO DE JANEIRO",
  valores: [20, 50, 100, 0],
};

/* ---------- CONTATO (deixe "" para esconder) ---------- */
const CONTATO = {
  instagram: "",   // ex.: "larviralata"  (sem @)
  whatsapp: "",    // ex.: "5511999999999" (só números, com 55 + DDD)
  email: "",
};

/* ---------- TOTAL DE RESGATADOS ----------
   Só o número. As fotos da galeria vêm de js/fotos.js
   (rode "python atualizar-fotos.py" depois de colocar fotos novas na pasta "fotos"). */
const TOTAL_ANIMAIS = 18;

/* ---------- FOTO DE CAPA (topo do site) ----------
   Uma foto de vocês dois com a turma, se tiver. "" para esconder. */
const FOTO_CAPA = "fotos/web/20260831_080029.jpg";
