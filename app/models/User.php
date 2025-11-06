<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    // atributos que podem ser preenchidos em massa
    protected $fillable = ['nome','email','senha_hash','tipo'];

    // esconder campos ao serializar
    protected $hidden = ['senha_hash'];

    // relacionamento: usuário (profissional) tem muitos agendamentos
    public function agendamentos()
    {
        return $this->hasMany(Agendamento::class, 'user_id');
    }

    // relacionamento: quando o usuário é cliente, agendamentos feitos por ele
    public function agendamentosComoCliente()
    {
        return $this->hasMany(Agendamento::class, 'cliente_id');
    }
}
