<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disposisis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_surat')->constrained('surat_masuks')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Pegawai yang ditugaskan
            $table->string('sifat')->default('Biasa'); // Biasa, Segera, Sangat Segera
            $table->text('catatan')->nullable(); // Instruksi/Catatan pimpinan
            $table->date('tanggal_disposisi');
            $table->enum('status', ['Pending', 'Proses', 'Selesai'])->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disposisis');
    }
};