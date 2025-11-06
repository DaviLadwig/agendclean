<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Servico;

class ServicoSeeder extends Seeder
{
    public function run()
    {
        Servico::create(['nome' => 'Consulta Inicial', 'descricao' => 'Consulta completa', 'duracao' => 45]);
        Servico::create(['nome' => 'Retorno', 'descricao' => 'Consulta de retorno', 'duracao' => 30]);
        Servico::create(['nome' => 'Reunião', 'descricao' => 'Reunião/Consultoria', 'duracao' => 60]);
    }
}
