import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'

export default class extends Controller {

    /**
     * This variable represents the padding value (in pixels) for a row.
     * It is used to add spacing between rows in a layout or table.
     *
     * @type {number}
     * @default 20
     * @since 1.0.0
     */
    rowPadding = 20

    /**
     * This variable represents the padding value (in pixels) for a section.
     * It is used to add spacing between sections in a layout or table.
     *
     * @type {number}
     * @default 20
     * @since 1.0.0
     */
    sectionPadding = 20

    /**
     * Represents the current position of a mouse.
     *
     * @type {Object} MousePosition
     * @property {number} left - The horizontal position of the mouse, relative to the left side of the screen.
     * @property {number} top - The vertical position of the mouse, relative to the top side of the screen.
     */
    mousePosition = {left: 0, top: 0}

    /**
     * Represents the button that corresponds to the current section.
     *
     * @type {HTMLElement|null}
     */
    currentSectionBtn = null

    /**
     * Represents a variable storing the current row button element.
     *
     * @type {HTMLElement|null}
     */
    currentRowBtn = null

    /**
     * Represents a variable storing the current header button element.
     *
     * @type {HTMLElement|null}
     */
    currentHeaderBtn = null

    /**
     * Connects to [data-controller="builder_row"].
     *
     * Attach event listeners and resize input element.
     * @function
     *
     * @memberOf ClassName
     * @name connect
     *
     * @returns {void}
     */
    connect() {
        this.listeners()
        this.headerIconListeners()
        const input = $(this.element).find('.frgef--neo-page-builder-headband-input-row')
        this.resizeInput(input)
    }

    /**
     * Attaches event listeners to various elements.
     *
     * @returns {void}
     */
    listeners() {

        $(this.element).find('.frgef--neo-page-builder-add-row').off();
        $(this.element).find('.frgef--neo-page-builder-add-row').on('click', (e) => {

            if (e.currentTarget !== this.currentRowBtn
                || $('.frgef--neo-page-builder-fixed-modal').length === 0) {

                this.currentRowBtn = e.currentTarget
                this.currentSectionBtn = null
                this.currentBlockBtn = null
                this.currentHeaderBtn = null

                $(e.currentTarget).prop('disabled', true)
                $('.frgef--neo-page-builder-fixed-modal').remove()

                const btnPosition = $(e.currentTarget).offset()
                this.mousePosition = {left: btnPosition.left + this.rowPadding, top: btnPosition.top + this.rowPadding}
                this.ajax('/_npb/fixed-modal', {type: 'row'}, this.currentRowBtn)
            }
        });

        $(this.element).find('.frgef--neo-page-builder-initial-add-section-btn .frgef--neo-page-builder-add-section').off();
        $(this.element).find('.frgef--neo-page-builder-initial-add-section-btn .frgef--neo-page-builder-add-section').on('click', (e) => {

            if (e.currentTarget !== this.currentSectionBtn
                || $('.frgef--neo-page-builder-fixed-modal').length === 0) {

                this.currentSectionBtn = e.currentTarget
                this.currentRowBtn = null
                this.currentBlockBtn = null
                this.currentHeaderBtn = null

                $(e.currentTarget).prop('disabled', true)
                $('.frgef--neo-page-builder-fixed-modal').remove()

                const btnPosition = $(e.currentTarget).offset()
                this.mousePosition = {left: btnPosition.left + this.sectionPadding, top: btnPosition.top + this.rowPadding}
                this.ajax(
                    '/_npb/fixed-modal',
                    {
                        type: 'section',
                        isSpecial: $(this.element).hasClass('frgef--neo-page-builder-row-special')
                    },
                    this.currentSectionBtn
                )
            }
        });

        // For full screen row
        $(this.element).find('.frgef--neo-page-builder-add-block').off();
        $(this.element).find('.frgef--neo-page-builder-add-block').on('click', (e) => {

            if (e.currentTarget !== this.currentBlockBtn
                || $('.frgef--neo-page-builder-fixed-modal').length === 0) {

                this.currentBlockBtn = e.currentTarget
                this.currentSectionBtn = null
                this.currentRowBtn = null
                this.currentHeaderBtn = null

                $(e.currentTarget).prop('disabled', true)
                $('.frgef--neo-page-builder-fixed-modal').remove()

                const btnPosition = $(e.currentTarget).offset()
                this.mousePosition = {left: btnPosition.left + this.sectionPadding, top: btnPosition.top + this.rowPadding}
                this.ajax(
                    '/_npb/fixed-modal',
                    {
                        type: 'block',
                        isSpecial: false,
                        isFullScreen: $(this.element).hasClass('frgef--neo-page-builder-row-full')
                    },
                    this.currentBlockBtn
                )
            }
        });

        this.dragingLogic('#frgef--neo-page-builder-rows-wrapper');

        $(this.element).find('.frgef--neo-page-builder-headband-input-row').off();
        $(this.element).find('.frgef--neo-page-builder-headband-input-row').on('input', (e) => {
            this.resizeInput(e.currentTarget)
        });

        $(this.element).find('.frgef--neo-page-builder-headband-input-row').on('focusout', (e) => {
            this.placeholderIfEmptyValue(e.currentTarget)
        });

        $(this.element).find('.frgef--neo-page-builder-headband-header-expand').off();
        $(this.element).find('.frgef--neo-page-builder-headband-header-expand').on('click', (e) => {
            this.expandElement(e.currentTarget);
        });

        if ($(this.element).find('.frgef--neo-page-builder-section').length === 0 && $(this.element).hasClass('frgef--neo-page-builder-new-row')) {
            this.autoAddSection()
        }
    }

