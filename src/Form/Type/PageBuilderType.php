<?php

namespace Frgef\NeoPageBuilder\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Exception\InvalidConfigurationException;

class PageBuilderType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $this->checkOptionsIntegrity($options);

        $builder->add('frgef--neo-page-builder-hidden', HiddenType::class, [
            'label' => $options['label']
        ]);
    }

    public function getBlockPrefix(): string
    {
        return 'neo_page_builder';
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'row_attr' => [
                'id' => 'frgef--neo-page-builder'
            ],
            'mapped' => false
        ]);

        $resolver->setAllowedValues('mapped', false);
    }

    public function getParent(): string
    {
        return FormType::class;
    }

    private function checkOptionsIntegrity(array $options): void
    {
        if ($options['row_attr']['id'] !== 'frgef--neo-page-builder') {
            throw new InvalidConfigurationException(sprintf('An error has occurred resolving the options of the form "%s": The option "%s" is not available in the form configuration options.', self::class, 'row_attr.id'));
        }
    }
}
