<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SuratMasuk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SuratMasukController extends Controller
{
    // Fetch Data + Search
    public function index(Request $request)
    {
        $query = SuratMasuk::query();

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('nomor_surat', 'like', "%{$search}%")
                  ->orWhere('pengirim', 'like', "%{$search}%")
                  ->orWhere('perihal', 'like', "%{$search}%");
        }

        $data = $query->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar Surat Masuk',
            'data'    => $data,
        ], 200);
    }

    // Tambah Data
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_surat'      => 'required|string|unique:surat_masuks,nomor_surat',
            'pengirim'         => 'required|string|max:255',
            'perihal'          => 'required|string|max:255',
            'tanggal_surat'    => 'required|date',
            'tanggal_diterima' => 'required|date',
            'file_surat'       => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // Maks 5MB
            'keterangan'       => 'nullable|string',
        ]);

        if ($request->hasFile('file_surat')) {
            $validated['file_surat'] = $request->file('file_surat')->store('surat_masuk', 'public');
        }

        $suratMasuk = SuratMasuk::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Surat masuk berhasil ditambahkan',
            'data'    => $suratMasuk,
        ], 201);
    }

    // Detail Data
    public function show($id)
    {
        $suratMasuk = SuratMasuk::find($id);

        if (!$suratMasuk) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json(['success' => true, 'data' => $suratMasuk], 200);
    }

    // Edit Data
    public function update(Request $request, $id)
    {
        $suratMasuk = SuratMasuk::find($id);

        if (!$suratMasuk) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'nomor_surat'      => 'required|string|unique:surat_masuks,nomor_surat,' . $id,
            'pengirim'         => 'required|string|max:255',
            'perihal'          => 'required|string|max:255',
            'tanggal_surat'    => 'required|date',
            'tanggal_diterima' => 'required|date',
            'file_surat'       => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'keterangan'       => 'nullable|string',
        ]);

        if ($request->hasFile('file_surat')) {
            // Hapus file lama jika ada
            if ($suratMasuk->file_surat && Storage::disk('public')->exists($suratMasuk->file_surat)) {
                Storage::disk('public')->delete($suratMasuk->file_surat);
            }
            $validated['file_surat'] = $request->file('file_surat')->store('surat_masuk', 'public');
        }

        $suratMasuk->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Surat masuk berhasil diperbarui',
            'data'    => $suratMasuk,
        ], 200);
    }

    // Hapus Data
    public function destroy($id)
    {
        $suratMasuk = SuratMasuk::find($id);

        if (!$suratMasuk) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        if ($suratMasuk->file_surat && Storage::disk('public')->exists($suratMasuk->file_surat)) {
            Storage::disk('public')->delete($suratMasuk->file_surat);
        }

        $suratMasuk->delete();

        return response()->json([
            'success' => true,
            'message' => 'Surat masuk berhasil dihapus',
        ], 200);
    }
}