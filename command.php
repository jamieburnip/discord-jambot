<?php

include __DIR__ . '/vendor/autoload.php';

$dotenv = new Dotenv\Dotenv(__DIR__);
$dotenv->load();

use DiceBag\DiceBag;
use DiceBag\Randomization\MersenneTwister;
use Discord\DiscordCommandClient;

$discord = new DiscordCommandClient([
    'token' => getenv('DISCORD_TOKEN'),
]);

$discord->registerCommand('roll', function ($message) {
    $params = explode(' ', $message->content);

//    @jamies-first-bot#2774 roll d20

     $randomizationEngine = new MersenneTwister();
    $diceBag = DiceBag::factory($params[2], $randomizationEngine);

    $message->getChannelAttribute()->sendMessage($diceBag->getTotal());
}, [
    'description' => 'pong!',
]);

$discord->run();