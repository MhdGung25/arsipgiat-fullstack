<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Menampilkan daftar notifikasi untuk user yang sedang login.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Jika menggunakan tabel notifikasi bawaan Laravel (morph many)
        $notifications = $user->notifications()->latest()->take(20)->get();

        // Memetakan struktur agar sesuai dengan yang dibaca oleh Frontend Navbar
        $formatted = $notifications->map(function ($notif) {
            return [
                'id' => $notif->id,
                'title' => $notif->data['title'] ?? $notif->data['judul'] ?? 'Pemberitahuan Sistem',
                'message' => $notif->data['message'] ?? $notif->data['pesan'] ?? 'Ada informasi baru untuk Anda.',
                'is_read' => !is_null($notif->read_at),
                'read_at' => $notif->read_at,
                'created_at' => $notif->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted
        ], 200);
    }

    /**
     * Menandai satu notifikasi tertentu telah dibaca.
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();
            return response()->json([
                'success' => true,
                'message' => 'Notifikasi ditandai telah dibaca.'
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'Notifikasi tidak ditemukan.'
        ], 404);
    }

    /**
     * Menandai seluruh notifikasi user telah dibaca.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi telah ditandai dibaca.'
        ], 200);
    }
}