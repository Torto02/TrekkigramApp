<?php
header("Access-Control-Allow-Origin: http://trekkigram.com");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS, POST, PUT");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

function generateSessionToken($userId)
{
    // Generate a random token
    $token = bin2hex(random_bytes(32));

    // Store in session
    $_SESSION['user_id'] = $userId;
    $_SESSION['session_token'] = $token;
    $_SESSION['created_at'] = time();
    $_SESSION['expires_at'] = time() + 60 * 60  * 24 * 365; // 1 year expiration

    return $token;
}

function verifySessionToken()
{
    // Check if session exists and is valid
    if (!isset($_SESSION['session_token']) || !isset($_SESSION['user_id']) || !isset($_SESSION['expires_at'])) {
        respond(401, false, "Sessione non valida");
        return null;
    }

    // Check if session has expired
    if (time() >= $_SESSION['expires_at']) {
        // Clear expired session
        session_unset();
        session_destroy();
        respond(401, false, "Sessione scaduta");
        return null;
    }

    // Extend session lifetime on activity
    $_SESSION['expires_at'] = time() + 60 * 60; // Extend for another hour

    return $_SESSION['user_id'];
}