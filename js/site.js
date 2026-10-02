(function () {
  const $ = (s) => document.querySelector(s);
  const PATA = '<svg><use href="#pata"/></svg>';

  /* ---------- fotos: carrega e troca por quadrinho se não existir ---------- */
  function semFoto() {
    const d = document.createElement("div");
    d.className = "sem-foto";
    d.innerHTML = PATA;
    return d;
  }

  // miniatura: "fotos/web/x.jpg" -> "fotos/web/mini/x.jpg" (se existir)
  const mini = (src) => src.replace(/([^/]+)$/, "mini/$1");

  function img(src, alt, grande) {
    const i = document.createElement("img");
    i.alt = alt;
    i.loading = "lazy";
    i.decoding = "async";
    let tentouGrande = !!grande;
    i.src = grande ? src : mini(src);
    i.onerror = () => {
      if (!tentouGrande) { tentouGrande = true; i.src = src; }
      else i.replaceWith(semFoto());
    };
    return i;
  }

  // só as fotos que realmente existem na pasta
  const cacheFotos = new Map();
  function fotosValidas(lista) {
    return Promise.all(
      lista.map((src) => {
        if (!cacheFotos.has(src)) {
          cacheFotos.set(src, new Promise((ok) => {
            const t = new Image();
            t.onload = () => ok(true);
            t.onerror = () => ok(false);
            t.src = src;
          }));
        }
        return cacheFotos.get(src).then((existe) => (existe ? src : null));
      })
    ).then((r) => r.filter(Boolean));
  }

  /* ---------- números ---------- */
  $("#nTotal").textContent = TOTAL_ANIMAIS;
  document.querySelectorAll(".n-esp").forEach((d) => (d.hidden = true));
  $(".n-fotos").hidden = false;
  $("#nFotos").textContent = FOTOS.length;
  $(".numeros").classList.add("tres");
  document.querySelector(".selo").textContent = `${TOTAL_ANIMAIS} resgatados · 2 humanos · 1 lar`;

  /* ---------- capa ou mosaico ---------- */
  const heroFoto = $("#heroFoto");
  const mosaico = $("#mosaico");
  FOTOS.slice(0, 9).forEach((src) => {
    const l = document.createElement("div");
    l.className = "ladrilho";
    l.appendChild(img(src, ""));
    mosaico.appendChild(l);
  });
  if (FOTO_CAPA) {
    fotosValidas([FOTO_CAPA]).then((ok) => {
      if (!ok.length) return;
      const c = document.createElement("div");
      c.className = "capa";
      c.appendChild(img(FOTO_CAPA, "Nós e a turma do Lar Vira-Lata", true));
      heroFoto.appendChild(c);
      heroFoto.classList.add("com-capa");
    });
  }

  /* ---------- galeria ---------- */
  const muralGrade = $("#muralGrade");
  fotosValidas(FOTOS).then((ok) => {
    if (!ok.length) { $("#mural").hidden = true; return; }
    ok.forEach((src, k) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", `Ampliar foto ${k + 1}`);
      b.appendChild(img(src, "Foto do dia a dia no Lar Vira-Lata"));
      b.addEventListener("click", () =>
        abrirGaleria({ nome: "Dia a dia no lar", historia: "Um pouco da rotina da turma resgatada.", fotos: ok }, k)
      );
      muralGrade.appendChild(b);
    });
  });

  /* ---------- lightbox ---------- */
  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  let atual = { fotos: [], i: 0 };
  let focoAntes = null;

  function mostrar(i) {
    const n = atual.fotos.length;
    const temFoto = n > 0;
    $("#lbAnt").hidden = $("#lbProx").hidden = n < 2;
    $("#lbCont").hidden = n < 2;
    if (!temFoto) {
      lbImg.hidden = true;
      return;
    }
    atual.i = (i + n) % n;
    lbImg.hidden = false;
    lbImg.src = atual.fotos[atual.i];
    $("#lbCont").textContent = `${atual.i + 1} / ${n}`;
    $("#lbMini").querySelectorAll("button").forEach((b, k) => b.classList.toggle("ativo", k === atual.i));
  }

  function abrirGaleria(a, inicio) {
    focoAntes = document.activeElement;
    $("#lbNome").textContent = a.nome;
    $("#lbHistoria").textContent = a.historia || "";
    lbImg.alt = a.nome;
    lbImg.removeAttribute("src");
    const mini = $("#lbMini");
    mini.innerHTML = "";
    atual = { fotos: [], i: 0 };
    mostrar(0);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    $("#lbFechar").focus();

    fotosValidas(a.fotos || []).then((ok) => {
      atual.fotos = ok;
      if (ok.length > 1) {
        ok.forEach((src, k) => {
          const b = document.createElement("button");
          b.setAttribute("aria-label", `Foto ${k + 1}`);
          b.appendChild(img(src, ""));
          b.addEventListener("click", () => mostrar(k));
          mini.appendChild(b);
        });
      }
      mostrar(inicio || 0);
    });
  }

  function fechar() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (focoAntes) focoAntes.focus();
  }

  $("#lbFechar").addEventListener("click", fechar);
  $("#lbAnt").addEventListener("click", () => mostrar(atual.i - 1));
  $("#lbProx").addEventListener("click", () => mostrar(atual.i + 1));
  $("#lbApoiar").addEventListener("click", fechar);
  lb.addEventListener("click", (e) => { if (e.target === lb) fechar(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") fechar();
    if (e.key === "ArrowLeft") mostrar(atual.i - 1);
    if (e.key === "ArrowRight") mostrar(atual.i + 1);
  });
  // arrastar no celular
  let x0 = null;
  lbImg.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lbImg.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) mostrar(atual.i + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  /* ---------- Pix (BR Code "copia e cola") ---------- */
  const campo = (id, v) => id + String(v.length).padStart(2, "0") + v;
  const limpa = (s, max) => norm(s).replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase().slice(0, max);

  function crc16(str) {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  function pixPayload(valor) {
    let p =
      campo("00", "01") +
      campo("26", campo("00", "br.gov.bcb.pix") + campo("01", PIX.chave.trim())) +
      campo("52", "0000") +
      campo("53", "986") +
      (valor > 0 ? campo("54", valor.toFixed(2)) : "") +
      campo("58", "BR") +
      campo("59", limpa(PIX.nome, 25)) +
      campo("60", limpa(PIX.cidade, 15)) +
      campo("62", campo("05", "LARVIRALATA")) +
      "6304";
    return p + crc16(p);
  }

  let valorAtual = PIX.valores[0] || 0;
  const qrBox = $("#qr");

  function desenharQR() {
    qrBox.innerHTML = "";
    if (typeof QRCode === "undefined") return; // sem internet: fica só o copia e cola
    new QRCode(qrBox, {
      text: pixPayload(valorAtual),
      width: 400,
      height: 400,
      colorDark: "#2A1E14",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.M,
    });
    qrBox.title = "";
  }

  const valores = $("#valores");
  PIX.valores.forEach((v) => {
    const b = document.createElement("button");
    b.className = "valor" + (v === valorAtual ? " ativo" : "");
    b.textContent = v > 0 ? `R$ ${v}` : "Outro";
    b.addEventListener("click", () => {
      valorAtual = v;
      valores.querySelectorAll(".valor").forEach((x) => x.classList.toggle("ativo", x === b));
      desenharQR();
    });
    valores.appendChild(b);
  });

  $("#pixChave").textContent = PIX.chave;
  $("#pixTitular").textContent = `Titular: ${PIX.nome}`;
  desenharQR();

  function copiar(texto, msg) {
    const feito = () => aviso(msg);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(feito, () => copiarVelho(texto, feito));
    } else {
      copiarVelho(texto, feito);
    }
  }
  function copiarVelho(texto, feito) {
    const t = document.createElement("textarea");
    t.value = texto;
    t.style.position = "fixed";
    t.style.opacity = "0";
    document.body.appendChild(t);
    t.select();
    try { document.execCommand("copy"); feito(); } catch (_) { /* nada */ }
    t.remove();
  }

  $("#copiarCodigo").addEventListener("click", () =>
    copiar(pixPayload(valorAtual), "Código Pix copiado! Cole no app do banco 💛")
  );
  $("#copiarChave").addEventListener("click", () => copiar(PIX.chave, "Chave Pix copiada!"));

  let tt;
  function aviso(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(tt);
    tt = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------- contatos ---------- */
  const cts = $("#contatos");
  const link = (href, txt) => {
    const a = document.createElement("a");
    a.className = "btn btn-claro btn-peq";
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = txt;
    cts.appendChild(a);
  };
  if (CONTATO.whatsapp) link(`https://wa.me/${CONTATO.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Oi! Virei apoiador(a) do Lar Vira-Lata 💛")}`, "WhatsApp");
  if (CONTATO.instagram) link(`https://instagram.com/${CONTATO.instagram.replace("@", "")}`, "@" + CONTATO.instagram.replace("@", ""));
  if (CONTATO.email) link(`mailto:${CONTATO.email}`, CONTATO.email);
})();
