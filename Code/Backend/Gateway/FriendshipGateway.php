<?php

header("Access-Control-Allow-Origin: http://trekkigram.com");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS, POST, PUT, DELETE");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");


class FriendshipGateway extends Gateway
{
    private $friendshipModel;
    private $userModel;

    public function __construct()
    {
        $this->friendshipModel = new FriendshipModel();
        $this->userModel = new UserModel();
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

        $userID = $this->userModel->getUserByUsername($parts[1])["UserID"];
        switch ($_SERVER["REQUEST_METHOD"]) {
            case "GET":
                if ($parts[1] == "friendList")
                    $this->getFriendship($parts[2]);
                else if ($parts[1] == "request")
                    $this->getFriendRequests($loggedInUserId);
                break;
            case "POST":
                $this->sendFriendRequest($loggedInUserId, $userID);
                break;
            case "PUT":
                $this->acceptFriendRequest($userID, $loggedInUserId);
                break;
            case "DELETE":
                if (isset($parts[2]) && $parts[2] == "reject") {
                    $this->rejectFriendRequest($userID, $loggedInUserId);
                } else if (isset($parts[2]) && $parts[2] == "cancel") {
                    $this->cancelFriendRequest($userID, $loggedInUserId);
                } else {
                    $this->removeFriend($userID, $loggedInUserId);
                }
                break; // Add this break statement
            default:
                respond(405, false, "Metodo non consentito.");
                break;
        }
    }
    private function getFriendRequests($userId)
    {
        $request = $this->friendshipModel->getFriendRequests($userId);
        // respond(200, true, "Richieste di amicizia recuperate con successo", ["FriendRequests" => $request]);
        if (empty($request)) {
            respond(200, true, "Nessuna richiesta di amicizia in sospeso");
        } else {
            $friendRequests = [];
            foreach ($request as $req) {
                $friend = $this->userModel->getUserById($req['SenderID']);
                $friendRequests[] = [
                    "ID" => $req['ID'],
                    "User" => [
                        "UserID" => $friend['UserID'],
                        "Username" => $friend['Username'],
                        "Name" => $friend['Name'],
                        "Surname" => $friend['Surname'],
                        "ProfilePicture" => $friend['Image'],
                    ],
                    "FriendshipStatus" => $req['Status'],

                ];
            }
            respond(200, true, "Richieste di amicizia recuperate con successo", ["FriendRequests" => $friendRequests]);
        }
    }

    private function getFriendship($requiredUsername)
    {
        $userID = $this->userModel->getUserByUsername($requiredUsername)["UserID"];

        $friendship = $this->friendshipModel->getFriendList($userID);
        if (empty($friendship)) {
            respond(404, false, "Nessuna amicizia trovata");
        } else {
            // $friendship = $this->userModel->getUserByID($friendship["FriendID"]);
            respond(200, true, $friendship);
        }
    }

    private function sendFriendRequest($loggedInUserId, $userID)
    {
        $status = $this->friendshipModel->getFriendshipStatus($userID, $loggedInUserId);
        if (isset($status["Status"]) && $status["Status"] == "pending") {
            respond(400, false, "Richiesta già esistente");
            return;
        } else if (isset($status["Status"]) && $status["Status"] == "accepted") {
            respond(400, false, "Siete già amici");
            return;
        } else {
            $this->friendshipModel->sendFriendRequest($loggedInUserId, $userID);
            respond(200, true, "Richiesta di amicizia inviata con successo");
        }
    }

    private function acceptFriendRequest($userID, $loggedInUserId)
    {
        $status = $this->friendshipModel->getFriendshipStatus($userID, $loggedInUserId);

        if (isset($status["Status"]) && $status["Status"] == "accepted") {
            respond(400, false, "Siete già amici");
        } else if (isset($status["Status"]) && $status["Status"] == "pending" && $status['Direction'] == "sended") {
            respond(400, false, "Non puoi accettare una richiesta di amicizia che non hai ricevuto");
        } else {
            $this->friendshipModel->acceptFriendRequest($userID, $loggedInUserId);
            respond(200, true, "Richiesta di amicizia accettata con successo");
        }
    }

    private function rejectFriendRequest($userID, $loggedInUserId)
    {
        $status = $this->friendshipModel->getFriendshipStatus($userID, $loggedInUserId);
        if (!isset($status["Status"]) || $status["Status"] == "accepted") {
            respond(400, false, "Richiesta non esistente");
        } else if ($status["Status"] == "pending" && $status['Direction'] == "sended") {
            respond(400, false, "Non puoi rifiutare una richiesta di amicizia inviata da te");
        } else {
            $this->friendshipModel->rejectFriendRequest($userID, $loggedInUserId);
            respond(200, true, "Richiesta di amicizia rifiutata con successo");
        }
    }

    private function removeFriend($userID, $loggedInUserId)
    {
        $status = $this->friendshipModel->getFriendshipStatus($userID, $loggedInUserId);
        if (!isset($status["Status"]) || $status["Status"] == "pending") {
            respond(400, false, "Amicizia non esistente");
        } else {
            $this->friendshipModel->removeFriend($userID, $loggedInUserId);
            respond(200, true, "Amicizia eliminata con successo");
        }
    }
    private function cancelFriendRequest($userID, $loggedInUserId)
    {
        $status = $this->friendshipModel->getFriendshipStatus($userID, $loggedInUserId);
        if (!isset($status["Status"]) || $status["Status"] == "accepted" || $status["Status"] == "pending" && $status['Direction'] == "received") {
            respond(400, false, "Richiesta non esistente");
        } else {
            $this->friendshipModel->cancelFriendRequest($userID, $loggedInUserId);
            respond(200, true, "Richiesta di amicizia cancellata con successo");
        }
    }
}
