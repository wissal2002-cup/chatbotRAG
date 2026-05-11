<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Document;
use App\Models\Message;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'students'    => User::where('role', 'etudiant')->count(),
            'enseignants' => User::where('role', 'enseignant')->count(),
            'documents'   => Document::count(),
            'questions'   => Message::where('role', 'user')->count(),
        ]);
    }

    public function statsByModule()
    {
        $modules = Document::select('module')
            ->distinct()
            ->pluck('module');

        $data = $modules->map(function ($module) {
            return [
                'module'    => $module,
                'documents' => Document::where('module', $module)->count(),
                'questions' => Message::whereHas('document', function ($q) use ($module) {
                    $q->where('module', $module);
                })->where('role', 'user')->count(),
            ];
        });

        return response()->json($data);
    }
}