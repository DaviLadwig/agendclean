<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();                           // id incremental
            $table->string('nome', 100);            // nome do usuário/profissional/cliente
            $table->string('email')->unique();      // email único
            $table->string('senha_hash');           // senha (hash)
            $table->enum('tipo', ['admin','cliente','profissional'])->default('cliente');
            $table->timestamps();                   // created_at e updated_at
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
