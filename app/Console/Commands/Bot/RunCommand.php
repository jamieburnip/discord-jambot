<?php

namespace App\Console\Commands\Bot;

use DiceBag\DiceBag;
use DiceBag\Randomization\MersenneTwister;
use Discord\Discord;
use Discord\Parts\Channel\Message;
use Illuminate\Console\Command;

class RunCommand extends Command
{
    /**
     * The console command name.
     *
     * @var string
     */
    protected $signature = 'bot:run';
    /*{connection? : The name of connection}
    {--delay=0 : Amount of time to delay failed jobs}
    {--force : Force the worker to run even in maintenance mode}
    {--memory=128 : The memory limit in megabytes}
    {--queue= : The queue to listen on}
    {--sleep=3 : Number of seconds to sleep when no job is available}
    {--timeout=60 : The number of seconds a child process can run}
    {--tries=0 : Number of times to attempt a job before logging it failed}';*/

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run the bot';

    /**
     * Create a new bot run command.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function fire()
    {
        $discord = new Discord([
            'token' => env('DISCORD_TOKEN'),
            'logger' => app('log')
        ]);

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

                switch ($params[0]) {
                    default:
                        return 0;
                        break;
                    case '!roll':
                        $randomizationEngine = new MersenneTwister();
                        $diceBag = DiceBag::factory($params[1], $randomizationEngine);
                        $message->getChannelAttribute()->sendMessage(sprintf('%s :game_die:', $diceBag->getTotal()));

                        return 1;
                        break;
                    case '!8ball':
                        $eightBall = collect([
                            'It is certain',
                            'It is decidedly so',
                            'Without a doubt',
                            'Yes definitely',
                            'You may rely on it',
                            'As I see it, yes',
                            'Most likely',
                            'Outlook good',
                            'Yes',
                            'Signs point to yes',
                            'Reply hazy try again',
                            'Ask again later',
                            'Better not tell you now',
                            'Cannot predict now',
                            'Concentrate and ask again',
                            'Don\'t count on it',
                            'My reply is no',
                            'My sources say no',
                            'Outlook not so good',
                            'Very doubtful',
                        ]);

                        $message->getChannelAttribute()->sendMessage($eightBall->random(1)->first());

                        return 1;
                        break;
                }
            });
        });

        $discord->run();
    }

    /**
     * Get the console command options.
     *
     * @return array
     */
    protected function getOptions()
    {
        return array(
            array(
                'host',
                null,
                InputOption::VALUE_OPTIONAL,
                'The host address to serve the application on.',
                'localhost'
            ),
            array('port', null, InputOption::VALUE_OPTIONAL, 'The port to serve the application on.', 8000),
        );
    }
}
