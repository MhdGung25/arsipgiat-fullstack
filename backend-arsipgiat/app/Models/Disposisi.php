<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disposisi extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_surat',
        'user_id',
        'nama_pegawai',
        'sifat',
        'catatan',
        'tanggal_disposisi',
        'status',
    ];

    // Relasi ke Surat Masuk
    public function suratMasuk()
    {
        return $this->belongsTo(SuratMasuk::class, 'id_surat');
    }

    // Relasi ke Pegawai (User)
    public function pegawai()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}