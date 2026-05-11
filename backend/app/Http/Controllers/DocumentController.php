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
            'file'        => 'required|file|mimes:pdf|max:10240', // max 10MB
        ]);

        $file     = $request->file('file');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path     = $file->storeAs('documents', $filename);

        // Extract text from PDF
        $extractedText = $this->extractTextFromPdf(
            storage_path('app/' . $path)
        );

        // Limit to 50 000 characters
        if (strlen($extractedText) > 50000) {
            $extractedText = substr($extractedText, 0, 50000);
        }

        $document = Document::create([
            'user_id'        => auth()->id(),
            'title'          => $request->title,
            'module'         => $request->module,
            'semester'       => $request->semester,
            'description'    => $request->description,
            'file_path'      => $path,
            'file_size'      => $file->getSize(),
            'extracted_text' => $extractedText,
        ]);

        return response()->json([
            'message'  => 'Document uploadé avec succès',
            'document' => $document
        ], 201);
    }

    // DELETE /api/documents/{id}
    public function destroy($id)
    {
        $document = Document::findOrFail($id);

        // Enseignant can only delete his own documents
        if (auth()->user()->role === 'enseignant' &&
            $document->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Non autorisé'
            ], 403);
        }

        // Delete file
        if (Storage::exists($document->file_path)) {
            Storage::delete($document->file_path);
        }

        $document->delete();

        return response()->json([
            'message' => 'Document supprimé avec succès'
        ]);
    }

    // Extract text from PDF using pdftotext or smalot/pdfparser
    private function extractTextFromPdf($filePath)
    {
        // Try pdftotext (Linux/XAMPP)
        if (PHP_OS_FAMILY !== 'Windows') {
            $text = shell_exec("pdftotext " . escapeshellarg($filePath) . " -");
            if ($text) return trim($text);
        }

        // Fallback: smalot/pdfparser
        try {
            $parser   = new \Smalot\PdfParser\Parser();
            $pdf      = $parser->parseFile($filePath);
            return $pdf->getText();
        } catch (\Exception $e) {
            return '';
        }
    }
}