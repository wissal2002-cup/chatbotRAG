<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // GET /api/users
    public function index()
    {
        $users = User::select('id','name','email','role','created_at')
                     ->orderBy('created_at', 'desc')
                     ->get();

        return response()->json($users, 200);
    }

    // POST /api/users
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role'     => 'required|in:admin,enseignant,etudiant',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        return response()->json($user, 201);
    }

    // GET /api/users/{id}
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user, 200);
    }

    // PUT /api/users/{id}
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'  => 'required|string|max:100',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($id),
            ],
            'role'  => 'required|in:admin,enseignant,etudiant',
        ]);

        $user->update([
            'name'  => $request->name,
            'email' => $request->email,
            'role'  => $request->role,
        ]);

        return response()->json($user, 200);
    }

    // DELETE /api/users/{id}
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent admin from deleting himself
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ], 200);
    }
}