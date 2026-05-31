<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Services\AIService;              // ✅ renommé
use Illuminate\Http\Request;

class TestAIController extends Controller // ✅ renommé
{
    private AIService $ai;               // ✅ renommé

    public function __construct(AIService $ai) // ✅ renommé
    {
        $this->ai = $ai;                 // ✅ renommé
    }

    // POST /api/documents/{id}/test
    public function test(Request $request, $id)
    {
        $request->validate([
            'question' => 'required|string|max:2000',
        ]);

        $document = Document::findOrFail($id);

        // Enseignant can only test his own documents (RG2)
        if (auth()->user()->role === 'enseignant' &&
            $document->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if (empty($document->extracted_text)) {
            return response()->json([
                'message' => 'Texte du document non disponible.'
            ], 422);
        }

        $answer = $this->ai->ask(        // ✅ renommé
            $request->question,
            $document->extracted_text
        );

        if ($answer === null) {
            return response()->json([
                'message' => 'Service IA indisponible. Réessayez.' // ✅ renommé
            ], 503);
        }

        // NOT saved in history (BF10)
        return response()->json([
            'question' => $request->question,
            'answer'   => $answer,
            'document' => $document->title,
        ]);
    }
}