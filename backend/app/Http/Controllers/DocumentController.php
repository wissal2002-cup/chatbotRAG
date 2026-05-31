<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    // GET /api/documents — all users
    public function index()
    {
        $documents = Document::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($doc) {
                return [
                    'id'          => $doc->id,
                    'title'       => $doc->title,
                    'module'      => $doc->module,
                    'semester'    => $doc->semester,
                    'description' => $doc->description,
                    'file_size'   => $doc->file_size,
                    'created_at'  => $doc->created_at,
                    'enseignant'  => $doc->user?->name,
                    'user_id'     => $doc->user_id,
                ];
            });

        return response()->json($documents);
    }

    // POST /api/documents — enseignant only
    public function store(Request $request)
{
    $request->validate([
        'title'       => 'required|string|max:200',
        'module'      => 'required|string|max:100',
        'semester'    => 'required|in:S1,S2,S3,S4,S5,S6',
        'description' => 'nullable|string',
        'file'        => 'required|file|mimes:pdf|max:10240',
    ]);

    $file     = $request->file('file');
    $filename = time() . '_' . $file->getClientOriginalName();

    // Store the file
    $path = $file->storeAs('documents', $filename, 'local');

    // ✅ Build full path correctly for Windows
    $fullPath = storage_path('app' . DIRECTORY_SEPARATOR . 'private'
                . DIRECTORY_SEPARATOR . 'documents'
                . DIRECTORY_SEPARATOR . $filename);

    // Fallback if not in private
    if (!file_exists($fullPath)) {
        $fullPath = storage_path('app' . DIRECTORY_SEPARATOR
                    . 'documents' . DIRECTORY_SEPARATOR . $filename);
    }

    \Log::info('PDF path: ' . $fullPath);
    \Log::info('File exists: ' . (file_exists($fullPath) ? 'YES' : 'NO'));

    // Extract text
    $extractedText = '';
    if (file_exists($fullPath)) {
        $extractedText = $this->extractTextFromPdf($fullPath);
    }

    // Limit to 50 000 chars
    if (strlen($extractedText) > 50000) {
        $extractedText = substr($extractedText, 0, 50000);
    }

    \Log::info('Extracted chars: ' . strlen($extractedText));

    $document = Document::create([
        'user_id'        => auth()->id(),
        'title'          => $request->title,
        'module'         => $request->module,
        'semester'       => $request->semester,
        'description'    => $request->description,
        'file_path'      => 'documents' . DIRECTORY_SEPARATOR . $filename,
        'file_size'      => $file->getSize(),
        'extracted_text' => $extractedText,
    ]);

    return response()->json([
        'message'         => 'Document uploadé avec succès',
        'document'        => $document,
        'extracted_chars' => strlen($extractedText),
    ], 201);
}

    // DELETE /api/documents/{id}
public function destroy($id)
{
    $document = Document::findOrFail($id);

    if (auth()->user()->role === 'enseignant' &&
        $document->user_id !== auth()->id()) {
        return response()->json(['message' => 'Non autorisé'], 403);
    }

    // ✅ Try both paths
    $paths = [
        storage_path('app/private/' . $document->file_path),
        storage_path('app/' . $document->file_path),
    ];

    foreach ($paths as $path) {
        if (file_exists($path)) {
            unlink($path);
            break;
        }
    }

    $document->delete();

    return response()->json(['message' => 'Document supprimé avec succès']);
}

    // Extract text from PDF using pdftotext or smalot/pdfparser
private function extractTextFromPdf($fullPath)
{
    try {
        if (!file_exists($fullPath)) {
            \Log::error('File not found: ' . $fullPath);
            return '';
        }

        $parser = new \Smalot\PdfParser\Parser();
        $pdf    = $parser->parseFile($fullPath);
        $text   = $pdf->getText();

        if (!empty(trim($text))) {
            return trim($text);
        }

        return '';
    } catch (\Exception $e) {
        \Log::error('PDF extraction failed: ' . $e->getMessage());
        return '';
    }
}



// GET /api/documents/{id}
public function show($id)
{
    $document = Document::with('user:id,name')->findOrFail($id);
    return response()->json([
        'id'             => $document->id,
        'title'          => $document->title,
        'module'         => $document->module,
        'semester'       => $document->semester,
        'description'    => $document->description,
        'file_size'      => $document->file_size,
        'extracted_text' => $document->extracted_text,
        'enseignant'     => $document->user?->name,
        'created_at'     => $document->created_at,
    ]);
}

// GET /api/documents/{id}/view
public function viewPdf($id)
{
    $document = Document::findOrFail($id);

    // Try both paths
    $fullPath = storage_path('app/private/' . $document->file_path);
    if (!file_exists($fullPath)) {
        $fullPath = storage_path('app/' . $document->file_path);
    }

    if (!file_exists($fullPath)) {
        return response()->json(['message' => 'Fichier non trouvé'], 404);
    }

    return response()->file($fullPath, [
        'Content-Type'        => 'application/pdf',
        'Content-Disposition' => 'inline; filename="' . basename($fullPath) . '"',
    ]);
}

}