<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

// 1. Rute untuk API (Pastikan ditaruh paling atas jika ada)
// Route::get('/api/...', ...);

// 2. Rute tangkap-semua untuk React Router, 
// tapi KECUALIKAN path yang dimulai dengan 'api' atau 'assets'/'dist' (jika file fisik tidak terbaca otomatis)
Route::get('/{any?}', function () {
    $path = public_path('dist/index.html');
    if (File::exists($path)) {
        return File::get($path);
    }
    abort(404, 'File build React (dist/index.html) tidak ditemukan.');
})->where('any', '^(?!api).*$'); 
// Penjelasan regex: (?!api) artinya semua URL bebas masuk ke React, KECUALI yang berawalan /api/...