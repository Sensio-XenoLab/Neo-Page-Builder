<?php

namespace Frgef\NeoPageBuilder\Controller;

use Frgef\NeoPageBuilder\IntegrityChecks\PatternValidator;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Twig\Environment as TwigEnvironment;

class BuilderController
{
    public function __construct(private TwigEnvironment $twig)
    {

    }

    public function page(): Response
    {
        return new Response($this->twig->render('@!NeoPageBuilder/page.html.twig', [
            'fromController' => 'page'
        ]));
    }

    /**
     * @throws NotFoundHttpException
     */
    public function row(Request $request): Response
    {
        if ($request->request->has('pattern')
            && PatternValidator::patternValidation($request->get('pattern'), 'row')
        ) {
            return new Response($this->twig->render('@!NeoPageBuilder/row.html.twig', [
                'fromController' => 'row',
                'type' => str_starts_with($request->get('pattern'), 'special-') ? 'special' : $request->get('pattern'),
                'pattern' => PatternValidator::getPatternConfig($request->get('pattern'), 'row'),
                'rowType' => PatternValidator::getPattern($request->get('pattern'), 'row'),
                'rowPattern' => $request->get('pattern')
            ]));
        } else {
            throw $this->createNotFoundException('Row pattern is missing in parameters or bad formatted.');
        }
    }

    /**
     * @throws NotFoundHttpException
     */
    public function section(Request $request): Response
    {
        if ($request->request->has('pattern')
            && $request->request->has('type')
            && PatternValidator::patternValidation($request->get('pattern'), 'section')
        ) {
            return new Response($this->twig->render('@!NeoPageBuilder/section.html.twig', [
                'fromController' => 'section',
                'type' => $request->get('type'),
                'pattern' => PatternValidator::getPatternConfig($request->get('pattern'), 'section'),
                'rowType' => PatternValidator::getPattern($request->get('pattern'), 'section'),
                'complexity' => PatternValidator::sectionComplexityLevel($request->get('pattern'))
            ]));
        } else {
            throw $this->createNotFoundException('Section pattern or type are missing in parameters or bad formatted.');
        }
    }

    /**
     * @throws NotFoundHttpException
     */
    public function block(Request $request): Response
    {
        if ($request->request->has('isFullScreen')
            && $request->request->has('pattern')
            && PatternValidator::patternValidation($request->get('pattern'), 'block', $request->request->has('isFullScreen') && $request->get('isFullScreen') === 'true')
        ) {
            $isFullScreen = $request->request->has('isFullScreen') && $request->get('isFullScreen') === 'true';
            return new Response($this->twig->render('@!NeoPageBuilder/block.html.twig', [
                'fromController' => 'block',
                'pattern' => $request->get('pattern'),
                'isFullScreen' => $isFullScreen,
                'blockType' => $isFullScreen === true ? 'fullscreen' : 'regular'
            ]));
        } else {
            throw $this->createNotFoundException('Block pattern or fullscreen type are missing in parameters or bad formatted.');
        }
    }

    /**
     * @throws NotFoundHttpException
     */
    public function fixedModal(Request $request): Response
    {
        if ($request->request->has('type')
            && in_array($request->get('type'), ['row', 'section', 'block'], true)
        ) {
            $type = $request->get('type');
            $isSpecial = $request->request->has('isSpecial') && $request->get('isSpecial') === 'true';
            $isFullScreen = $request->request->has('isFullScreen') && $request->get('isFullScreen') === 'true';
            return new Response($this->twig->render(
                sprintf('@!NeoPageBuilder/components/modals/%s.html.twig', $type),
                compact('isSpecial', 'isFullScreen')
            ));
        } else {
            throw $this->createNotFoundException('Modal choice does not exist.');
        }
    }

    /**
     * @throws NotFoundHttpException
     */
    public function resizableModal(Request $request): Response
    {
        if ($request->request->has('type')
            && in_array($request->get('type'), ['settings', 'revisions'], true)
            && $request->request->has('info')
            && $request->request->has('mode')
            && in_array($request->get('mode'), ['fullscreen', 'standalone', 'sidebar'], true)
        ) {

            $type = $request->get('type');
            $info = $request->get('info');
            $mode = $request->get('mode');

            return $type === 'revisions'
                ? new Response($this->twig->render('@!NeoPageBuilder/components/modals/resizable/revisions.html.twig',
                    compact('info', 'mode')
                ))
                : new Response($this->twig->render(
                    sprintf('@!NeoPageBuilder/components/modals/resizable/types/%s.html.twig', $info['elementType']),
                    compact('type', 'info', 'mode')
                ));

        } else {
            throw $this->createNotFoundException('Modal type does not exist or info is missing in parameters.');
        }
    }

    public function headerModal(Request $request): Response
    {
        if ($request->request->has('type')
            && in_array($request->get('type'), ['save', 'exchange', 'trash', 'dots'], true)
            && $request->request->has('uuid')
        ) {
            $uuid = $request->get('uuid');
            return new Response($this->twig->render(
                sprintf('@!NeoPageBuilder/components/modals/header/%s.html.twig', $request->get('type')),
                compact('uuid')
            ));
        } else {
            throw $this->createNotFoundException('Modal selection does not exist.');
        }
    }
}
