// src/js/main.js
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptLocale from '@fullcalendar/core/locales/pt-br';

// helper de log
const log = (...args) => console.log('[agendclean]', ...args);

document.addEventListener('DOMContentLoaded', () => {
  log('DOM pronto — iniciando...');

  // elementos principais
  const calendarEl = document.getElementById('calendar');
  const modal = document.getElementById('agendamentoModal');
  const inputData = document.getElementById('data');             // campo data (readonly)
  const selectInicio = document.getElementById('hora-inicio');   // select de início
  const selectFim = document.getElementById('hora-fim');         // select de término
  const nomeInput = document.getElementById('nome');
  const mensagemInput = document.getElementById('mensagem');
  const btnConfirmar = document.getElementById('btn-confirmar');
  const btnCancelar = document.getElementById('btn-cancelar');
  const closeBtn = modal?.querySelector('.close');

  if (!calendarEl) {
    console.error('Elemento #calendar não encontrado.');
    return;
  }
  if (!modal) {
    console.error('Modal #agendamentoModal não encontrado.');
    return;
  }

  // Gera array de horários em incrementos de 30 minutos entre startHour e endHour
  function gerarSlots(startHour = 8, endHour = 20, stepMinutes = 30) {
    const slots = [];
    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        // não incluir slots exatamente no endHour:30 se endHour==20 e step 30 (ajuste PRN)
        if (h === endHour && m > 0) continue;
        slots.push(`${hh}:${mm}`);
      }
    }
    return slots;
  }

  // Preenche o select de hora inicial com todos os slots
  const ALL_SLOTS = gerarSlots(8, 20, 30); // 08:00 .. 20:00 (último início 20:00)
  function preencherInicio() {
    selectInicio.innerHTML = '';
    ALL_SLOTS.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      selectInicio.appendChild(opt);
    });
  }

  // Preenche o select de fim com as opções válidas para o início escolhido
  // maxDurMin = 120 (2 horas)
  function preencherFim(inicioValue, maxDurMin = 120) {
    selectFim.innerHTML = '';
    if (!inicioValue) return;
    // converte hh:mm para minutos desde meia-noite
    const [ih, im] = inicioValue.split(':').map(Number);
    const inicioMin = ih * 60 + im;
    // possíveis finais: a cada 30min, mínimo 30min após início, máximo inicio + maxDurMin
    const step = 30;
    for (let t = inicioMin + step; t <= inicioMin + maxDurMin; t += step) {
      const fh = Math.floor(t / 60);
      const fm = t % 60;
      if (fh > 23) break;
      // limite de horário de operação: não permitir fim depois de 22:00 por exemplo (opcional)
      // if (fh > 22) break;
      const value = `${String(fh).padStart(2,'0')}:${String(fm).padStart(2,'0')}`;
      // só adicionar se value estiver presente na lista ALL_SLOTS ou for válido no mesmo dia
      // (permite fins que não correspondem a início de slot, mas aqui usamos 30min step, então bate)
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = value;
      selectFim.appendChild(opt);
    }
  }

  // Abre o modal: seta data no campo e preenche selects
  function abrirModal(dateStr) {
    // dateStr vem no formato yyyy-mm-dd (ex: 2025-11-06)
    inputData.value = new Date(dateStr).toLocaleDateString('pt-BR');
    modal.dataset.date = dateStr; // guarda a data clicada
    preencherInicio();
    // define horário inicial default (próximo slot)
    selectInicio.selectedIndex = 0;
    preencherFim(selectInicio.value);
    // mostra o modal (suporta .show css class)
    modal.classList.add('show');
    // foco no nome
    setTimeout(() => { nomeInput?.focus(); }, 120);
  }

  // Fecha modal limpando dados
  function fecharModal() {
    modal.classList.remove('show');
    formReset();
  }

  function formReset() {
    nomeInput && (nomeInput.value = '');
    mensagemInput && (mensagemInput.value = '');
    selectInicio && (selectInicio.selectedIndex = 0);
    selectFim && (selectFim.innerHTML = '');
    delete modal.dataset.date;
  }

  // Inicializa calendar
  const calendar = new Calendar(calendarEl, {
    plugins: [ dayGridPlugin, interactionPlugin ],
    initialView: 'dayGridMonth',
    locale: ptLocale,
    selectable: true,
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    dateClick: function(info) {
      log('dateClick:', info.dateStr);
      abrirModal(info.dateStr);
      // força atualização de tamanho (resolve encolhimento ocasional)
      try { calendar.updateSize(); } catch(e) { /* ignore */ }
    },
    eventClick: function(info) {
      // Exemplo: mostrar detalhes (pode abrir outro modal)
      const ext = info.event.extendedProps || {};
      alert(`Evento: ${info.event.title}\nData: ${info.event.start?.toLocaleString()}\n${ext.mensagem ? 'Motivo: '+ext.mensagem : ''}`);
    }
  });
  calendar.render();

  // Quando usuário muda o inicio, atualizar opções de fim
  selectInicio.addEventListener('change', () => {
    preencherFim(selectInicio.value, 120); // max 120 min
  });

  // Botões modal
  btnCancelar.addEventListener('click', fecharModal);
  if (closeBtn) closeBtn.addEventListener('click', fecharModal);

  // Confirmar: valida, adiciona evento ao calendário e fecha
  btnConfirmar.addEventListener('click', (e) => {
    e.preventDefault();

    const nome = (nomeInput?.value || '').trim();
    const dataIso = modal.dataset.date; // yyyy-mm-dd
    const inicio = selectInicio?.value;
    const fim = selectFim?.value;
    const mensagem = mensagemInput?.value || '';

    if (!nome) { alert('Informe o nome do cliente.'); return; }
    if (!dataIso) { alert('Data inválida. Tente novamente.'); return; }
    if (!inicio || !fim) { alert('Escolha horário de início e término.'); return; }

    // montar start e end no formato ISO compatível com FullCalendar
    // usamos :00 segundos
    const startIso = `${dataIso}T${inicio}:00`;
    const endIso = `${dataIso}T${fim}:00`;

    // valida duração <= 120min (double check)
    const toMinutes = s => {
      const [hh, mm] = s.split(':').map(Number);
      return hh * 60 + mm;
    };
    if (toMinutes(fim) - toMinutes(inicio) > 120) {
      alert('A duração máxima permitida é 2 horas.');
      return;
    }
    if (toMinutes(fim) <= toMinutes(inicio)) {
      alert('Horário de término deve ser depois do início.');
      return;
    }

    // cria evento no calendario (temporário)
    calendar.addEvent({
      title: nome,
      start: startIso,
      end: endIso,
      extendedProps: { mensagem }
    });

    log('Agendamento criado:', { nome, startIso, endIso, mensagem });
    alert(`Agendamento salvo: ${inputData.value} — ${inicio} até ${fim}`);
    fecharModal();
  });

  
  window.addEventListener('click', (ev) => {
    if (ev.target === modal) fecharModal();
  });

  // garantir selects preenchidos se abrir programaticamente
  preencherInicio();
  if (selectInicio.value) preencherFim(selectInicio.value, 120);

  // debug
  log('script do modal/horarios carregado.');
});
