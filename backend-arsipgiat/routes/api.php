<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KegiatanController;
use App\Http\Controllers\Api\SuratMasukController;
use App\Http\Controllers\Api\DisposisiController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\NotificationController;

// ==========================================
// Route Public (Bisa diakses tanpa login)
// ==========================================
Route::post('/login', [AuthController::class, 'login']);

// ==========================================
// Route Protected (Harus menyertakan Token)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Route Auth (Profil & Logout)
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Route Users
    Route::apiResource('users', UserController::class);

    // Route Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Route Agenda Kegiatan
    Route::apiResource('kegiatan', KegiatanController::class);

    // Route Surat Masuk
    Route::apiResource('surat-masuk', SuratMasukController::class);

    // Route Disposisi
    Route::apiResource('disposisi', DisposisiController::class);

    // Endpoint khusus Pegawai
    Route::get('/pegawai/disposisi', [DisposisiController::class, 'disposisiSaya']);
    Route::put('/pegawai/disposisi/{id}/status', [DisposisiController::class, 'updateStatusPegawai']);

    // Route Notifikasi (Dipindahkan ke dalam auth agar aman & bisa mendeteksi user yang login)
    Route::get('/notifikasi', [NotificationController::class, 'index']);
    Route::put('/notifikasi/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifikasi/read-all', [NotificationController::class, 'markAllAsRead']);
});