    /**
     * Attach click event listeners to header icons in the headband.
     */
    headerIconListeners() {

        $(this.element).find('.frgef--neo-page-builder-headband-header-icon-container').off()
        $(this.element).find('.frgef--neo-page-builder-headband-header-icon-container').on('click', (e) => {

            const elmt = e.currentTarget
            if ($(elmt).hasClass('frgef--neo-page-builder-headband-header-icon-container-trash')
                && $(elmt).closest('.frgef--neo-page-builder-row').length > 0) {

                $('#frgef--neo-page-builder-tooltip').remove()
                $(this.element).remove()
                if ($('#frgef--neo-page-builder-rows-wrapper').children().length === 0) {
                    const addRowBtn = $('#frgef--neo-page-builder-initial-add-row-btn')[0]
                    $(addRowBtn).removeClass('frgef--neo-page-builder-hide-initial-btn')
                }
            } else if ($(elmt).hasClass('frgef--neo-page-builder-headband-header-icon-container-save')
                || $(elmt).hasClass('frgef--neo-page-builder-headband-header-icon-container-dots')
            ) {

                if (elmt !== this.currentHeaderBtn || $('.frgef--neo-page-builder-fixed-modal').length === 0) {

                    if (this.currentHeaderBtn !== null) {
                        $(this.currentHeaderBtn).prop('disabled', false);
                    }

                    this.currentRowBtn = null
                    this.currentSectionBtn = null
                    this.currentBlockBtn = null

                    this.currentHeaderBtn = elmt
                    $(elmt).prop('disabled', true)
                    $('.frgef--neo-page-builder-fixed-modal').remove()

                    const btnPosition = $(elmt).offset()
                    const npbContainerTop = $('#frgef--neo-page-builder').offset().top
                    this.mousePosition = {
                        left: btnPosition.left + this.rowPadding - 5,
                        top: btnPosition.top
                    }

                    const uuid = $(elmt).closest('[data-uuid]').attr('data-uuid')
                    $.post(
                        '/_npb/header-fixed-modal',
                        {type: $(elmt).hasClass('frgef--neo-page-builder-headband-header-icon-container-save') ? 'save' : 'dots', uuid},
                        (data, status) => {
                            if (status === 'success') {
                                this.displayChoices(data, elmt)
                            } else {
                                this.reportMessage('error', status)
                            }
                        }
                    )
                }
            }
        })
    }

    /**
     * Automatically opens the section selection modal when adding a row.
     *
     * @method autoAddSection
     * @returns {void}
     */
    autoAddSection() {

        const addSectionBtn = $(this.element).find('.frgef--neo-page-builder-initial-add-section-btn .frgef--neo-page-builder-add-section')
        if (addSectionBtn.length > 0) {
            $(this.element).removeClass('frgef--neo-page-builder-new-row')
            const addSectionPosition = $(addSectionBtn[0]).offset()

            this.currentSectionBtn = addSectionBtn[0]
            $(addSectionBtn).prop('disabled', true)
            $('.frgef--neo-page-builder-fixed-modal').remove()

            this.mousePosition = {top: addSectionPosition.top + this.rowPadding, left: addSectionPosition.left + this.rowPadding}
            this.ajax(
                '/_npb/fixed-modal',
                {type: 'section', isSpecial: $(this.element).hasClass('frgef--neo-page-builder-row-special')},
                this.currentSectionBtn
            )
        }
    }

