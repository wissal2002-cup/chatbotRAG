<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\AdminController;

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
    });
    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('/users', UserController::class);
        // Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
        Route::get('/admin/stats',            [AdminController::class, 'stats']);
        Route::get('/admin/stats-by-module',  [AdminController::class, 'statsByModule']);
    });

});