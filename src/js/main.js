// Evento de envio do formulário de agendamento
document.getElementById("form-agendamento").addEventListener("submit", (e) => {
    e.preventDefault(); // Impede o reload da página
  
    // Captura os dados do formulário
    const agendamento = {
      nome: e.target.nome.value,
      data: e.target.data.value,
      hora: e.target.hora.value,
      tipo: e.target.tipo.value,
      descricao: e.target.descricao.value
    };
  
    console.log("Novo agendamento criado:", agendamento);
  
    // Limpa o formulário após o envio
    e.target.reset();
  
    alert("Agendamento salvo com sucesso (simulação)!");
  });
  

  /*IMPORTANDO O FULLCALENDAR*/
  // Importa os módulos do FullCalendar
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import timeGridPlugin from '@fullcalendar/timegrid';
  import listPlugin from '@fullcalendar/list';
  import interactionPlugin from '@fullcalendar/interaction';
  import ptBrLocale from '@fullcalendar/core/locales/pt-br';


  document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      initialView: 'dayGridMonth'
    });
    calendar.render();
  });
  document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
  
    const calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
  
      // 🇧🇷 Define o idioma
      locale: ptBrLocale,
  
      // ⏰ Formato de hora
      slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      },
  
      // 🕐 Duração máxima de evento = 2 horas
      selectConstraint: {
        startTime: '08:00',
        endTime: '20:00', // Exemplo de horário limite diário
      },
  
      selectAllow: function (selectInfo) {
        const start = selectInfo.start;
        const end = selectInfo.end;
  
        // calcula diferença em horas
        const diffInMs = end - start;
        const diffInHours = diffInMs / (1000 * 60 * 60);
  
        // só permite se for até 2h
        return diffInHours <= 2;
      },
  
      // ⚡ Permite seleção de horários
      selectable: true,
      selectMirror: true,
  
      // Exemplo de callback (iremos conectar com o modal depois)
      select: function (info) {
        const start = info.start.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const end = info.end.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        alert(`Evento de ${start} até ${end}`);
      },
    });
  
    calendar.render();
  });
  

  // IDIOMA CALENDAR
  
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pt-br', // 🌎 idioma definido aqui
    dateClick: function (info) {
      console.log('Data clicada: ' + info.dateStr);
    },
  });

  
  


  // ===============================
// LÓGICA DO MODAL DE AGENDAMENTO
// ===============================

const modal = document.getElementById('event-modal');
const closeModal = document.getElementById('close-modal');
const form = document.getElementById('event-form');
let selectedDate = null;

// Quando clicar em um dia do calendário
calendar.on('dateClick', function (info) {
  selectedDate = info.dateStr; // guarda a data selecionada
  modal.style.display = 'flex'; // exibe o modal
});

// Fechar o modal
closeModal.onclick = () => (modal.style.display = 'none');

// Fechar modal ao clicar fora
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = 'none';
};

// Ao enviar o formulário
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('event-title').value;
  const description = document.getElementById('event-description').value;
  const type = document.getElementById('event-type').value;

  if (!title) return alert('Digite um título.');

  // Adiciona o evento no calendário
  calendar.addEvent({
    title: `${title} (${type})`,
    start: selectedDate,
    extendedProps: { description, type },
  });

  // Fecha o modal e limpa os campos
  form.reset();
  modal.style.display = 'none';
});
