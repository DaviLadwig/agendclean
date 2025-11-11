import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt-br";
import emailjs from "emailjs-com";

const log = (...args) => console.log("[AgendClean]", ...args);

document.addEventListener("DOMContentLoaded", () => {
  log("DOM pronto — iniciando...");

  const calendarEl = document.getElementById("calendar");
  const modal = document.getElementById("agendamentoModal");
  const inputData = document.getElementById("data");
  const selectInicio = document.getElementById("horaInicio");
  const selectFim = document.getElementById("horaFim");
  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  const telefoneInput = document.getElementById("telefone");
  const motivoInput = document.getElementById("motivo");
  const btnCancelar = document.querySelector(".btn-cancelar");
  const btnConfirmar = document.querySelector(".btn-confirmar");
  const closeBtn = document.querySelector(".close");

  if (!calendarEl || !modal) {
    console.error("❌ Elementos principais não encontrados.");
    return;
  }

  // ===== GERA HORÁRIOS =====
  function gerarSlots(startHour = 8, endHour = 20, stepMinutes = 30) {
    const slots = [];
    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        if (h === endHour && m > 0) continue;
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        slots.push(`${hh}:${mm}`);
      }
    }
    return slots;
  }

  const ALL_SLOTS = gerarSlots(8, 20, 30);

  function preencherInicio() {
    selectInicio.innerHTML = "";
    ALL_SLOTS.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      selectInicio.appendChild(opt);
    });
  }

  function preencherFim(inicioValue, maxDurMin = 120) {
    selectFim.innerHTML = "";
    if (!inicioValue) return;
    const [ih, im] = inicioValue.split(":").map(Number);
    const inicioMin = ih * 60 + im;
    for (let t = inicioMin + 30; t <= inicioMin + maxDurMin; t += 30) {
      const fh = Math.floor(t / 60);
      const fm = t % 60;
      if (fh > 22) break;
      const value = `${String(fh).padStart(2, "0")}:${String(fm).padStart(2, "0")}`;
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      selectFim.appendChild(opt);
    }
  }

  // ===== MODAL =====
function abrirModal(dateStr) {
  // Corrige o deslocamento de data
  const partes = dateStr.split("-");
  const ano = parseInt(partes[0]);
  const mes = parseInt(partes[1]);
  const dia = parseInt(partes[2]);

  // Cria a data sem fuso (mantendo o dia exato)
  const dataLocal = new Date(ano, mes - 1, dia);
  const dataFormatada = dataLocal.toLocaleDateString("pt-BR");

  inputData.value = dataFormatada;
  modal.dataset.date = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  
  preencherInicio();
  preencherFim(selectInicio.value);
  modal.classList.add("show");
  setTimeout(() => nomeInput.focus(), 150);
}

  function fecharModal() {
    modal.classList.remove("show");
    nomeInput.value = "";
    emailInput.value = "";
    telefoneInput.value = "";
    motivoInput.value = "";
    selectInicio.innerHTML = "";
    selectFim.innerHTML = "";
  }

  // ===== CALENDÁRIO =====
  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    locale: ptLocale,
    selectable: true,
    height: "auto",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,dayGridWeek",
    },
    dateClick(info) {
      abrirModal(info.dateStr);
    },
    
    eventClick(info) {
      const ext = info.event.extendedProps || {};
      alert(
        `🗓️ Agendamento:\n\n${info.event.title}\n` +
        `Data: ${info.event.start?.toLocaleDateString("pt-BR")}\n` +
        `Horário: ${info.event.start?.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${info.event.end?.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}\n\n` +
        (ext.motivo ? "Motivo: " + ext.motivo : "")
      );
    },
  });
  calendar.render();
  

  // ===== EVENTOS =====
  selectInicio.addEventListener("change", () => {
    preencherFim(selectInicio.value);
  });
  btnCancelar.addEventListener("click", fecharModal);
  closeBtn.addEventListener("click", fecharModal);

  // ===== CONFIRMAR AGENDAMENTO =====
  btnConfirmar.addEventListener("click", (e) => {
    e.preventDefault();

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const motivo = motivoInput.value.trim();
    const dataIso = modal.dataset.date;
    const inicio = selectInicio.value;
    const fim = selectFim.value;

    if (!nome || !email || !telefone || !inicio || !fim) {
      alert("⚠️ Preencha todos os campos obrigatórios.");
      return;
    }

    const startIso = `${dataIso}T${inicio}:00`;
    const endIso = `${dataIso}T${fim}:00`;

    const novoEvento = {
      title: nome,
      start: startIso,
      end: endIso,
      extendedProps: { email, telefone, motivo },
    };

    calendar.addEvent(novoEvento);
    agendarNotificacaoLocal(novoEvento);
    alert("✅ Agendamento criado com sucesso!");
    fecharModal();

    // === ENVIO DE EMAIL ===
    emailjs.init("vUIUDfZ6IwV5nal3I");
    const templateParams = {
      to_name: nome,
      to_email: email,
      data: inputData.value,
      hora_inicio: inicio,
      hora_fim: fim,
      motivo: motivo,
      empresa_name: "AgendClean",
    };

 
    emailjs.send('service_loj4n5b', 'template_5et063o', templateParams)
      .then(() => console.log('✅ E-mail enviado com sucesso'))
      .catch(err => console.error('❌ Falha ao enviar e-mail:', err));
  });

  // Fecha modal clicando fora
  window.addEventListener("click", (ev) => {
    if (ev.target === modal) fecharModal();
  });

  preencherInicio();
  preencherFim(selectInicio.value);

  log("Script do calendário carregado.");
});

/* ======================
      NOTIFICAÇÕES
====================== */
function solicitarPermissaoNotificacoes() {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("🔔 Permissão de notificação concedida");
      } else {
        console.log("⚠️ Permissão de notificação negada");
      }
    });
  }
}
solicitarPermissaoNotificacoes();

function agendarNotificacaoLocal(evento) {
  const eventoHora = new Date(evento.start);
  const agora = new Date();
  const minutosAntes = 10;

  const diferenca = eventoHora - agora - minutosAntes * 60 * 1000;
  if (diferenca > 0) {
    setTimeout(() => {
      new Notification("🔔 Lembrete de agendamento", {
        body: `Você tem um compromisso com ${evento.title} às ${eventoHora.toLocaleTimeString(
          "pt-BR",
          { hour: "2-digit", minute: "2-digit" }
        )}.`,
        icon: "https://cdn-icons-png.flaticon.com/512/1827/1827316.png",
      });
    }, diferenca);
  }
}
