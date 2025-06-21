<?php

class Controller
{
    private $api = "";
    public function set_api($api)
    {
        $this->api = $api;
    }

    public function handle_request()
    {
        $uri = preg_replace("/^" . preg_quote($this->api, "/") . "/", "", $_SERVER['REQUEST_URI']);
        $uri = preg_replace('/\\/$/', "", $uri);

        // Separate the path and query string
        $uri_parts = explode('?', $uri, 2);
        $path = $uri_parts[0];
        $query_string = isset($uri_parts[1]) ? $uri_parts[1] : '';

        // Parse query string into $_GET
        parse_str($query_string, $_GET);

        $elements = explode('/', $path);

        switch ($elements[0]) {
            case 'events':
                $gateway = new EventsGateway();
                break;
            case 'auth':
                $gateway = new AuthGateway();
                break;
            case 'user':
                $gateway = new UserGateway();
                break;

            case 'participations':
                $gateway = new ParticipationGateway();
                break;
            case 'friendship':
                $gateway = new FriendshipGateway();
                break;
            default:
                http_response_code(404);
                echo json_encode(array(
                    "succes" => false,
                    "error" => array(
                        "code" => "404",
                        "message" => "Not Found"
                    )
                ));
                exit();
        }
        try {
            $gateway->handle_request($elements);
        } catch (Exception $e) {
            var_dump($e);
            return;
        }
    }
}
