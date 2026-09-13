<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kegiatan;
use Illuminate\Http\Request;

class KegiatanController extends Controller
{
    public function index(Request $request)
    {
        $query = Kegiatan::with('suratMasuk');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('nama_acara', 'like', "%{$search}%")
                  ->orWhere('tempat', 'like', "%{$search}%");
        }

        $data = $query->orderBy('tanggal_giat', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar Agenda Kegiatan',
            'data'    => $data,
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_surat'      => 'nullable|exists:surat_masuks,id',
            'nama_acara'    => 'required|string|max:255',
            'tanggal_giat'  => 'required|date',
            'waktu_mulai'   => 'required',
            'waktu_selesai' => 'nullable',
            'tempat'        => 'required|string|max:255',
            'keterangan'    => 'nullable|string',
        ]);

        $kegiatan = Kegiatan::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Agenda berhasil ditambahkan',
            'data'    => $kegiatan,
        ], 201);
    }

    public function show($id)
    {
        $kegiatan = Kegiatan::with('suratMasuk')->find($id);

        if (!$kegiatan) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json(['success' => true, 'data' => $kegiatan], 200);
    }

    public function update(Request $request, $id)
    {
        $kegiatan = Kegiatan::find($id);

        if (!$kegiatan) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'id_surat'      => 'nullable|exists:surat_masuks,id',
            'nama_acara'    => 'required|string|max:255',
            'tanggal_giat'  => 'required|date',
            'waktu_mulai'   => 'required',
            'waktu_selesai' => 'nullable',
            'tempat'        => 'required|string|max:255',
            'keterangan'    => 'nullable|string',
        ]);

        $kegiatan->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Agenda berhasil diperbarui',
            'data'    => $kegiatan,
        ], 200);
    }

    public function destroy($id)
    {
        $kegiatan = Kegiatan::find($id);

        if (!$kegiatan) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        $kegiatan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Agenda berhasil dihapus',
        ], 200);
    }
}