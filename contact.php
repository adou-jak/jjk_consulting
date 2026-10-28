<?php
/**
 * EZOUA / JJK Consulting — API de Contact Sécurisée
 * Traitement asynchrone des demandes de contact et notification e-mail
 */

header('Content-Type: application/json; charset=UTF-8');

// Configuration du destinataire
$recipientEmail = 'ezoua.consulting@outlook.com';
$cabinetName = 'EZOUA CONSULTING';

// Autoriser uniquement les requêtes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée. Seul le protocole POST est accepté.'
    ]);
    exit;
}

// Récupération des données (support form-data et application/json)
$inputJSON = file_get_contents('php://input');
$inputData = json_decode($inputJSON, true);

$readInput = static function ($key) use ($inputData) {
  $value = $inputData[$key] ?? $_POST[$key] ?? '';
  return is_string($value) ? trim($value) : '';
};
$textLength = static function ($value) {
  return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
};

$name = $readInput('name');
$email = $readInput('email');
$phone = $readInput('phone');
$organization = $readInput('organization');
$interest = $readInput('interest');
$requestType = $readInput('request_type');
$message = $readInput('message');
$honeypot = $readInput('_website_check'); // Anti-bot

// Protection Honeypot : Si le champ caché est rempli, bloquer silencieusement les robots
if (!empty($honeypot)) {
    echo json_encode([
        'success' => true,
        'message' => 'Votre demande a bien été transmise.'
    ]);
    exit;
}

// Validation des données
$errors = [];

if ($textLength($name) < 2 || $textLength($name) > 120) {
    $errors[] = 'Veuillez saisir votre nom complet (au moins 2 caractères).';
}

if ($textLength($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Veuillez saisir une adresse email valide.';
}

if ($textLength($phone) > 30 || $textLength($organization) > 150) {
  $errors[] = 'Le téléphone ou le nom de l’organisation dépasse la longueur autorisée.';
}

if ($textLength($message) < 10 || $textLength($message) > 5000) {
    $errors[] = 'Votre message est trop court (au moins 10 caractères requis).';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'errors' => $errors,
        'message' => 'Veuillez corriger les informations saisies.'
    ]);
    exit;
}

// Nettoyage et assainissement
$safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safePhone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$safeOrganization = htmlspecialchars($organization, ENT_QUOTES, 'UTF-8');
$safeInterest = htmlspecialchars($interest, ENT_QUOTES, 'UTF-8');
$safeRequestType = htmlspecialchars($requestType, ENT_QUOTES, 'UTF-8');
$safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
$dateFormatted = date('d/m/Y à H:i:s');

// Sujet de l'e-mail
$subjectText = '[Site Web] Nouvelle demande de contact : ' . str_replace(["\r", "\n"], '', $name);
$subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';

// Corps HTML professionnel aux couleurs de la charte Navy & Gold
$emailBody = "
<!DOCTYPE html>
<html lang='fr'>
<head>
  <meta charset='UTF-8'>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0B1E36; color: #ffffff; padding: 24px; text-align: center; }
    .header h2 { margin: 0; font-size: 20px; color: #D4AF37; }
    .content { padding: 24px; }
    .field { margin-bottom: 16px; }
    .label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px; }
    .value { font-size: 15px; color: #0f172a; line-height: 1.5; }
    .message-box { background: #f1f5f9; border-left: 4px solid #D4AF37; padding: 14px; border-radius: 4px; font-style: italic; }
    .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class='card'>
    <div class='header'>
      <h2>EZOUA / JJK Consulting</h2>
      <p style='margin: 4px 0 0; font-size: 13px; color: #e2e8f0;'>Nouvelle demande transmise depuis le site vitrine</p>
    </div>
    <div class='content'>
      <div class='field'>
        <div class='label'>Expéditeur</div>
        <div class='value'><strong>{$safeName}</strong></div>
      </div>
      <div class='field'>
        <div class='label'>Adresse e-mail</div>
        <div class='value'><a href='mailto:{$safeEmail}'>{$safeEmail}</a></div>
      </div>
      <div class='field'>
        <div class='label'>Téléphone</div>
        <div class='value'>{$safePhone}</div>
      </div>
      <div class='field'>
        <div class='label'>Organisation</div>
        <div class='value'>{$safeOrganization}</div>
      </div>
      <div class='field'>
        <div class='label'>Domaine d’intérêt</div>
        <div class='value'>{$safeInterest}</div>
      </div>
      <div class='field'>
        <div class='label'>Type d’accompagnement</div>
        <div class='value'>{$safeRequestType}</div>
      </div>
      <div class='field'>
        <div class='label'>Date & Heure</div>
        <div class='value'>{$dateFormatted}</div>
      </div>
      <div class='field'>
        <div class='label'>Message</div>
        <div class='message-box'>{$safeMessage}</div>
      </div>
    </div>
    <div class='footer'>
      Message reçu depuis le formulaire de contact officiel de {$cabinetName}.
    </div>
  </div>
</body>
</html>
";

// En-têtes de messagerie
$serverName = preg_replace('/[^a-zA-Z0-9.-]/', '', $_SERVER['SERVER_NAME'] ?? 'localhost');
if ($serverName === '') {
  $serverName = 'localhost';
}

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
  'From: ' . $cabinetName . ' <no-reply@' . $serverName . '>',
  'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion()
];

// Envoi effectif de l'email via la fonction native mail()
$mailSent = @mail($recipientEmail, $subject, $emailBody, implode("\r\n", $headers));

if (!$mailSent) {
  http_response_code(503);
  echo json_encode([
    'success' => false,
    'message' => 'Le service d’envoi d’e-mail est momentanément indisponible. Veuillez réessayer ou nous écrire directement à ezoua.consulting@outlook.com.'
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

echo json_encode([
  'success' => true,
  'message' => 'Merci, votre demande a bien été transmise. L’équipe vous répondra par les coordonnées communiquées.'
], JSON_UNESCAPED_UNICODE);
