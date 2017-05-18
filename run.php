<?php

include __DIR__ . '/vendor/autoload.php';

$dotenv = new Dotenv\Dotenv(__DIR__);
$dotenv->load();

$discord = new \Discord\Discord([
    'token' => getenv('DISCORD_TOKEN'),
]);

$discord->registerCommand('ping', function ($message) {
    return 'pong!';
}, [
    'description' => 'pong!',
]);

$discord->on('ready', function ($discord) {
    echo "Bot is ready.", PHP_EOL;

    // Listen for events here
    $discord->on('message', function ($message) {
        echo "Recieved a message from {$message->author->username}: {$message->content}", PHP_EOL;
    });
});

$discord->run();