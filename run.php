<?php

use DiceBag\DiceBag;
use DiceBag\Randomization\MersenneTwister;
use Discord\Discord;
use Discord\Parts\Channel\Message;
use Dotenv\Dotenv;
use Monolog\Handler\FirePHPHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Logger;

include __DIR__ . '/vendor/autoload.php';

// Create the logger
$logger = new Logger('my_logger');
// Now add some handlers
$logger->pushHandler(new StreamHandler(__DIR__ . '/channel_logs/my_app.log', Logger::DEBUG));
$logger->pushHandler(new FirePHPHandler());

$dotenv = new Dotenv(__DIR__);
$dotenv->load();

$discord = new Discord([
    'token' => getenv('DISCORD_TOKEN'),
    'logger' => $logger,
]);

//$discord = new DiscordCommandClient([
//    'token' => getenv('DISCORD_TOKEN'),
//]);

//$discord->registerCommand('roll', function ($message) {
//    $params = explode(' ', $message->content);

//    @jamies-first-bot#2774 roll d20

//    $randomizationEngine = new MersenneTwister();
//    $diceBag = DiceBag::factory($params[2], $randomizationEngine);

//    $message->getChannelAttribute()->sendMessage($diceBag->getTotal());
//}, [
//    'description' => 'pong!',
//]);

//$discord->run();

$discord->on('ready', function ($discord) {
    echo "Bot is ready.", PHP_EOL;

    // Listen for events here
    $discord->on('message', function (Message $message, Discord $discord) {
        if ($message->author === $discord->user) {
            return 0;
        }

        $params = explode(' ', $message->content);
        
        /* Sleep 1 second to give the illusion of thinking */
        sleep(1);
        
        switch($params[0){
            default:
                return 0;
                break;
            case '!roll':
                $randomizationEngine = new MersenneTwister();
                $diceBag = DiceBag::factory($params[1], $randomizationEngine);
                $message->getChannelAttribute()->sendMessage($diceBag->getTotal() . ' :game_die:');

                return 1;
                break;
        }
    });
});

$discord->run();
