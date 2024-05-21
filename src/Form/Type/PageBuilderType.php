<?php

namespace Frgef\NeoPageBuilder\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PageBuilderType extends AbstractType
{
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'choices' => [
                'Standard Shipping' => 'standard',
                'Expedited Shipping' => 'expedited',
                'Priority Shipping' => 'priority',
            ],
        ]);
    }

    public function getParent(): string
    {
        return ChoiceType::class;
    }
}
