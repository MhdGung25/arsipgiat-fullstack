<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Akun Admin
        User::create([
            'nama' => 'Linda Agustina.A.Md',
            'email' => 'admin@rancaekek.com',
            'password' => Hash::make('password123'), // Password untuk login
            'jabatan' => 'ARSIPARIS TERAMPIL',
            'role' => 'admin',
        ]);

        // 2. Akun Pegawai
        User::create([
            'nama' => 'Pegawai Arsip',
            'email' => 'pegawai@rancaekek.com',
            'password' => Hash::make('password123'), // Password untuk login
            'jabatan' => 'Staf Pengelola Arsip',
            'role' => 'pegawai',
        ]);
    }
}