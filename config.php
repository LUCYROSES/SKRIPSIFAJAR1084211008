<?php
// config.php - Konfigurasi Email

return [
    // Konfigurasi untuk Gmail SMTP
    'gmail' => [
        'host' => 'smtp.gmail.com',
        'port' => 587,
        'encryption' => 'tls',
        'username' => 'your-gmail@gmail.com', // Ganti dengan email Gmail Anda
        'password' => 'your-app-password',     // Ganti dengan App Password Gmail
        'from_name' => 'Website Simulasi X-Ray'
    ],
    
    // Konfigurasi untuk hosting provider lain (contoh)
    'hosting' => [
        'host' => 'mail.yourdomain.com',
        'port' => 587,
        'encryption' => 'tls',
        'username' => 'noreply@yourdomain.com',
        'password' => 'your-password',
        'from_name' => 'Website Simulasi X-Ray'
    ],
    
    // Email tujuan
    'recipient' => [
        'email' => 'dwi71301@gmail.com',
        'name' => 'Dwi'
    ],
    
    // Pengaturan tambahan
    'settings' => [
        'enable_logging' => true,
        'log_file' => 'contact_logs.txt',
        'max_message_length' => 1000,
        'allowed_origins' => ['*'], // Untuk CORS
        'rate_limit' => [
            'enabled' => true,
            'max_attempts' => 5,
            'time_window' => 3600 // 1 jam dalam detik
        ]
    ]
];
?>