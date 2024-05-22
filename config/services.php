<?php

use Frgef\NeoPageBuilder\Controller\BuilderController;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $container) {

    $services = $container->services();
    
    $services->set('frgef_neo_page_builder.builder_controller', BuilderController::class)
        ->args([
            service('twig'),
        ])
        ->tag('controller.service_arguments')
    ;
};
