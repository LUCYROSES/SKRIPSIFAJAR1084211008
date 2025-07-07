<?php
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

// Sanitasi input untuk mencegah XSS
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// Konfigurasi email
$to = 'dwi71301@gmail.com';
$subject = 'Pesan Baru dari Website Simulasi X-Ray - ' . $name;
$headers = array(
    'MIME-Version' => '1.0',
    'Content-type' => 'text/html; charset=UTF-8',
    'From' => $email,
    'Reply-To' => $email,
    'X-Mailer' => 'PHP/' . phpversion()
);

// Template email HTML
$email_body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 20px; margin: 20px 0; }
        .info-row { margin: 10px 0; padding: 10px; background-color: white; border-left: 4px solid #007bff; }
        .footer { text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Pesan Baru dari Website Simulasi X-Ray</h2>
        </div>
        
        <div class='content'>
            <div class='info-row'>
                <strong>Nama:</strong> {$name}
            </div>
            
            <div class='info-row'>
                <strong>Email:</strong> {$email}
            </div>
            
            <div class='info-row'>
                <strong>Waktu:</strong> " . date('d/m/Y H:i:s') . "
            </div>
            
            <div class='info-row'>
                <strong>Pesan:</strong><br>
                " . nl2br($message) . "
            </div>
        </div>
        
        <div class='footer'>
            <p>Email ini dikirim otomatis dari website Simulasi X-Ray</p>
            <p>Universitas MH Thamrin</p>
        </div>
    </div>
</body>
</html>
";

// Gabungkan headers menjadi string
$header_string = '';
foreach ($headers as $key => $value) {
    $header_string .= $key . ': ' . $value . "\r\n";
}

// Kirim email
try {
    $mail_sent = mail($to, $subject, $email_body, $header_string);
    
    if ($mail_sent) {
        // Log pesan yang berhasil dikirim (opsional)
        $log_entry = date('Y-m-d H:i:s') . " - Email sent from: $email, Name: $name\n";
        file_put_contents('contact_logs.txt', $log_entry, FILE_APPEND | LOCK_EX);
        
        echo json_encode([
            'success' => true,
            'message' => 'Pesan Anda berhasil dikirim! Terima kasih sudah menghubungi kami.'
        ]);
    } else {
        throw new Exception('Gagal mengirim email');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Terjadi kesalahan saat mengirim email. Silakan coba lagi nanti.',
        'details' => $e->getMessage()
    ]);
}
?>