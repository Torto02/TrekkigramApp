<?php

header("Access-Control-Allow-Origin: http://trekkigram.com");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

class AuthGateway extends Gateway
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
    }

    public function handle_request($parts)
    {
        if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
            http_response_code(200);
            exit();
        }

        switch ($parts[1]) {
            case "login":
                if ($_SERVER["REQUEST_METHOD"] == "POST") {
                    $this->handleLogin();
                }
                break;
            case "register":
                if ($_SERVER["REQUEST_METHOD"] == "POST") {
                    $this->handleRegistration();
                }
                break;
            case "logout":
                if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
                    $this->handleLogout();
                }
                break;
            // Add this to the handle_request method in AuthGateway.php
            case "check-session":
                if ($_SERVER["REQUEST_METHOD"] == "GET") {
                    $this->checkSession();
                }
                break;


            default:
                respond(404, false, "Endpoint not found");
        }
    }

    private function checkSession()
    {
        $userId = verifySessionToken();
        if ($userId) {
            respond(200, true, "Session valid", [
                'authenticated' => true,
                'userinfo' => [
                    'UserID' => $userId,
                    'Username' => $_SESSION['username'] ?? null
                ]
            ]);
        } else {
            respond(200, false, "Session invalid or expired", [
                'authenticated' => false
            ]);
        }
    }

    private function handleLogin()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $email = $data["email"];
        $password = $data["password"];

        $user = $this->userModel->getUserByEmail($email);

        if ($user && password_verify($password, $user['PasswordHash'])) {
            // Generate session token
            $token = generateSessionToken($user['UserID']);

            // Store additional user info in session
            $_SESSION['UserEmail'] = $user['Email'];
            $_SESSION['username'] = $user['Username'];

            respond(200, true, "Login effettuato con successo", [
                'success' => true,
                'token' => $token,
                'userinfo' => [
                    'UserID' => $user['UserID'],
                    'Username' => $user['Username']
                ]
            ]);
        } else {
            respond(401, false, "Credenziali non valide");
        }
    }

    private function handleRegistration()
    {
        $required = ['email', 'name', 'surname', 'username', 'password', 'confirmPassword', 'privacy'];
        foreach ($required as $field) {
            if ($field === 'privacy') {
                // Special check for privacy field since '0' is considered empty by PHP
                if (!isset($_POST[$field]) || $_POST[$field] === '') {
                    respond(400, false, "Campo mancante: $field");
                }
            } else if (empty($_POST[$field])) {
                respond(400, false, "Campo mancante: $field");
            }
        }
        if ($_POST['password'] !== $_POST['confirmPassword']) {
            respond(400, false, "Le password non coincidono");
        }

        // Gestione immagine profilo
        $profileImagePath = null;
        if (isset($_FILES['profileImage']) && $_FILES['profileImage']['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES['profileImage']['name'], PATHINFO_EXTENSION);
            $uniqueName = uniqid("profile_", true) . "." . $ext;
            $destination = "/var/www/html/src/img/UserImg/" . $uniqueName;
            if (move_uploaded_file($_FILES['profileImage']['tmp_name'], $destination)) {
                $profileImagePath = $uniqueName;
            }
        }

        $data = [
            'username' => $_POST['username'],
            'email' => $_POST['email'],
            'password' => $_POST['password'],
            'name' => $_POST['name'],
            'surname' => $_POST['surname'],
            'privacy' => $_POST['privacy'],
            'image' => json_encode($profileImagePath)
        ];

        // Verifica unicità
        if ($this->userModel->getUserByEmail($data['email'])) {
            respond(409, false, "Esiste già un account con questa email");
        } elseif ($this->userModel->getUserByUsername($data['username'])) {
            respond(409, false, "Username non disponibile");
        }

        $userId = $this->userModel->createAccount($data);
        if ($userId) {
            // Generate session token
            $token = generateSessionToken($userId);

            // Store additional user info in session
            $_SESSION['UserEmail'] = $data['email'];
            $_SESSION['username'] = $data['username'];

            respond(200, true, "Registrazione effettuata con successo", [
                'success' => true,
                'token' => $token,
                'userinfo' => [
                    'UserID' => $userId,
                    'Username' => $data['username']
                ]
            ]);
        } else {
            respond(500, false, "Errore durante la registrazione");
        }
    }

    private function handleLogout()
    {
        $userId = verifySessionToken();

        if (!$userId) {
            respond(401, false, "Sessione non valida o scaduta. Effettua nuovamente il login.");
            exit();
        } else {
            // Clear session data
            session_unset();
            session_destroy();

            respond(200, true, "Logout effettuato con successo");
        }
    }
}
