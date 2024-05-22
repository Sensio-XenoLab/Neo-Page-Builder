<?php

namespace Frgef\NeoPageBuilder;

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class NeoPageBuilderBundle extends Bundle
{
    public function getPath(): string
    {
        return \dirname(__DIR__);
    }
}
