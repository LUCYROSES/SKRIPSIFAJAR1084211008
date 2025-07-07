<?php
// Untuk menggunakan file ini, Anda perlu menginstall PHPMailer terlebih dahulu
// composer require phpmailer/phpmailer

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Hanya menerima POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Validasi input
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

// Validasi field kosong
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Semua field harus diisi']);
    exit;
}

// Validasi email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Format email tidak valid']);
    exit;
}

// Sanitasi input
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// Konfigurasi SMTP - Ganti dengan detail SMTP Anda
$smtp_config = [
    'host' => 'smtp.gmass.co.', // Ganti dengan SMTP server Anda
    'username' => 'kittybreak71301@gmail.com', // Email pengirim
    'password' => 'rsqs oboq fmas luyn', // App password Gmail
    'port' => 587,
    'encryption' => PHPMailer::ENCRYPTION_STARTTLS
];

$mail = new PHPMailer(true);

try {
    // Konfigurasi server
    $mail->isSMTP();
    $mail->Host = $smtp_config['host'];
    $mail->SMTPAuth = true;
    $mail->Username = $smtp_config['username'];
    $mail->Password = $smtp_config['password'];
    $mail->SMTPSecure = $smtp_config['encryption'];
    $mail->Port = $smtp_config['port'];
    
    // Set encoding
    $mail->CharSet = 'UTF-8';
    
    // Penerima
    $mail->setFrom($smtp_config['username'], 'Website Simulasi X-Ray');
    $mail->addAddress('dwi71301@gmail.com', 'Dwi');
    $mail->addReplyTo($email, $name);
    
    // Konten email
    $mail->isHTML(true);
    $mail->Subject = 'Pesan Baru dari Website Simulasi X-Ray - ' . $name;
    `
    $mail->Body = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
            }
            .header { 
                background: linear-gradient(135deg, #007bff, #0056b3); 
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
            }
            .header h2 { margin: 0; font-size: 24px; }
            .content { 
                padding: 30px 20px; 
                background-color: #f8f9fa; 
            }
            .info-card { 
                background-color: white; 
                border-radius: 8px; 
                padding: 20px; 
                margin: 15px 0; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
                border-left: 4px solid #007bff; 
            }
            .info-label { 
                font-weight: bold; 
                color: #007bff; 
                margin-bottom: 5px; 
            }
            .info-value { 
                color: #333; 
                word-wrap: break-word; 
            }
            .message-box { 
                background-color: #e9ecef; 
                padding: 15px; 
                border-radius: 5px; 
                margin-top: 10px; 
            }
            .footer { 
                text-align: center; 
                color: #666; 
                font-size: 12px; 
                padding: 20px; 
                background-color: #343a40; 
                color: #fff; 
            }
            .timestamp { 
                background-color: #28a745; 
                color: white; 
                padding: 5px 10px; 
                border-radius: 3px; 
                font-size: 12px; 
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>📧 Pesan Baru dari Website Simulasi X-Ray</h2>
                <div class='timestamp'>" . date('d F Y, H:i:s') . "</div>
            </div>
            
            <div class='content'>
                <div class='info-card'>
                    <div class='info-label'>👤 Nama Pengirim:</div>
                    <div class='info-value'>{$name}</div>
                </div>
                
                <div class='info-card'>
                    <div class='info-label'>📧 Email:</div>
                    <div class='info-value'>{$email}</div>
                </div>
                
                <div class='info-card'>
                    <div class='info-label'>💬 Pesan:</div>
                    <div class='message-box'>" . nl2br($message) . "</div>
                </div>
            </div>
            
            <div class='footer'>
                <p>🏥 Email ini dikirim otomatis dari website Simulasi X-Ray</p>
                <p>🎓 Universitas MH Thamrin</p>
                <p>Jl. Raya Pd. Gede 23-25 Jaktim</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Text version untuk email client yang tidak support HTML
    $mail->AltBody = "
    Pesan Baru dari Website Simulasi X-Ray
    
    Nama: {$name}
    Email: {$email}
    Waktu: " . date('d/m/Y H:i:s') . "
    
    Pesan:
    {$message}
    
    ---
    Email ini dikirim otomatis dari website Simulasi X-Ray
    Universitas MH Thamrin
    ";
    
    $mail->send();
    
    // Log successful submission
    $log_entry = date('Y-m-d H:i:s') . " - SUCCESS - Email: $email, Name: $name\n";
    file_put_contents('contact_logs.txt', $log_entry, FILE_APPEND | LOCK_EX);
    
    echo json_encode([
        'success' => true,
        'message' => '✅ Pesan Anda berhasil dikirim! Terima kasih sudah menghubungi kami. Kami akan segera merespons pesan Anda.'
    ]);
    
} catch (Exception $e) {
    // Log error
    $log_entry = date('Y-m-d H:i:s') . " - ERROR - " . $e->getMessage() . " - Email: $email\n";
    file_put_contents('contact_logs.txt', $log_entry, FILE_APPEND | LOCK_EX);
    
    http_response_code(500);
    echo json_encode([
        'error' => '❌ Terjadi kesalahan saat mengirim email. Silakan coba lagi nanti atau hubungi kami melalui WhatsApp.',
        'details' => $e->getMessage()
    ]);
}
?>