# Neo Page Builder

This package is a [Symfony](http://symfony.com) allowing you to use a particular **FormType** (NeoPageBuilderType) in order to build ***complete frontend pages*** in the context of a CMS.

[![Package version](https://img.shields.io/packagist/v/frgef/neo-page-builder-bundle.svg?style=flat-square)](https://packagist.org/packages/frgef/neo-page-builder-bundle)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Slack](https://img.shields.io/badge/slack-%23neo--page--builder-gold.svg?style=flat-square)](https://join.slack.com/t/sensioxenolab/shared_invite/zt-2j1r521bb-njCE7vP1vT9Ujcwfguyw4w)

## When to use this bundle ?

## Documentation

1. [Install](#installation)
2. [Basic usage](#basic-usage)
3. [Advanced usage](doc/advanced-usage.md)
4. [Resources](#resources)

## Installation

With [Symfony Flex](https://symfony.com/doc/current/setup/flex.html) (recommended):

```
composer require frgef/neo-page-builder-bundle
```

You're ready to use AliceBundle, and can jump to the next section!

Without Flex you will have to register the bundle accordingly in `config/bundles.php`:

```php
<?php

return [
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    // ...
    NeoPageBuilder\NeoPageBuilderBundle::class => ['all' => true],
];
```

Configure the bundle to your needs, for example:

## Basic usage

[See more](#documentation).<br />
Next chapter: [Advanced usage](doc/advanced-usage.md)

## Database testing

## Resources

