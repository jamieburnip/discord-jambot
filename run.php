<?php

use DiceBag\DiceBag;
use DiceBag\Randomization\MersenneTwister;
use Discord\DiscordCommandClient;
use Monolog\Handler\StreamHandler;
use Monolog\Logger;

include __DIR__ . '/vendor/autoload.php';

// Create the logger
$logger = new Logger('my_logger');
// Now add some handlers
$logger->pushHandler(new StreamHandler(__DIR__ . '/channel_logs/my_app.log', Logger::DEBUG));
$logger->pushHandler(new FirePHPHandler());

$dotenv = new Dotenv\Dotenv(__DIR__);
$dotenv->load();

// Create the logger
$logger = new Logger('my_logger');
// Now add some handlers
$logger->pushHandler(new StreamHandler(__DIR__ . '/my_app.log', Logger::DEBUG));

//$discord = new \Discord\Discord([
//    'token' => getenv('DISCORD_TOKEN'),
//    'logger' => $logger,
//]);

$discord = new DiscordCommandClient([
    'token' => getenv('DISCORD_TOKEN'),
//    'logger' => $logger,
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

//$discord->registerCommand('roll', function ($message) {
//    $randomizationEngine = new MersenneTwister();
//
//    $diceBag = DiceBag::factory('d20', $randomizationEngine);
//
//    return $diceBag->getTotal();
//}, [
//    'description' => 'Roll the dice!',
//]);

/*$discord->on('ready', function ($discord) {
    echo "Bot is ready.", PHP_EOL;

    // Listen for events here
    $discord->on('message', function ($message, $discord) {
        /** @var \Discord\Parts\Channel\Channel $channel *
        $channel = $discord->factory(\Discord\Parts\Channel\Channel::class, ['id' => $message['channel_id']]);

        $randomizationEngine = new MersenneTwister();

        $diceBag = DiceBag::factory('d20', $randomizationEngine);

        $channel->sendMessage($diceBag->getTotal());
    });
});*/

//$discord->run();