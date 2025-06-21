<?php

header("Access-Control-Allow-Origin: http://trekkigram.com");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS, PUT, POST");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

class UserGateway extends Gateway
{
    private $userModel;
    private $eventModel;
    private $friendshipModel;
    public function __construct()
    {
        $this->userModel = new UserModel();
        $this->eventModel = new EventsModel();
        $this->friendshipModel = new FriendshipModel();
    }
    public function handle_request($parts)
    {
        if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
            respond(200, true, "Options request");
            exit();
        }

        // Replace JWT token verification with session token verification
        $loggedInUserId = verifySessionToken();
        if (!$loggedInUserId) {
            respond(401, false, "Sessione non valida o scaduta. Effettua nuovamente il login.");
            exit();
        }

        if ($_SERVER["REQUEST_METHOD"] == "GET") {
            if ($parts[1] == "search") {
                if (isset($_GET["username"])) {
                    $this->searchUsers($_GET["username"]);
                } else {
                    respond(400, false, "Parametro username mancante");
                }
            } else {
                $username = $parts[1];
                $tab = $_GET['tab'] ?? "posts";
                $this->getUser($username, $tab, $loggedInUserId);
            }
        } else if ($_SERVER["REQUEST_METHOD"] == "POST" && $parts[2] == "update") {
            $username = $parts[1];
            $this->updateProfileInfo($username, $loggedInUserId);
        } else {
            respond(405, false, "Metodo non supportato");
        }
    }

    private function searchUsers($userSearched)
    {
        $results = $this->userModel->searchUsers($userSearched);
        if (count($results) > 0) {
            respond(200, true, "Utenti trovati", ["Users" => $results]);
        } else {
            respond(404, false, "Nessun utente trovato");
        }
    }

    private function getUser($username, $tab, $loggedInUserId)
    {
        $requestedUser = $this->userModel->getUserByUsername($username);
        if (!$requestedUser) {
            respond(404, false, "Utente non trovato");
            exit();
        }
        $requestUserID = $requestedUser["UserID"];

        $profileData = [
            "UserID" => $requestUserID,
            "Username" => $requestedUser["Username"],
            "Email" => $requestedUser["Email"],
            "Name" => $requestedUser["Name"],
            "Surname" => $requestedUser["Surname"],
            "Privacy" => $requestedUser["Privacy"] == "1" ? "public" : "private",
            "ProfilePicture" => $requestedUser["Image"],
            "Description" => $requestedUser["Description"],
        ];

        $data = $profileData;
        $friendshipData = $this->friendshipModel->getFriendshipStatus($requestUserID, $loggedInUserId);

        if ($friendshipData) {
            // Se lo status è "accepted", allora consideriamo la friendship come "friend", altrimenti "pending"
            $friendStatus = ($friendshipData["Status"] === "accepted") ? "friend" : "pending";

            $data["friendshipStatus"] = [
                "status"    => $friendStatus,
                "direction" => $friendshipData["Direction"],
            ];
        } else {
            $data["friendshipStatus"] = null;
        }
        $isFriend = $friendshipData["Status"] === "accepted";



        $friendList = $this->friendshipModel->getFriendList($requestUserID);
        $canView = ($requestedUser["Privacy"] == "0") || $isFriend || ($requestUserID == $loggedInUserId);
        // $data["isFriend"] = $isFriend;
        $data["friendList"] = $friendList;
        $data["userPostCount"] = $this->eventModel->getUserPostCount($requestUserID);
        if ($canView) {
            if ($tab == "posts") {
                $userPosts  = $this->eventModel->getUserPosts($requestUserID);
                $data["posts"] = $userPosts;
            } else if ($tab == "partecipations") {
                $userPartecipations = $this->eventModel->getUserPartecipations($requestUserID);
                $data["partecipations"] = $userPartecipations;
            }
        } else {
            $data["posts"] = "Profilo Privato; non puoi visualizzare i post se non siete amici o";
            $data["partecipations"] = "Profilo Privato; non puoi visualizzare le partecipazioni se non siete amici o";
        }


        respond(200, true, "Informazioni profilo utente recuperate con successo.", ["UserInfo" => $data]);
    }
    private function updateProfileInfo($username, $loggedInUserId)
    {
        try {
            $user = $this->userModel->getUserByUsername($username);
            if (!$user) {
                respond(404, false, "Utente non trovato");
                exit();
            }

            if ($user["UserID"] != $loggedInUserId) {
                respond(403, false, "Non hai il permesso di aggiornare questo profilo");
                exit();
            }

            // Check for FormData vs JSON data
            $description = isset($_POST['description']) ? $_POST['description'] : null;
            $privacy = isset($_POST['privacy']) ? $_POST['privacy'] : null;
            $removeImage = isset($_POST['removeImage']) ? $_POST['removeImage'] : "false";

            // If not in POST, try to get from JSON input (for API flexibility)
            if (!$description && !$privacy) {
                $jsonInput = file_get_contents("php://input");
                if (!empty($jsonInput)) {
                    $jsonData = json_decode($jsonInput, true);
                    if ($jsonData) {
                        $description = isset($jsonData['description']) ? $jsonData['description'] : $user['Description'];
                        $privacy = isset($jsonData['privacy']) ? $jsonData['privacy'] : $user['Privacy'];
                        $removeImage = isset($jsonData['removeImage']) ? $jsonData['removeImage'] : "false";
                    }
                }
            }

            // Make sure we have values even if nothing was provided
            $description = $description ?? $user['Description'];
            $privacy = $privacy ?? $user['Privacy'];

            // Debug logs
            error_log("RemoveImage flag: " . $removeImage);
            error_log("Description: " . $description);
            error_log("Privacy: " . $privacy);

            // Gestione immagine profilo
            $oldImageJSON = $user['Image'];
            $oldImageName = $oldImageJSON ? json_decode($oldImageJSON, true) : null;
            $newImageName = null;

            // Caso 1: Caricata una nuova immagine
            if (isset($_FILES['newProfileImage']) && $_FILES['newProfileImage']['error'] === UPLOAD_ERR_OK) {
                $filename = $_FILES['newProfileImage']['name'];
                $tmpFilePath = $_FILES['newProfileImage']['tmp_name'];
                $ext = pathinfo($filename, PATHINFO_EXTENSION);
                $uniqueName = uniqid("profile_", true) . "." . $ext;
                $destination = "/var/www/html/src/img/UserImg/" . $uniqueName;

                if (move_uploaded_file($tmpFilePath, $destination)) {
                    $newImageName = $uniqueName;
                    // Elimino l'immagine vecchia se esiste
                    if ($oldImageName) {
                        $oldFile = "/var/www/html/src/img/UserImg/" . $oldImageName;
                        if (file_exists($oldFile)) {
                            unlink($oldFile);
                        }
                    }
                }
            }
            // Caso 2: Utente vuole rimuovere l'immagine
            elseif ($removeImage === "true") {
                error_log("Processing image removal");
                if ($oldImageName) {
                    $oldFile = "/var/www/html/src/img/UserImg/" . $oldImageName;
                    if (file_exists($oldFile)) {
                        unlink($oldFile);
                    }
                }
                $newImageName = null;
            }
            // Caso 3: Nessuna modifica all'immagine
            else {
                $newImageName = $oldImageName;
            }

            // If we're removing the image, set to null properly
            $imageToStore = $newImageName ? json_encode($newImageName) : null;

            // Preparazione dei dati per l'aggiornamento
            $updates = [
                'Description' => $description,
                'Privacy' => $privacy === "public" ? "1" : "0",
                'Image' => $imageToStore,
            ];

            // Aggiorna i dati dell'utente
            $result = $this->userModel->updateUser($user['UserID'], $updates);

            // Prepara i dati di risposta
            $responseData = [
                'description' => $updates['Description'],
                'privacy' => $updates['Privacy'],
                'image' => $newImageName,
                'removeImage' => $removeImage
            ];

            respond(200, true, "Informazioni profilo utente aggiornate con successo.", $responseData);
        } catch (Exception $e) {
            error_log("Profile update error: " . $e->getMessage());
            respond(500, false, "Errore durante l'aggiornamento del profilo: " . $e->getMessage());
        }
    }
}
