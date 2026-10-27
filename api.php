<?php
header('Content-Type: application/json');

// ==========================================
// CONFIGURACIÓN DE SUPABASE 
// ==========================================
$supabaseUrl = 'https://jeahmnkumhuihxvliouo.supabase.co';
$supabaseKey = 'sb_publishable_FV3iFcEz5o0XtTBo2qohtA__WIsKkhU';
// ==========================================

$jsonInput = file_get_contents('php://input');
$data = json_decode($jsonInput, true);

if (!$data || empty($data['codigo']) || empty($data['canciones'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos obligatorios.']);
    exit;
}

$payload = json_encode([
    'p_codigo' => strtoupper(trim($data['codigo'])),
    'p_nombre' => !empty($data['nombre']) ? trim($data['nombre']) : null,
    'p_canciones' => $data['canciones']
]);

$ch = curl_init($supabaseUrl . '/rest/v1/rpc/canjear_codigo');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: ' . $supabaseKey,
    'Authorization: Bearer ' . $supabaseKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 400) {
    http_response_code(400);
    $errorData = json_decode($response, true);
    $mensajeOriginal = isset($errorData['message']) ? $errorData['message'] : 'Error desconocido de Supabase';
    
    if (strpos($mensajeOriginal, 'código inválido') !== false) {
        $mensajeFiltro = 'El código ingresado no existe.';
    } elseif (strpos($mensajeOriginal, 'código ya usado') !== false) {
        $mensajeFiltro = 'Este código ya fue utilizado anteriormente.';
    } else {
        $mensajeFiltro = $mensajeOriginal;
    }
    
    echo json_encode(['error' => $mensajeFiltro]);
    exit;
}

echo json_encode(['success' => true]);
?>