    /**
     * Makes an AJAX request to the specified URL with the provided JSON data.
     *
     * @param {string} url - The URL to send the request to.
     * @param {object} json - The JSON data to include in the request.
     * @param {Element} elmt - The button triggerd element.
     * @param {string|null} container - The HTML container to append the response to. If null, the response is handled differently.
     * @param {string|null} after - The HTML element to insert the response after, if container is not null.
     * @return {void}
     */
    ajax(url, json, elmt, container = null, after = null, before = null, type = 'row') {

        $.post(url, json,  (data, status) => {
            if (status === 'success') {
                if (container !== null) {
                    if (after !== null) {
                        $(data).insertAfter($(after))
                    } else if (before !== null) {
                        $(data).insertBefore($(before))
                    } else {
                        $(container).append($(data))
                        if (type === 'section') {
                            $(this.element).find('.frgef--neo-page-builder-initial-add-section-btn').addClass('frgef--neo-page-builder-hide-initial-btn')
                        }
                    }
                } else {
                    this.displayChoices(data, elmt)
                }
            } else {
                this.reportMessage('type', status)
            }
        })
    }

    /**
     * Reports a message with the given type and status.
     *
     * @param {string} type - The type of the message.
     * @param {string} status - The status of the message.
     *
     * @return {undefined}
     */
    reportMessage(type, status) {
        console.log(status)
    }

