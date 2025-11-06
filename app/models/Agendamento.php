<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agendamento extends Model
{
    protected $fillable = [
        'user_id','cliente_id','servico_id','data','hora','tipo','descricao','status'
    ];

    // relações
    public function profissional()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function cliente()
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function servico()
    {
        return $this->belongsTo(Servico::class, 'servico_id');
    }

    // helper: retorna data+hora em formato ISO (útil para FullCalendar)
    public function getStartAttribute()
    {
        return $this->data . 'T' . substr($this->hora, 0, 5);
    }
}
