<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SuratMasuk;
use App\Models\Disposisi;
use App\Models\Kegiatan; // Menggunakan model Kegiatan
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Ringkasan Total Data (Card Counters)
        $totalSuratMasuk = SuratMasuk::count();
        $totalDisposisi  = Disposisi::count();
        $totalAgenda     = Kegiatan::count();
        $totalPegawai    = User::count();

        // 2. Breakdown Status Disposisi
        $disposisiPending = Disposisi::where('status', 'Pending')->count();
        $disposisiProses  = Disposisi::where('status', 'Proses')->count();
        $disposisiSelesai = Disposisi::where('status', 'Selesai')->count();

        // 3. Surat Masuk Terbaru (5 Data Terakhir)
        $suratMasukTerbaru = SuratMasuk::latest()->take(5)->get();

        // 4. Disposisi Penugasan Terbaru (5 Data Terakhir)
        $disposisiTerbaru = Disposisi::with(['suratMasuk', 'pegawai'])
            ->latest()
            ->take(5)
            ->get();

        // 5. Agenda Mendatang (Menggunakan kolom tanggal_giat)
        $agendaMendatang = Kegiatan::where('tanggal_giat', '>=', now()->toDateString())
            ->orderBy('tanggal_giat', 'asc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data Dashboard Analytics',
            'data'    => [
                'counters' => [
                    'total_surat_masuk' => $totalSuratMasuk,
                    'total_disposisi'   => $totalDisposisi,
                    'total_agenda'      => $totalAgenda,
                    'total_pegawai'     => $totalPegawai,
                ],
                'disposisi_status' => [
                    'pending' => $disposisiPending,
                    'proses'  => $disposisiProses,
                    'selesai' => $disposisiSelesai,
                ],
                'recent_surat_masuk' => $suratMasukTerbaru,
                'recent_disposisi'   => $disposisiTerbaru,
                'upcoming_agenda'    => $agendaMendatang,
            ]
        ], 200);
    }
}   