<?php
header("Access-Control-Allow-Origin: http://trekkigram.com");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS, POST, PUT");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

function respond($statusCode, $success, $message, $extra = [])
{
    if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
        http_response_code(200);
        exit();
    }
    http_response_code($statusCode);
    $response = [
        'success' => $success,
        'message' => $message
    ];
    if (!empty($extra)) {
        $response = array_merge($response, $extra);
    }
    echo json_encode($response);
    exit();
}
