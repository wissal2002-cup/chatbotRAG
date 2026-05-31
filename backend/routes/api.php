<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\TestAIController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

// All authenticated users
    Route::get('/documents', [DocumentController::class, 'index']);

// Enseignant + Admin — upload + delete own
    Route::middleware('role:enseignant,admin')->group(function () {
    Route::post('/documents', [DocumentController::class, 'store']);
    });

    // Enseignant delete own / Admin delete any
    Route::middleware('role:enseignant,admin')->group(function () {
        Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
        Route::post('/documents',[DocumentController::class, 'store']);
        Route::post('/documents/{id}/test',  [TestAIController::class, 'test']);

    });
    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('/users', UserController::class);
        // Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
        Route::get('/admin/stats',            [AdminController::class, 'stats']);
        Route::get('/admin/stats-by-module',  [AdminController::class, 'statsByModule']);
    });
// Etudiant — chat
    Route::middleware('role:etudiant')->group(function () {
        Route::post('/conversations',                    [ConversationController::class, 'store']);
        Route::get('/conversations',                     [ConversationController::class, 'index']);
        Route::post('/conversations/{id}/messages',      [ConversationController::class, 'sendMessage']);
        Route::get('/conversations/{id}/messages',       [ConversationController::class, 'messages']);

        Route::get('/conversations/export',         [ConversationController::class, 'export']);

    });
 

});
// Route temporaire pour re-extraire le texte
Route::middleware('auth:sanctum')->get('/documents/{id}/extract', function($id) {
    $doc = \App\Models\Document::findOrFail($id);
    try {
        // ✅ Try private folder first
        $fullPath = storage_path('app/private/' . $doc->file_path);
        if (!file_exists($fullPath)) {
            $fullPath = storage_path('app/' . $doc->file_path);
        }

        $parser = new \Smalot\PdfParser\Parser();
        $pdf    = $parser->parseFile($fullPath);
        $text   = $pdf->getText();

        $doc->update(['extracted_text' => substr($text, 0, 50000)]);

        return response()->json([
            'message' => 'Texte extrait avec succès',
            'chars'   => strlen($text),
            'preview' => substr($text, 0, 300),
        ]);
    } catch(\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Voir les détails d'un document (tous les users)
Route::get('/documents/{id}', [DocumentController::class, 'show']);

// Voir le PDF original
Route::middleware('auth:sanctum')->get('/documents/{id}/view', [DocumentController::class, 'viewPdf']);


// Route publique pour voir le PDF avec token dans URL
Route::get('/documents/{id}/view', function($id) {
    $token = request()->query('token');

    // Verify token manually
    $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
    if (!$accessToken) {
        return response()->json(['message' => 'Non autorisé'], 401);
    }

    $document = \App\Models\Document::findOrFail($id);

    $fullPath = storage_path('app/private/' . $document->file_path);
    if (!file_exists($fullPath)) {
        $fullPath = storage_path('app/' . $document->file_path);
    }

    if (!file_exists($fullPath)) {
        return response()->json(['message' => 'Fichier non trouvé'], 404);
    }

    return response()->file($fullPath, [
        'Content-Type'        => 'application/pdf',
        'Content-Disposition' => 'inline',
    ]);
});