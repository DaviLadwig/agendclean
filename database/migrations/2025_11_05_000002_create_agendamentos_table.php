<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('agendamentos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');      // profissional / dono da agenda
            $table->unsignedBigInteger('cliente_id')->nullable(); // pode ser null para agendamentos anônimos
            $table->unsignedBigInteger('servico_id')->nullable();
            $table->date('data');                       // dia do evento (YYYY-MM-DD)
            $table->time('hora');                       // hora do evento (HH:MM:SS)
            $table->enum('tipo', ['presencial','online','outro'])->default('presencial');
            $table->text('descricao')->nullable();      // descrição / observações
            $table->enum('status', ['pendente','confirmado','cancelado'])->default('pendente');
            $table->timestamps();

            // foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('cliente_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('servico_id')->references('id')->on('servicos')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('agendamentos');
    }
};
