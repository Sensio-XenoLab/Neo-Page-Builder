<?php

namespace Frgef\NeoPageBuilder;

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Bundle\Bundle;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\AssetMapper\AssetMapperInterface;

class NeoPageBuilderBundle extends Bundle
{
    public function build(ContainerBuilder $container)
    {
        if ($this->isAssetMapperAvailable($container)) {

            $this->addImportJsFileInAppJs();
            $container->prependExtensionConfig('framework', [
                'asset_mapper' => [
                    'paths' => [
                        __DIR__ . '/../assets/controllers' => '@frgef/neo-page-builder-bundle',
                        __DIR__ . '/../assets/js' => '@frgef/neo-page-builder-bundle',
                        __DIR__ . '/../assets/css' => '@frgef/neo-page-builder-bundle',
                    ],
                ],
            ]);
        }
    }

    public function getPath(): string
    {
        return \dirname(__DIR__);
    }

    private function isAssetMapperAvailable(ContainerBuilder $container): bool
    {
        if (!interface_exists(AssetMapperInterface::class)) {
            return false;
        }

        $bundlesMetadata = $container->getParameter('kernel.bundles_metadata');
        if (!isset($bundlesMetadata['FrameworkBundle'])) {
            return false;
        }

        return is_file($bundlesMetadata['FrameworkBundle']['path'] . '/Resources/config/asset_mapper.php');
    }

    private function addImportJsFileInAppJs(): void
    {
        $appJsFile = \dirname(__DIR__, 4) . '/assets/app.js';
        $newLine = "import '@frgef/neo-page-builder';" . "\n";
        
        if (file_exists($appJsFile)) {
            $lines = file($appJsFile);
            if (!in_array($newLine, $lines)) {
                array_unshift($lines, "import '@frgef/neo-page-builder';" . "\n");
                $file = fopen($appJsFile, "w+");
                foreach($lines as $line){
                    fwrite($file, $line);
                }
                fclose($file);
            }
        }
    }
}