    /**
     * Display choices in a fixed modal.
     * @param {string} html - The HTML content to be appended to the page builder wrapper.
     * @param {Element} elmt - The triggered button element.
     * @return {void}
     */
    displayChoices(html, elmt) {

        $('#frgef--neo-page-builder-wrapper').append(html)

        const width = $('.frgef--neo-page-builder-fixed-modal').width()
        const npbContainerTop = $('#frgef--neo-page-builder').offset().top
        const wrapperLeft = $('#frgef--neo-page-builder-wrapper').offset().left
        const left = this.mousePosition.left - wrapperLeft
        const position = {
            left: left - (width / 2),
            top: this.mousePosition.top - npbContainerTop
        }

        if (left + width / 2 > $('#frgef--neo-page-builder-wrapper').width()) {
            position.left = $('#frgef--neo-page-builder-wrapper').width() - width - this.rowPadding + 5
            $('.frgef--neo-page-builder-fixed-modal').removeClass('frgef--neo-page-builder-fixed-modal-leftside').addClass('frgef--neo-page-builder-fixed-modal-rightside')
        }

        if (left - width / 2 < this.rowPadding) {
            position.left = this.rowPadding - 5
            $('.frgef--neo-page-builder-fixed-modal').addClass('frgef--neo-page-builder-fixed-modal-leftside').removeClass('frgef--neo-page-builder-fixed-modal-rightside')
        }

        const pad = $('#frgef--neo-page-builder-fixed-modal-header-action').length > 0 ? 3 : 10
        position['--frgef--neo-page-builder-left-value'] = ($(elmt).offset().left - position.left - wrapperLeft + pad) + 'px'

        $('.frgef--neo-page-builder-fixed-modal')
            .css(position)
            .attr('data-ref', $(elmt).attr('id'))

        this.modalPosition()

        $('.frgef--neo-page-builder-fixed-modal-close-wrapper').off()
        $('.frgef--neo-page-builder-fixed-modal-close-wrapper').on('click', () => {
            $('.frgef--neo-page-builder-fixed-modal').remove()
            $(this.currentRowBtn).prop('disabled', false)
            this.currentRowBtn = null
            $(this.currentSectionBtn).prop('disabled', false)
            this.currentSectionBtn = null
            $(this.currentBlockBtn).prop('disabled', false)
            this.currentBlockBtn = null
            $(this.currentHeaderBtn).prop('disabled', false)
            this.currentHeaderBtn = null
        })

        $('.frgef--neo-page-builder-fixed-modal-choices-examples-special').off()
        $('.frgef--neo-page-builder-fixed-modal-choices-examples-special').on('click', (e) => {
            $(e.currentTarget).parent().children().addClass('frgef--neo-page-builder-fixed-modal-hide-elements')
            $('.frgef--neo-page-builder-fixed-modal-choices-examples-special-details').removeClass('frgef--neo-page-builder-fixed-modal-hide-elements')
            $('.frgef--neo-page-builder-fixed-modal-title svg').removeClass('frgef--neo-page-builder-fixed-modal-hide-elements')
        })

        $('.frgef--neo-page-builder-fixed-modal-title svg').off()
        $('.frgef--neo-page-builder-fixed-modal-title svg').on('click', () => {
            $('.frgef--neo-page-builder-fixed-modal-choices-examples-special').parent().children().removeClass('frgef--neo-page-builder-fixed-modal-hide-elements')
            $('.frgef--neo-page-builder-fixed-modal-choices-examples-special-details').addClass('frgef--neo-page-builder-fixed-modal-hide-elements')
            $('.frgef--neo-page-builder-fixed-modal-title svg').addClass('frgef--neo-page-builder-fixed-modal-hide-elements')
        })

        $('.frgef--neo-page-builder-fixed-modal-choices-examples[data-model]').off()
        $('.frgef--neo-page-builder-fixed-modal-choices-examples[data-model]').on('click', (e) => {
            const model = $(e.currentTarget).data('model');
            $('.frgef--neo-page-builder-fixed-modal').remove()
            $(this.currentRowBtn).prop('disabled', false)
            const elmt = this.currentRowBtn
            this.currentRowBtn = null

            this.ajax(
                '/_npb/row',
                {pattern: model},
                elmt,
                '#frgef--neo-page-builder-rows-wrapper',
                $(this.element)
            )
        })

        $('.frgef--neo-page-builder-fixed-modal-sections-choices-examples[data-model]').off()
        $('.frgef--neo-page-builder-fixed-modal-sections-choices-examples[data-model]').on('click', (e) => {
            const model = $(e.currentTarget).data('model');
            $('.frgef--neo-page-builder-fixed-modal').remove()
            $(this.currentSectionBtn).prop('disabled', false)
            const elmt = this.currentSectionBtn
            this.currentSectionBtn = null

            const container = $(this.element).find('.frgef--neo-page-builder-row-special-section').length === 0
                ? '#' + $(this.element).attr('id') + ':not(.frgef--neo-page-builder-row-special-section)'
                : '#' + $(this.element).find('.frgef--neo-page-builder-row-special-section').attr('id');

            this.ajax(
                '/_npb/section',
                {
                    pattern: model,
                    type: $(this.element).find('.frgef--neo-page-builder-row-special-section').length === 0 ? 'standard' : 'special'
                },
                elmt,
                container,
                null,
                null,
                'section'
            )
        })

        $('.frgef--neo-page-builder-fixed-modal-blocks-choices-examples[data-model]').off()
        $('.frgef--neo-page-builder-fixed-modal-blocks-choices-examples[data-model]').on('click', (e) => {
            const model = $(e.currentTarget).data('model');
            $('.frgef--neo-page-builder-fixed-modal').remove()
            $(this.currentBlockBtn).prop('disabled', false)

            const container = '#' + $(this.currentBlockBtn)
                .closest('.frgef--neo-page-builder-blocks-wrapper')
                .find('.frgef--neo-page-builder-blocks-draggable-container')
                .attr('id');

            const elmt = this.currentBlockBtn
            this.currentBlockBtn = null

            this.ajax(
                '/_npb/block',
                {
                    pattern: model,
                    isFullScreen: $(this.element).hasClass('frgef--neo-page-builder-row-full')
                },
                elmt,
                container
            )
        })

        $(window).on('resize', () => {

            if ($('.frgef--neo-page-builder-fixed-modal').length > 0
                && elmt !== null
                && $(elmt).attr('id') === $('.frgef--neo-page-builder-fixed-modal').attr('data-ref')
            ) {

                const npbContainerTop = $('#frgef--neo-page-builder').offset().top
                const size = $(elmt).offset()
                const wrapperLeft = $('#frgef--neo-page-builder-wrapper').offset().left
                const left = size.left - wrapperLeft

                const position = {
                    left: left - (width / 2) + this.rowPadding,
                    top: size.top - npbContainerTop
                }

                if ($('#frgef--neo-page-builder-fixed-modal-header-action').length > 0) {
                    position.left -= 5
                }

                if (size.left + width / 2 > $('#frgef--neo-page-builder-wrapper').width()) {
                    position.left = $('#frgef--neo-page-builder-wrapper').width() - width - this.rowPadding + 5
                    $('.frgef--neo-page-builder-fixed-modal').removeClass('frgef--neo-page-builder-fixed-modal-leftside').addClass('frgef--neo-page-builder-fixed-modal-rightside')
                }

                if (size.left - width / 2 < this.rowPadding) {
                    position.left = this.rowPadding - 5
                    $('.frgef--neo-page-builder-fixed-modal').addClass('frgef--neo-page-builder-fixed-modal-leftside').removeClass('frgef--neo-page-builder-fixed-modal-rightside')
                }

                const pad = $('#frgef--neo-page-builder-fixed-modal-header-action').length > 0 ? 3 : 10
                position['--frgef--neo-page-builder-left-value'] = ($(elmt).offset().left - position.left - wrapperLeft + pad) + 'px'

                $('.frgef--neo-page-builder-fixed-modal').css(position)
            }
        })
    }

