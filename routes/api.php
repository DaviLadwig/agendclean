use App\Http\Controllers\AgendamentoController;

Route::get('/agendamentos', [AgendamentoController::class, 'index']);
Route::post('/agendamentos', [AgendamentoController::class, 'store']);
Route::put('/agendamentos/{id}', [AgendamentoController::class, 'update']);
Route::delete('/agendamentos/{id}', [AgendamentoController::class, 'destroy']);
