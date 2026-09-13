<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SuratMasuk extends Model
{
    use HasFactory;

    protected $fillable = [
        'nomor_surat',
        'pengirim',
        'perihal',
        'tanggal_surat',
        'tanggal_diterima',
        'file_surat',
        'keterangan',
    ];

    // Otomatis menambahkan atribut URL file pada response JSON
    protected $appends = ['file_url'];

    public function getFileUrlAttribute(): ?string
    {
        return $this->file_surat ? asset('storage/' . $this->file_surat) : null;
    }
}