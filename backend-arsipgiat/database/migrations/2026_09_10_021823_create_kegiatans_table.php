<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kegiatans', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke tabel surat_masuks (pilih salah satu, default Laravel: surat_masuks)
            $table->foreignId('id_surat')->nullable()->constrained('surat_masuks')->onDelete('set null');
            
            $table->string('nama_acara', 255);
            $table->date('tanggal_giat');
            $table->time('waktu_mulai');
            $table->time('waktu_selesai')->nullable();
            $table->string('tempat', 255);
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kegiatans');
    }
};