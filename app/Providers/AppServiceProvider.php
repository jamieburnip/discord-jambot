<?php

namespace App\Providers;

use Bugsnag\BugsnagLaravel\MultiLogger;
use Illuminate\Support\ServiceProvider;
use Psr\Log\LoggerInterface;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
//        $this->app->alias('bugsnag.logger', \Illuminate\Contracts\Logging\Log::class);
//        $this->app->alias('bugsnag.logger', LoggerInterface::class);

        $this->app->extend(LoggerInterface::class, function ($logger, $app) {
            return new MultiLogger([$logger, $app['bugsnag.logger']]);
        });
    }
}
