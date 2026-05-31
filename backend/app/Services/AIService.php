<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService                           // ✅ renommé
{
    private string $apiKey;
    private string $model;
    private string $systemInstruction;

    public function __construct()
    {
        $this->apiKey = env('AI_API_KEY');          // ✅ renommé
        $this->model  = env('AI_MODEL', 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'); // ✅ renommé

        $this->systemInstruction =
            "Tu es un assistant pedagogique. " .
            "Reponds uniquement a partir du document fourni. " .
            "Ne donne pas d'information exterieure au document. " .
            "Si la reponse ne se trouve pas dans le document, " .
            "dis : Cette information ne figure pas dans le document fourni.";
    }

    public function ask(string $question, string $pdfText): ?string
    {
        $prompt = $this->buildPrompt($question, $pdfText);

        try {
            $response = Http::timeout(30)
                ->withoutVerifying()
                ->withHeaders([
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'HTTP-Referer'  => 'http://localhost:3000',
                    'X-Title'       => 'Chatbot RAG',
                ])
                ->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model'    => $this->model,
                    'messages' => [
                        [
                            'role'    => 'system',
                            'content' => $this->systemInstruction,
                        ],
                        [
                            'role'    => 'user',
                            'content' => $prompt,
                        ],
                    ],
                    'max_tokens'  => 1024,
                    'temperature' => 0.2,
                ]);

            if ($response->failed()) {
                Log::error('AI Service failed', [    // ✅ renommé
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return null;
            }

            $data = $response->json();

            Log::info('AI Service success', [        // ✅ renommé
                'model' => $this->model,
            ]);

            return $data['choices'][0]['message']['content'] ?? null;

        } catch (\Exception $e) {
            Log::error('AI Service exception: ' . $e->getMessage()); // ✅ renommé
            return null;
        }
    }

    private function buildPrompt(string $question, string $pdfText): string
    {
        return "CONTENU DU DOCUMENT :\n" .
               "====================\n" .
               $pdfText .
               "\n\n====================\n" .
               "QUESTION DE L'ETUDIANT :\n" .
               $question;
    }
}