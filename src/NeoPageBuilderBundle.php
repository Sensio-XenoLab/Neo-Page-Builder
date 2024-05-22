<?php

namespace Frgef\NeoPageBuilder;

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Bundle\AbstractBundle;

class NeoPageBuilderBundle extends AbstractBundle
{
    public function configure(DefinitionConfigurator $definition): void
    {
        $definition->import('../config/definition.php');
        // you can also use glob patterns
        //$definition->import('../config/definition/*.php');
        dump('toto');
    }

    public function getPath(): string
    {
        dump('toto');
        return __DIR__;
    }
}
