<?php

header("Access-Control-Allow-Origin: http://trekkigram.com");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS, PUT, DELETE, POST");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

class EventsGateway extends Gateway
{
    private $eventsModel, $userModel, $participationModel;

    public function __construct()
    {
        $this->eventsModel = new EventsModel();
        $this->userModel = new UserModel();
        $this->participationModel = new ParticipationModel();
    }

    public function handle_request($parts)
    {
        if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
            http_response_code(200);
            exit();
        }


        $userId = verifySessionToken();
        if (!$userId) {
            respond(401, false, "Sessione non valida o scaduta. Effettua nuovamente il login.");
            exit();
        }

        switch ($parts[1]) {
            case 'posts':
                if ($_SERVER["REQUEST_METHOD"] == "GET") {
                    $this->getPosts($_GET, $userId);
                }
                break;
            case '':
                if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['eventId'])) {
                    $this->getEventInfo($userId);
                }
                break;
            case 'update':
                if ($_SERVER["REQUEST_METHOD"] == "PUT") {
                    $this->updateEvent($userId);
                }
                break;
            case 'delete':
                if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
                    $this->deleteEvent($userId);
                }
                break;
            case 'create':
                if ($_SERVER["REQUEST_METHOD"] == "POST") {
                    $this->createEvent($userId);
                }
                break;
            default:
                respond(405, false, "Metodo non supportato");
        }
    }

    private function createEvent($userId)
    {
        try {

            $eventName        = $_POST['eventName']        ?? null;
            $eventDescription = $_POST['eventDescription'] ?? null;
            $eventLocation    = $_POST['eventLocation']    ?? null;
            $eventDifficulty  = $_POST['eventDifficulty']  ?? null;
            $eventDateTime    = $_POST['eventDateTime']    ?? null;
            $latitude         = $_POST['Latitude']         ?? null;
            $longitude        = $_POST['Longitude']        ?? null;

            if ($eventDateTime) {
                try {
                    $dateObj = new DateTime($eventDateTime);
                    $eventDateTime = $dateObj->format('Y-m-d H:i:s');
                } catch (Exception $e) {
                    error_log("Errore nella conversione della data: " . $e->getMessage());
                    respond(400, false, "Formato data non valido");
                    return;
                }
            }

            error_log("Dati ricevuti: " . json_encode($_POST));
            error_log("File ricevuti: " . json_encode($_FILES));


            if (!$eventName || !$eventLocation || !$eventDateTime) {
                respond(400, false, "Dati mancanti per la creazione dell'evento");
                return;
            }

            $uploadedImagesPaths = [];

            // Gestione immagini
            if (!empty($_FILES['eventPhotos']['name'][0])) {
                $fileCount = count($_FILES['eventPhotos']['name']);
                for ($i = 0; $i < $fileCount; $i++) {
                    $filename    = $_FILES['eventPhotos']['name'][$i];
                    $tmpFilePath = $_FILES['eventPhotos']['tmp_name'][$i];
                    $error       = $_FILES['eventPhotos']['error'][$i];

                    if ($error === UPLOAD_ERR_OK) {
                        $ext = pathinfo($filename, PATHINFO_EXTENSION);
                        $uniqueName = uniqid("event_", true) . "." . $ext;
                        $destination = "/var/www/html/src/img/eventImg/" . $uniqueName;

                        if (move_uploaded_file($tmpFilePath, $destination)) {
                            $uploadedImagesPaths[] = $uniqueName;
                        }
                    }
                }
            }

            $imagesJson = json_encode($uploadedImagesPaths);

            // IMPORTANTE: Prima crea l'evento e POI rispondi
            $success = $this->eventsModel->createEvent(
                $eventName,
                $eventDescription,
                $eventLocation,
                $eventDateTime,
                $latitude,
                $longitude,
                $userId,
                $eventDifficulty,
                $imagesJson
            );

            if ($success) {
                respond(200, true, "Evento creato con successo");
            } else {
                respond(500, false, "Errore durante la creazione dell'evento");
            }
        } catch (Exception $e) {
            error_log("Errore in createEvent: " . $e->getMessage());
            respond(500, false, "Errore durante l'elaborazione della richiesta: " . $e->getMessage());
        }
    }


    private function getPosts($queryParams, $userId)
    {
        $page = $queryParams['page'] ?? 1;
        $perPage = $queryParams['perPage'] ?? 3;
        $type = $queryParams['tab'] ?? 'perTe'; // 'for_you' o 'followed'
        $difficulty = $queryParams['difficulty'] ?? 'all';
        $startDate = $queryParams['startDate'] ?? null;
        $endDate = $queryParams['endDate'] ?? null;
        $location = $queryParams['region'] ?? 'all';

        $offset = ($page - 1) * $perPage;

        $filters = [
            'tab' => $type,
            'difficulty' => $difficulty,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'location' => $location,
            'offset' => $offset,
            'perPage' => $perPage,
            'userId' => $userId
        ];

        [$posts, $countPost] = $this->eventsModel->getPosts($filters);
        
        // Add subscription status to each post
        foreach ($posts as &$post) {
            $subscribed = $this->participationModel->checkIfSubscribed($post['EventID'], $userId);
            $post['subscribed'] = $subscribed ? $subscribed['Status'] : null;
        }
        
        $hasMore = $countPost > ($offset + $perPage) ? true : false;

        respond(
            200,
            true,
            "Post caricati con successo",
            ["post" => $posts, "hasMore" => $hasMore]
        );
    }

    private function getEventInfo($userId)
    {
        $eventID = $_GET['eventId'];

        try {
            $event = $this->eventsModel->getEventInfo($eventID);
            if (!$event)
                respond(404, false, "Evento non trovato");
            $username = $this->userModel->getUserByID($event['CreatorID']);
            $event['CreatorUsername'] = $username['Username'];
            $event['CreatorProfilePicture'] = $username['Image'];
            $subscribed = $this->participationModel->checkIfSubscribed($eventID, $userId);
            $event['subscribed'] = $subscribed['Status'];
            if ($event) {
                respond(200, true, "Informazioni evento recuperate con successo", ["eventInfo" => $event]);
            } else {
                respond(404, false, "Evento non trovato");
            }
        } catch (Exception $e) {
            respond(500, false, "Errore durante il recupero delle informazioni dell'evento: " . $e->getMessage());
        }
    }

    private function updateEvent($userId)
    {
        $data = json_decode(file_get_contents("php://input"));
        $eventId = $_GET['eventId'];
        if (!$eventId) {
            respond(400, false, "ID dell'evento non specificato");
            exit();
        }
        $exist = $this->eventsModel->checkEventExists($eventId);

        if (!$exist) {
            respond(404, false, "Evento non trovato");
            exit();
        }

        $isCreator = $this->eventsModel->checkIfCreator($userId, $eventId);
        if (!$isCreator) {
            respond(403, false, "Non sei il creatore dell'evento");
            exit();
        }

        $updates = [
            "EventName" => $data->EventName,
            "EventDescription" => $data->EventDescription,
            "DateTime" => $data->DateTime,
            "Difficulty" => $data->Difficulty,
        ];

        $this->eventsModel->updateEvent($eventId, $updates);

        respond(200, true, "Evento aggiornato con successo");
    }

    private function deleteEvent($userId)
    {
        $eventId = $_GET['eventId'];
        if (!$eventId) {
            respond(400, false, "ID dell'evento non specificato");
            exit();
        }
        $exist = $this->eventsModel->checkEventExists($eventId);

        if (!$exist) {
            respond(404, false, "Evento non trovato");
            exit();
        }

        $isCreator = $this->eventsModel->checkIfCreator($userId, $eventId);
        if (!$isCreator) {
            respond(403, false, "Non sei il creatore dell'evento");
            exit();
        }
        $this->eventsModel->deleteEvent($eventId);
        respond(200, true, "Evento eliminato con successo");
    }
}
