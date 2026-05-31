<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Document;
use App\Models\Message;
use App\Services\AIService;              // ✅ renommé
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ConversationController extends Controller
{
    private AIService $ai;               // ✅ renommé

    public function __construct(AIService $ai)  // ✅ renommé
    {
        $this->ai = $ai;                 // ✅ renommé
    }

    // POST /api/conversations
    public function store(Request $request)
    {
        $request->validate([
            'document_id' => 'required|exists:documents,id',
        ]);

        $conversation = Conversation::firstOrCreate(
            [
                'user_id'     => auth()->id(),
                'document_id' => $request->document_id,
            ],
            [
                'title' => 'Conversation — ' .
                    Document::find($request->document_id)->title
            ]
        );

        return response()->json($conversation, 201);
    }

    // POST /api/conversations/{id}/messages
    public function sendMessage(Request $request, $id)
    {
        $request->validate([
            'question' => 'required|string|max:2000',
        ]);

        $conversation = Conversation::findOrFail($id);

        if ($conversation->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $document = Document::findOrFail($conversation->document_id);

        if (empty($document->extracted_text)) {
            return response()->json([
                'message' => 'Le contenu de ce document n\'a pas pu être extrait.'
            ], 422);
        }

        Message::create([
            'conversation_id' => $conversation->id,
            'document_id'     => $document->id,
            'role'            => 'user',
            'content'         => $request->question,
        ]);

        $answer = $this->ai->ask(        // ✅ renommé
            $request->question,
            $document->extracted_text
        );

        if ($answer === null) {
            return response()->json([
                'message' => 'Le service IA est temporairement indisponible.'
            ], 503);
        }

        $responseMessage = Message::create([
            'conversation_id' => $conversation->id,
            'document_id'     => $document->id,
            'role'            => 'assistant',
            'content'         => $answer,
            'ai_model'        => env('AI_MODEL', 'nvidia/nemotron'), // ✅ renommé
        ]);

        return response()->json([
            'question' => $request->question,
            'answer'   => $answer,
            'message'  => $responseMessage,
        ], 200);
    }

    // GET /api/conversations
    public function index()
    {
        $conversations = Conversation::where('user_id', auth()->id())
            ->with([
                'document:id,title,module,semester',
                'messages' => function($q) {
                    $q->orderBy('created_at')
                      ->select('id','conversation_id','role','content','created_at');
                }
            ])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($conversations);
    }

    // GET /api/conversations/{id}/messages
    public function messages($id)
    {
        $conversation = Conversation::findOrFail($id);

        if ($conversation->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $messages = Message::where('conversation_id', $id)
            ->orderBy('created_at')
            ->get();

        return response()->json($messages);
    }

    // GET /api/conversations/export?format=pdf|txt
    public function export(Request $request)
    {
        $format = $request->query('format', 'txt');
        $convId = $request->query('conversation_id');

        $query = Conversation::where('user_id', auth()->id())
            ->with([
                'document:id,title,module,semester',
                'messages' => function($q) {
                    $q->orderBy('created_at');
                }
            ]);

        if ($convId) {
            $conversations = $query->where('id', $convId)->get();
        } else {
            $conversations = $query->orderBy('updated_at', 'desc')->get();
        }

        if ($format === 'pdf') {
            return $this->exportPdf($conversations);
        }

        return $this->exportTxt($conversations);
    }

    // ── Export PDF ──
    private function exportPdf($conversations)
    {
        $html = '
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #333; margin: 20px; }
                h1 { color: #10b981; font-size: 20px; border-bottom: 2px solid #10b981; padding-bottom: 8px; }
                h2 { color: #0f0c29; font-size: 15px; margin-top: 24px; margin-bottom: 4px; }
                .meta { color: #9ca3af; font-size: 10px; margin-bottom: 12px; }
                .message { margin-bottom: 12px; padding: 10px; border-radius: 6px; }
                .user { background: #f0fdf4; border-left: 3px solid #10b981; }
                .assistant { background: #f9fafb; border-left: 3px solid #6b7280; }
                .role { font-weight: bold; font-size: 10px; margin-bottom: 4px; }
                .role-user { color: #10b981; }
                .role-ai { color: #6b7280; }
                .content { line-height: 1.6; }
                .footer { margin-top: 30px; text-align: center; color: #9ca3af; font-size: 10px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
                .separator { border: none; border-top: 1px dashed #e5e7eb; margin: 16px 0; }
            </style>
        </head>
        <body>
            <h1>📚 Historique des conversations — Chatbot RAG</h1>
            <p class="meta">Exporté le ' . now()->format('d/m/Y à H:i') . ' • ' . $conversations->count() . ' conversation(s)</p>
        ';

        foreach ($conversations as $conv) {
            $html .= '
            <h2>💬 ' . htmlspecialchars($conv->document?->title ?? $conv->title) . '</h2>
            <div class="meta">
                📚 ' . htmlspecialchars($conv->document?->module ?? '') . ' •
                ' . ($conv->document?->semester ?? '') . ' •
                ' . $conv->messages->count() . ' message(s) •
                ' . $conv->created_at->format('d/m/Y') . '
            </div>';

            foreach ($conv->messages as $msg) {
                $roleClass = $msg->role === 'user' ? 'user' : 'assistant';
                $roleLabel = $msg->role === 'user' ? '👤 Vous' : '🤖 Assistant';
                $roleCss   = $msg->role === 'user' ? 'role-user' : 'role-ai';
                $html .= '
                <div class="message ' . $roleClass . '">
                    <div class="role ' . $roleCss . '">' . $roleLabel . ' — ' . $msg->created_at->format('H:i') . '</div>
                    <div class="content">' . nl2br(htmlspecialchars($msg->content)) . '</div>
                </div>';
            }

            $html .= '<hr class="separator">';
        }

        $html .= '
            <div class="footer">Chatbot RAG — Application de révision des cours</div>
        </body>
        </html>';

        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download('historique_' . now()->format('Y-m-d') . '.pdf');
    }

    // ── Export TXT ──
    private function exportTxt($conversations)
    {
        $content  = "════════════════════════════════════════\n";
        $content .= "   HISTORIQUE — CHATBOT RAG\n";
        $content .= "════════════════════════════════════════\n";
        $content .= "Exporté le : " . now()->format('d/m/Y à H:i') . "\n";
        $content .= "Conversations : " . $conversations->count() . "\n";
        $content .= "════════════════════════════════════════\n\n";

        foreach ($conversations as $i => $conv) {
            $content .= "────────────────────────────────────────\n";
            $content .= "CONVERSATION " . ($i + 1) . "\n";
            $content .= "Document : " . ($conv->document?->title ?? $conv->title) . "\n";
            $content .= "Module   : " . ($conv->document?->module ?? '') . "\n";
            $content .= "Semestre : " . ($conv->document?->semester ?? '') . "\n";
            $content .= "Date     : " . $conv->created_at->format('d/m/Y') . "\n";
            $content .= "────────────────────────────────────────\n\n";

            foreach ($conv->messages as $msg) {
                $label = $msg->role === 'user' ? '👤 VOUS' : '🤖 ASSISTANT';
                $time  = $msg->created_at->format('H:i');
                $content .= "[{$label} — {$time}]\n";
                $content .= $msg->content . "\n\n";
            }

            $content .= "\n";
        }

        $content .= "════════════════════════════════════════\n";
        $content .= "Fin de l'historique\n";
        $content .= "════════════════════════════════════════\n";

        $filename = 'historique_' . now()->format('Y-m-d') . '.txt';

        return response($content, 200, [
            'Content-Type'        => 'text/plain; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}