<?php

header("Access-Control-Allow-Origin: http://trekkigram.com");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS, POST, PUT, DELETE");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

class ParticipationGateway extends Gateway
{
    private $participationModel, $eventsModel, $friendshipModel, $userModel;
    public function __construct()
    {
        $this->participationModel = new ParticipationModel();
        $this->eventsModel = new EventsModel();
        $this->friendshipModel = new FriendshipModel();
        $this->userModel = new UserModel();
    }
    public function handle_request($parts)
    {
        if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
            http_response_code(200);
            exit();
        }

        // Replace JWT token verification with session token verification
        $userId = verifySessionToken();
        if (!$userId) {
            respond(401, false, "Sessione non valida o scaduta. Effettua nuovamente il login.");
            exit();
        }

        switch ($_SERVER["REQUEST_METHOD"]) {
            case 'GET':
                if (isset($parts[1]) && $parts[1] == "friendList" && $parts[2] == "status")
                    $this->getFriendListStatus($userId);
                else if (isset($parts[1]) && $parts[1] == "active")
                    $this->getActivePartecipations($userId);
                else if (isset($parts[1]) && $parts[1] == "request")

                    $this->getEventInvitations($userId);
                else
                    $this->getPartecipantsByEvent();

                break;
            case 'POST':
                if (isset($parts[1]) && $parts[1] == "invite")
                    $this->inviteFriend($userId);
                else
                    $this->addPartecipation($userId);
                break;
            case 'PUT':
                if ($parts[1] == "accept")
                    $this->acceptInvitation($userId);
                break;
            case 'DELETE':
                if ($parts[1] == "reject") {
                    $this->rejectInvitation($userId);
                } else {
                    $this->deletePartecipation($userId);
                }
                break;
        }
    }



    private function getEventInvitations($userId)
    {
        $invitations = $this->participationModel->getEventInvitations($userId);
        // respond(200, true, "Invitations retrieved successfully", ["Invitations" => $invitations]);
        $processedInvitations = []; // Rinomina la variabile per chiarezza e inizializza come array vuoto

        foreach ($invitations as $invitation) {


            $invitedBy = $this->userModel->getUserById($invitation['InvitedBy']);
            // $invitation['SenderUsername'] = $invitedBy['Username']; // Questa riga non sembra necessaria per la response finale
            $event = $this->eventsModel->getEventInfo($invitation['EventID']);

            // Crea un array per l'invito corrente

            $currentInvitation = [
                "ID" => $invitation['ID'],
                'Sender' => [
                    "UserID" => $invitedBy['UserID'],
                    "Username" => $invitedBy['Username'],
                ],
                'Event' => [
                    "EventID" => $event['EventID'],
                    "EventName" => $event['EventName'],
                    "EventDate" => $event['DateTime'],
                    "EventImage" => $event['EventImages'],
                ],
                // Puoi aggiungere altri dettagli dell'invito se necessario, ad esempio l'ID della partecipazione

            ];

            // Aggiungi l'invito corrente all'array degli inviti processati
            $processedInvitations[] = $currentInvitation;
        }
        // Usa l'array corretto nella response
        respond(200, true, "Inviti recuperati con successo", ["Invitations" => $processedInvitations]);
    }


    private function getActivePartecipations($userId)
    {
        $activePartecipations = $this->eventsModel->getUserPartecipations($userId);
        // Filter out past events
        $currentDateTime = new DateTime();
        $activePartecipations = array_filter($activePartecipations, function ($event) use ($currentDateTime) {
            $eventDateTime = new DateTime($event['DateTime']);
            return $eventDateTime > $currentDateTime;
        });

        respond(200, true, "Partecipazioni attive recuperate con successo", ["Events" => array_values($activePartecipations)]);
    }

    private function rejectInvitation($userId)
    {
        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->eventId)) {
            respond(400, false, "ID dell'evento non specificato");
            exit();
        }
        $eventId = $data->eventId;
        $participationID = $data->participationID;
        $status = $this->participationModel->checkIfSubscribed($eventId, $userId);
        if ($status['Status'] != "pending") {
            respond(400, false, "Non sei stato invitato a questo evento");
            exit();
        }
        $this->participationModel->rejectInvitation($userId, $participationID);
        respond(200, true, "Invito rifiutato con successo");
    }

    private function acceptInvitation($userId)
    {
        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->eventId)) {
            respond(400, false, "ID dell'evento non specificato");
            exit();
        }
        $eventId = $data->eventId;
        $participationID = $data->participationID;
        $status = $this->participationModel->checkIfSubscribed($eventId, $userId);
        if ($status['Status'] == "participate") {
            respond(400, false, "L'utente è già iscritto all'evento");
            exit();
        } else if ($status['Status'] != "pending") {
            respond(400, false, "Non sei stato invitato a questo evento");
            exit();
        }
        $this->participationModel->acceptInvitation($userId, $participationID);
        $this->participationModel->clearInvitations($userId, $eventId);
        respond(200, true, "Invito accettato con successo");
    }

    private function inviteFriend($userId)
    {
        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->userId) || !isset($data->eventId)) {
            respond(400, false, "ID dell'amico o dell'evento non specificati");
            exit();
        }

        $status = $this->participationModel->checkIfSubscribed($data->eventId, $data->friendId);
        if ($status['Status'] == "participate") {
            respond(400, false, "L'utente è già iscritto all'evento");
            exit();
        } else if ($status['Status'] == "pending" && $status['InvitedBy'] == $userId) {
            respond(400, false, "Utente già invitato");
            exit();
        }
        $this->participationModel->sendInvitation($userId, $data->userId, $data->eventId);
        respond(200, true, "Invito inviato con successo");
    }

    private function addPartecipation($userId)
    {
        $eventId = json_decode(file_get_contents("php://input"))->eventId;
        
        // Verifica se l'utente è il creatore dell'evento
        $event = $this->eventsModel->getEventInfo($eventId);
        if (!$event) {
            respond(404, false, "Evento non trovato");
            return;
        }
        
        if ($event['CreatorID'] == $userId) {
            respond(400, false, "Non puoi iscriverti al tuo stesso evento");
            return;
        }
        
        $status = $this->participationModel->checkIfSubscribed($eventId, $userId);

        if ($status['Status'] != "participate") {
            $this->participationModel->clearInvitations($userId, $eventId);
            $this->participationModel->addPartecipation($userId, $eventId);
            respond(200, true, "Partecipazione aggiunta con successo");
        } else {
            respond(400, false, "Sei già iscritto a questo evento");
        }
    }
    private function deletePartecipation($userId)
    {
        $eventId = json_decode(file_get_contents("php://input"))->eventId;
        $status = $this->participationModel->checkIfSubscribed($eventId, $userId);
        if ($status['Status'] == "participate") {
            $this->participationModel->deletePartecipation($userId, $eventId);
            respond(200, true, "Partecipazione rimossa con successo");
        } else {
            respond(400, false, "Non sei iscritto a questo evento");
        }
    }

    private function getPartecipantsByEvent()
    {
        $eventId = $_GET['eventId'];
        $exist = $this->eventsModel->getEventInfo($eventId);
        if (!$exist) {
            respond(404, false, "Evento non trovato");
            exit();
        }
        $partecipants = $this->participationModel->getPartecipantsByEvent($eventId);
        respond(200, true, "Partecipanti recuperati con successo", ["Participants" => $partecipants]);
    }

    private function getFriendListStatus($userId)
    {
        if (!isset($_GET['eventId'])) {
            respond(400, false, "Evento non specificato");
            exit();
        } else if (!$this->eventsModel->getEventInfo($_GET['eventId'])) {
            respond(404, false, "Evento non trovato");
            exit();
        } else {
            $friendList = $this->friendshipModel->getFriendList($userId);
            $eventId = $_GET['eventId'];

            foreach ($friendList as &$friend) {
                $friendId = $friend['UserID'];
                $subscriptionInfo = $this->participationModel->checkIfSubscribed($eventId, $friendId);
                $friend['Status'] = $subscriptionInfo['Status'];
                $friend['InvitedBy'] = $subscriptionInfo['InvitedBy'] ?? null;
            }

            respond(200, true, "Lista di amici recuperata con successo", ["FriendList" => $friendList]);
        }
    }
}
