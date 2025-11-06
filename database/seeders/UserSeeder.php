use Illuminate\Support\Facades\Hash;

User::create([
    'nome' => 'Admin',
    'email' => 'admin@local.test',
    'senha_hash' => Hash::make('senha123'), // ou usar senha em auth tradicional
    'tipo' => 'admin'
]);