    /**
     * The modal will be dynamically positioned either above or below the scroll target based on its visibility in the viewport.
     *
     * @returns {void}
     */
    modalPosition() {

        const modal = $('.frgef--neo-page-builder-fixed-modal')
        if (modal.length > 0) {
            const windowHeight = window.innerHeight
            const modalPosY = $(modal).offset().top
            const modalHeight = $(modal).height()
            if (modalPosY + modalHeight > windowHeight
            ) {
                $(modal).addClass('frgef--neo-page-builder-fixed-modal-above-target')
            } else {
                $(modal).removeClass('frgef--neo-page-builder-fixed-modal-above-target')
            }
        }
    }

    /**
     * Dragging logic for elements with specified classes.
     *
     * @param {string} classes - The classes of elements to enable dragging on.
     * @param {null|Array} items - Optional. The items to be dragged. Default is null.
     *
     * @return {void}
     */
    dragingLogic(classes, items = null) {
        const elmts = $(classes);
        if (elmts.length > 0) {
            let ids = [];
            $(elmts).each(function () {
                ids.push('#' + $(this).attr('id'));
            });
            let option = {
                placeholder: 'frgef--neo-page-builder-placeholder',
                handle: '.frgef--neo-page-builder-headband',
                start: function(e, ui ){
                    let classe = 'frgef--neo-page-builder-placeholder-row-normal'
                    if ($(ui.item).hasClass('frgef--neo-page-builder-row-full')) {
                        classe = 'frgef--neo-page-builder-placeholder-row-full'
                    } else if ($(ui.item).hasClass('frgef--neo-page-builder-row-special')) {
                        classe = 'frgef--neo-page-builder-placeholder-row-special'
                    }
                    $(ui.placeholder).css('height', ui.helper.outerHeight()).addClass(classe)
                    $(ui.item).css('opacity', 0.5)
                },
                stop: function(e, ui ){
                    $(ui.item).css('opacity', 1)
                }
            }
            if (ids.length > 0) {
                option.connectWith = classes;
            }
            $(ids.join(', ')).sortable(option).disableSelection();
        }
    }

    /**
     * Resizes the width of the input element based on its value length.
     *
     * @param {string} input - The input element to resize.
     * @return {undefined}
     */
    resizeInput(input) {
        let len = (($(input).val().length + 1) * 8 + 44) + 'px'
        $(input).css('width', len)
        this.interactiveHeaderInputPosition()
    }

    /**
     * Sets the position of the interactive header input based on the width of the container
     * and the widths of other elements within the container.
     *
     * @returns {void}
     */
    interactiveHeaderInputPosition() {

        const container = $(this.element).find('.frgef--neo-page-builder-headband-interactive')
        const input = $(container).find('.frgef--neo-page-builder-headband-input-interactive')
        const containerWidth = $(container).width()
        const iconsContainerWidth = $(container).find('.frgef--neo-page-builder-headband-header').width()
        const inputWidth = $(input).width()
        const width = containerWidth - iconsContainerWidth - inputWidth - 44
        const left = containerWidth / 2 - iconsContainerWidth - (inputWidth + 22) / 2
        if (width - 44 <= inputWidth + 40) {
            $(input).css({left: 0})
        } else {
            $(input).css({left: left})
        }
    }

    /**
     * Sets a placeholder value if the input field is empty.
     * If the input field is empty, it sets the value to 'row' and triggers the resizeInput() method.
     *
     * @param {string|object} input - The input field element or its selector.
     */
    placeholderIfEmptyValue(input) {
        let len = $(input).val().length
        if (len === 0) {
            $(input).val('row')
            this.resizeInput(input)
        }
    }

    /**
     * Expands or collapses the specified element.
     *
     * @param {Element} elmt - The element to expand or collapse.
     */
    expandElement(elmt) {
        if ($(elmt).attr('aria-expanded') === 'true') {
            $(elmt).attr('aria-expanded', 'false')
            $(this.element).closest('.frgef--neo-page-builder-row').addClass('frgef--neo-page-builder-hide-expanded')
        } else {
            $(elmt).attr('aria-expanded', 'true')
            $(this.element).closest('.frgef--neo-page-builder-row').removeClass('frgef--neo-page-builder-hide-expanded')
        }
    }
}
