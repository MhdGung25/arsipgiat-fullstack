<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Disposisi;
use Illuminate\Http\Request;

class DisposisiController extends Controller
{
    public function index(Request $request)
    {
        $query = Disposisi::with(['suratMasuk', 'pegawai']);

        if ($request->has('user_id') && !empty($request->user_id)) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('suratMasuk', function ($sm) use ($search) {
                    $sm->where('perihal', 'like', "%{$search}%")
                      ->orWhere('nomor_surat', 'like', "%{$search}%");
                })
                ->orWhere('catatan', 'like', "%{$search}%")
                ->orWhere('nama_pegawai', 'like', "%{$search}%");
            });
        }

        $data = $query->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar Disposisi Penugasan',
            'data'    => $data,
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_surat'          => 'required|exists:surat_masuks,id',
            'user_id'           => 'nullable|exists:users,id',
            'nama_pegawai'      => 'nullable|string|max:255',
            'sifat'             => 'required|string',
            'catatan'           => 'nullable|string',
            'tanggal_disposisi' => 'required|date',
            'status'            => 'nullable|in:Pending,Proses,Selesai',
        ]);

        $disposisi = Disposisi::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Disposisi penugasan berhasil dibuat',
            'data'    => $disposisi->load(['suratMasuk', 'pegawai']),
        ], 201);
    }

    public function show($id)
    {
        $disposisi = Disposisi::with(['suratMasuk', 'pegawai'])->find($id);

        if (!$disposisi) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json(['success' => true, 'data' => $disposisi], 200);
    }

    public function update(Request $request, $id)
    {
        $disposisi = Disposisi::find($id);

        if (!$disposisi) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'id_surat'          => 'sometimes|required|exists:surat_masuks,id',
            'user_id'           => 'nullable|exists:users,id',
            'nama_pegawai'      => 'nullable|string|max:255',
            'sifat'             => 'sometimes|required|string',
            'catatan'           => 'nullable|string',
            'tanggal_disposisi' => 'sometimes|required|date',
            'status'            => 'sometimes|required|in:Pending,Proses,Selesai',
        ]);

        $disposisi->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data disposisi berhasil diperbarui',
            'data'    => $disposisi->load(['suratMasuk', 'pegawai']),
        ], 200);
    }

    public function destroy($id)
    {
        $disposisi = Disposisi::find($id);

        if (!$disposisi) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        $disposisi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Disposisi berhasil dihapus',
        ], 200);
    }

    public function disposisiSaya(Request $request)
    {
        $userId = $request->user()->id;

        $query = Disposisi::with('suratMasuk')
            ->where('user_id', $userId);

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->whereHas('suratMasuk', function ($q) use ($search) {
                $q->where('perihal', 'like', "%{$search}%")
                  ->orWhere('nomor_surat', 'like', "%{$search}%");
            })->orWhere('catatan', 'like', "%{$search}%");
        }

        $data = $query->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar penugasan disposisi saya',
            'data'    => $data,
        ], 200);
    }

    public function updateStatusPegawai(Request $request, $id)
    {
        $disposisi = Disposisi::where('user_id', $request->user()->id)->find($id);

        if (!$disposisi) {
            return response()->json(['success' => false, 'message' => 'Penugasan tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'status'  => 'required|in:Pending,Proses,Selesai',
            'catatan' => 'nullable|string',
        ]);

        $disposisi->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Status penugasan berhasil diperbarui',
            'data'    => $disposisi->load('suratMasuk'),
        ], 200);
    }
}