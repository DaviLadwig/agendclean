<?php

namespace App\Http\Controllers;

use App\Models\Agendamento;
use Illuminate\Http\Request;

class AgendamentoController extends Controller
{
    // Lista agendamentos (JSON) — usado pelo FullCalendar
    public function index(Request $request)
    {
        // opcional: filtrar por usuário/profissional
        $userId = $request->query('user_id');

        $query = Agendamento::query();

        if ($userId) {
            $query->where('user_id', $userId);
        }

        // trazer eventos que não foram cancelados
        $agendamentos = $query->where('status', '!=', 'cancelado')->get();

        // mapear para o formato do FullCalendar
        $events = $agendamentos->map(function($a) {
            return [
                'id' => $a->id,
                'title' => ($a->servico ? $a->servico->nome : 'Agendamento') . ' - ' . ($a->cliente?->nome ?? ''),
                'start' => $a->start, // usa accessor getStartAttribute()
                'allDay' => false,
                'extendedProps' => [
                    'tipo' => $a->tipo,
                    'status' => $a->status,
                    'descricao' => $a->descricao,
                    'user_id' => $a->user_id,
                    'cliente_id' => $a->cliente_id,
                ]
            ];
        });

        return response()->json($events);
    }

    // Cria um novo agendamento
    public function store(Request $request)
    {
        // validação básica (melhor mover para FormRequest depois)
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'cliente_id' => 'nullable|exists:users,id',
            'servico_id' => 'nullable|exists:servicos,id',
            'data' => 'required|date',
            'hora' => 'required',
            'tipo' => 'required|in:presencial,online,outro',
            'descricao' => 'nullable|string',
        ]);

        $agendamento = Agendamento::create($data);

        return response()->json($agendamento, 201);
    }

    // Atualiza agendamento
    public function update(Request $request, $id)
    {
        $agendamento = Agendamento::findOrFail($id);

        $data = $request->validate([
            'data' => 'sometimes|date',
            'hora' => 'sometimes',
            'tipo' => 'sometimes|in:presencial,online,outro',
            'descricao' => 'nullable|string',
            'status' => 'sometimes|in:pendente,confirmado,cancelado',
            'servico_id' => 'nullable|exists:servicos,id',
        ]);

        $agendamento->update($data);

        return response()->json($agendamento);
    }

    // Deletar (ou marcar como cancelado)
    public function destroy($id)
    {
        $agendamento = Agendamento::findOrFail($id);

        // em vez de deletar, marcamos como cancelado (preservar histórico)
        $agendamento->update(['status' => 'cancelado']);

        return response()->json(['message' => 'Agendamento cancelado']);
    }
}
