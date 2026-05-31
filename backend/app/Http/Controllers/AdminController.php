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
        $total       = User::count();
        $students    = User::where('role', 'etudiant')->count();
        $enseignants = User::where('role', 'enseignant')->count();
        $admins      = User::where('role', 'admin')->count();

        return response()->json([
            'students'    => $students,
            'enseignants' => $enseignants,
            'documents'   => Document::count(),
            'questions'   => Message::where('role', 'user')->count(),

            // ✅ Pourcentages réels
            'roles_pct' => [
                'etudiants'   => $total > 0 ? round(($students    / $total) * 100) : 0,
                'enseignants' => $total > 0 ? round(($enseignants / $total) * 100) : 0,
                'admins'      => $total > 0 ? round(($admins      / $total) * 100) : 0,
            ]
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