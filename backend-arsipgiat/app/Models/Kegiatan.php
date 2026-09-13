<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kegiatan extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_surat',
        'nama_acara',
        'tanggal_giat',
        'waktu_mulai',
        'waktu_selesai',
        'tempat',
        'keterangan',
    ];

    // Relasi opsional ke Surat Masuk
    public function suratMasuk()
    {
        return $this->belongsTo(SuratMasuk::class, 'id_surat');
    }
}