import { Controller } from '@hotwired/stimulus';

stimulusFetch: 'lazy'

export default class extends Controller {

    /**
     * The amount of padding (in pixels) for a section.
     *
     * @type {number}
     * @constant
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
     * Represents the button that corresponds to the current block.
     *
     * @type {HTMLElement|null}
     */
    currentBlockBtn = null

    /**
     * Represents the button that corresponds to the current header button.
     *
     * @type {HTMLElement|null}
     */
    currentHeaderBtn = null

    /**
     * Connects the page builder headband to its listeners and performs necessary initialization tasks.
     *
     * @memberOf PageBuilderHeadband
     *
     * @returns {void}
     */
    connect() {
        this.listeners()
        this.headerIconListeners()
        const input = $(this.element).find('.frgef--neo-page-builder-headband-input-section')
        this.resizeInput(input)
    }

    /**
     * Attaches event listeners to various elements.
     *
     * @returns {void}
     */
    listeners() {

        $(this.element).find('.frgef--neo-page-builder-add-section').off();
        $(this.element).find('.frgef--neo-page-builder-add-section').on('click', (e) => {

            if (e.currentTarget !== this.currentSectionBtn
                || $('.frgef--neo-page-builder-fixed-modal').length === 0) {

                this.currentSectionBtn = e.currentTarget
                this.currentBlockBtn = null
                this.currentHeaderBtn = null

                $(e.currentTarget).prop('disabled', true)
                $('.frgef--neo-page-builder-fixed-modal').remove()

                const btnPosition = $(e.currentTarget).offset()
                const npbContainerTop = $('#frgef--neo-page-builder').offset().top
                this.mousePosition = {left: btnPosition.left + this.sectionPadding, top: btnPosition.top + this.sectionPadding - npbContainerTop}
                this.ajax(
                    '/_npb/fixed-modal',
                    {
                        type: 'section', isSpecial: $(this.element).hasClass('frgef--neo-page-builder-section-special')
                    },
                    this.currentSectionBtn
                )
            }
        });

        $(this.element).find('.frgef--neo-page-builder-add-block').off();
        $(this.element).find('.frgef--neo-page-builder-add-block').on('click', (e) => {

            if (e.currentTarget !== this.currentBlockBtn
                || $('.frgef--neo-page-builder-fixed-modal').length === 0) {

                this.currentBlockBtn = e.currentTarget
                this.currentSectionBtn = null
                this.currentHeaderBtn = null

                $(e.currentTarget).prop('disabled', true)
                $('.frgef--neo-page-builder-fixed-modal').remove()

                const btnPosition = $(e.currentTarget).offset()
                const npbContainerTop = $('#frgef--neo-page-builder').offset().top
                this.mousePosition = {left: btnPosition.left + this.sectionPadding, top: btnPosition.top + this.sectionPadding - npbContainerTop}
                this.ajax(
                    '/_npb/fixed-modal',
                    {
                        type: 'block',
                        isSpecial: $(this.element).closest('frgef--neo-page-builder-section-special').length > 0,
                        isFullScreen: $(this.element).closest('.frgef--neo-page-builder-row-full').length > 0
                    },
                    this.currentBlockBtn
                )
            }
        });

        if ($(this.element).closest('.frgef--neo-page-builder-row-special').length > 0) {
            this.dragingLogic('.frgef--neo-page-builder-row-special-section.frgef--neo-page-builder-row-section-draggable', '.frgef--neo-page-builder-section-special');
        }

        if ($(this.element).closest('.frgef--neo-page-builder-row-normal').length > 0) {
            this.dragingLogic('.frgef--neo-page-builder-row-normal.frgef--neo-page-builder-row-section-draggable', '.frgef--neo-page-builder-section-standard');
        }

        $(this.element).find('.frgef--neo-page-builder-headband-input-section').off();
        $(this.element).find('.frgef--neo-page-builder-headband-input-section').on('input', (e) => {
            this.resizeInput(e.currentTarget)
        });

        $(this.element).find('.frgef--neo-page-builder-headband-input-section').on('focusout', (e) => {
            this.placeholderIfEmptyValue(e.currentTarget)
        });

        $(this.element).find('.frgef--neo-page-builder-headband-header-expand').off();
        $(this.element).find('.frgef--neo-page-builder-headband-header-expand').on('click', (e) => {
            this.expandElement(e.currentTarget);
        });
    }

    /**
     * Attaches click event listeners to the header icons in the headband container.
     */
    headerIconListeners() {

        $(this.element).find('.frgef--neo-page-builder-headband-header-icon-container').off()
        $(this.element).find('.frgef--neo-page-builder-headband-header-icon-container').on('click', (e) => {

            const elmt = e.currentTarget
            if ($(elmt).hasClass('frgef--neo-page-builder-headband-header-icon-container-trash')
                && $(elmt).closest('.frgef--neo-page-builder-section').length > 0) {

                $('#frgef--neo-page-builder-tooltip').remove()
                const addSectionBtn = $(this.element).closest('.frgef--neo-page-builder-row').find('.frgef--neo-page-builder-initial-add-section-btn')[0]
                const sections = $(this.element).closest('.frgef--neo-page-builder-row').find('.frgef--neo-page-builder-section')
                $(this.element).remove()

                if ($(sections).length - 1 < 1) {
                    $(addSectionBtn).removeClass('frgef--neo-page-builder-hide-initial-btn')
                }
                this.orderSections()

            } else if ($(elmt).hasClass('frgef--neo-page-builder-headband-header-icon-container-save')
                || $(elmt).hasClass('frgef--neo-page-builder-headband-header-icon-container-dots')
            ) {

                if (elmt !== this.currentHeaderBtn || $('.frgef--neo-page-builder-fixed-modal').length === 0) {

                    if (this.currentHeaderBtn !== null) {
                        $(this.currentHeaderBtn).prop('disabled', false);
                    }

                    this.currentHeaderBtn = elmt
                    $(elmt).prop('disabled', true)
                    $('.frgef--neo-page-builder-fixed-modal').remove()

                    const btnPosition = $(elmt).offset()
                    const npbContainerTop = $('#frgef--neo-page-builder').offset().top
                    this.mousePosition = {
                        left: btnPosition.left + this.sectionPadding - 5,
                        top: btnPosition.top - npbContainerTop
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
     * Sends an AJAX request to the specified URL with the provided JSON data.
     *
     * @param {string} url - The URL to send the AJAX request to.
     * @param {Object} json - The JSON data to send in the request body.
     * @param {Element} elmt - The triggered button element.
     * @param {string|null} container - The DOM element selector where the response HTML should be appended to.
     *                                 If null, the response data will be passed to the displayChoices method instead.
     * @param {string|null} after - The DOM element selector after which the response HTML should be inserted.
     *                              This parameter is only used if container is not null.
     * @return {void}
     */
    ajax(url, json, elmt,  container = null, after = null, before = null) {
        $.post(url, json,  (data, status) => {
            if (status === 'success') {
                if (container !== null) {
                    if (after !== null) {
                        $(data).insertAfter($(after))
                    } else if (before !== null) {
                        $(data).insertBefore($(before))
                    } else {
                        $(container).append($(data))
                    }
                    this.orderSections()
                } else {
                    this.displayChoices(data, elmt)
                }
            } else {
                this.reportMessage('error', status)
            }
        })
    }

    /**
     * Reports a message of a given type and status.
     *
     * @param {string} type - The type of the message.
     * @param {string} status - The status of the message.
     */
    reportMessage(type, status) {
        console.log(status)
    }

    /**
     * Displays choices in a fixed modal on the page.
     *
     * @param {string} html - The HTML content to display in the fixed modal.
     * @param {Element} elmt - The triggered button element.
     */
    displayChoices(html, elmt) {

        $('#frgef--neo-page-builder-wrapper').append(html)

        const width = $('.frgef--neo-page-builder-fixed-modal').width();
        const wrapperLeft = $('#frgef--neo-page-builder-wrapper').offset().left
        const left = this.mousePosition.left - wrapperLeft
        const position = {
            left: left - (width / 2),
            top: this.mousePosition.top
        }

        if (left + width / 2 > $('#frgef--neo-page-builder-wrapper').width()) {
            position.left = $('#frgef--neo-page-builder-wrapper').width() - width - this.sectionPadding + 5
            $('.frgef--neo-page-builder-fixed-modal').removeClass('frgef--neo-page-builder-fixed-modal-leftside').addClass('frgef--neo-page-builder-fixed-modal-rightside')
        }

        if (left - width / 2 < this.sectionPadding * 2) {
            position.left = this.sectionPadding - 5
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
            $(this.currentBlockBtn).prop('disabled', false)
            this.currentBlockBtn = null
            $(this.currentSectionBtn).prop('disabled', false)
            this.currentSectionBtn = null
            $(this.currentHeaderBtn).prop('disabled', false)
            this.currentHeaderBtn = null
        })

        $('.frgef--neo-page-builder-fixed-modal-sections-choices-examples[data-model]').off()
        $('.frgef--neo-page-builder-fixed-modal-sections-choices-examples[data-model]').on('click', (e) => {

            const model = $(e.currentTarget).data('model');
            $('.frgef--neo-page-builder-fixed-modal').remove()
            $(this.currentSectionBtn).prop('disabled', false)
            const elmt = this.currentSectionBtn
            this.currentSectionBtn = null

            const container = '#' + $(this.element)
                .closest('.frgef--neo-page-builder-row')
                .attr('id');

            this.ajax(
                '/_npb/section',
                {
                    pattern: model,
                    type: $(this.element)
                            .closest('.frgef--neo-page-builder-row')
                            .find('.frgef--neo-page-builder-row-special-section')
                            .length > 0
                        ? 'special'
                        : 'standard'
                },
                elmt,
                container,
                $(this.element)
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
                    isFullScreen: $(this.element)
                        .closest('.frgef--neo-page-builder-row-full')
                        .length > 0
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
                let size = $(elmt).offset()
                const wrapperLeft = $('#frgef--neo-page-builder-wrapper').offset().left
                const left = size.left - wrapperLeft
                const position = {
                    left: left - (width / 2) + this.sectionPadding,
                    top: size.top + this.sectionPadding - npbContainerTop
                }

                if ($('#frgef--neo-page-builder-fixed-modal-header-action').length > 0) {
                    position.left -= 5
                }

                if (left + width / 2 > $('#frgef--neo-page-builder-wrapper').width()) {
                    position.left = $('#frgef--neo-page-builder-wrapper').width() - width - this.sectionPadding + 5
                    $('.frgef--neo-page-builder-fixed-modal').removeClass('frgef--neo-page-builder-fixed-modal-leftside').addClass('frgef--neo-page-builder-fixed-modal-rightside')
                }

                if (left - width / 2 < this.sectionPadding) {
                    position.left = this.sectionPadding - 5
                    $('.frgef--neo-page-builder-fixed-modal').addClass('frgef--neo-page-builder-fixed-modal-leftside').removeClass('frgef--neo-page-builder-fixed-modal-rightside')
                }

                const padLeft = $('#frgef--neo-page-builder-fixed-modal-header-action').length > 0 ? 3 : 10
                const padTop = $('#frgef--neo-page-builder-fixed-modal-header-action').length > 0 ? 20 : 0

                position.top -= padTop
                position['--frgef--neo-page-builder-left-value'] = ($(elmt).offset().left - position.left - wrapperLeft + padLeft) + 'px'

                $('.frgef--neo-page-builder-fixed-modal').css(position)
            }
        })
    }

    /**
     * The modal will be dynamically positioned either above or below the scroll target based on its visibility in the viewport.
     *
     * @returns {void} - does not return a value
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
     * Performs drag and drop logic on given elements.
     *
     * @param {string} classes - The CSS class selector for the elements to apply drag and drop logic.
     * @param {string} items - The CSS selector for the draggable items within the elements.
     * @return {void}
     */
    dragingLogic(classes, items) {
        const elmts = $(classes);
        if (elmts.length > 0) {
            let ids = [];
            $(elmts).each(function () {
                ids.push('#' + $(this).attr('id'));
            });
            let option = {
                placeholder: 'frgef--neo-page-builder-section-placeholder',
                update: this.dropped.bind(this),
                items: items,
                handle: '.frgef--neo-page-builder-headband',
                start: function(e, ui ){
                    $(ui.placeholder).css('height', ui.helper.outerHeight())
                    $(ui.item).css('opacity', 0.5)
                },
                stop: (e, ui ) => {
                    if ($(ui.item).data('complexity') === 'complex'
                        && $(ui.item).closest('.frgef--neo-page-builder-row-special').length > 0) {
                        $(ids.join(', ')).sortable('cancel')
                    }
                    $(ui.item).css('opacity', 1)
                    this.checkEmptyRows()
                }
            }
            if (ids.length > 0) {
                option.connectWith = classes
            }
            $(ids.join(', ')).sortable(option).disableSelection()
        }
    }

    /**
     * This method is called when an item is dropped.
     *
     * @param {Event} event - The event object triggered by the drop action.
     * @param {Object} ui - The UI object holding the dropped item.
     */
    dropped(event, ui) {
        if ($(ui.item).hasClass('frgef--neo-page-builder-section')) {
            this.orderSections();
        }
    }

    /**
     * Orders sections in the page builder.
     *
     * @returns {void}
     */
    orderSections() {
        const rows = $('.frgef--neo-page-builder-row-section-draggable');
        rows.each(function(index) {
            const sections = $(this).find('.frgef--neo-page-builder-section')
            if ($(sections).length < 1) {
                $(this).find('.frgef--neo-page-builder-initial-add-section-btn .frgef--neo-page-builder-add-section').prop('disabled', false)
            }
            sections.each(function(index2) {
                if ($(this).hasClass('frgef--neo-page-builder-section frgef--neo-page-builder-section-standard') && $(this).closest('.frgef--neo-page-builder-row-special-section').length > 0) {
                    $(this).removeClass('frgef--neo-page-builder-section frgef--neo-page-builder-section-standard').addClass('frgef--neo-page-builder-section frgef--neo-page-builder-section-special')
                }
                if ($(this).hasClass('frgef--neo-page-builder-section frgef--neo-page-builder-section-special') && $(this).closest('.frgef--neo-page-builder-row-special-section').length === 0) {
                    $(this).removeClass('frgef--neo-page-builder-section frgef--neo-page-builder-section-special').addClass('frgef--neo-page-builder-section frgef--neo-page-builder-section-standard')
                }
            });
        });
    }

    /**
     * Resize input element based on its value length.
     *
     * @param {HTMLElement} input - The input element to resize.
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
     * Sets a default value to the input if it is empty.
     * If the input element has no value, the method will set the value to 'section' and resize the input.
     *
     * @param {HTMLElement} input - The input element to check and modify.
     * @return {void}
     */
    placeholderIfEmptyValue(input) {
        let len = $(input).val().length
        if (len === 0) {
            $(input).val('section')
            this.resizeInput(input)
        }
    }

    /**
     * Toggles the expansion state of an element.
     *
     * @param {Element} elmt - The element to expand or collapse.
     */
    expandElement(elmt) {
        if ($(elmt).attr('aria-expanded') === 'true') {
            $(elmt).attr('aria-expanded', 'false')
            $(this.element).closest('.frgef--neo-page-builder-section').addClass('frgef--neo-page-builder-hide-expanded')
        } else {
            $(elmt).attr('aria-expanded', 'true')
            $(this.element).closest('.frgef--neo-page-builder-section').removeClass('frgef--neo-page-builder-hide-expanded')
        }
    }

    /**
     * This method checks for empty rows in the containers and adds or removes a class accordingly.
     *
     * @returns {void}
     */
    checkEmptyRows() {
        const containers = $('[id^="frgef--neo-page-builder-row-"]:not(.frgef--neo-page-builder-row-full):not(.frgef--neo-page-builder-row-special)')
        for (let i = 0; i < containers.length; i++) {
            if ($(containers[i]).find('.frgef--neo-page-builder-section').length < 1) {
                $(containers[i]).find('.frgef--neo-page-builder-initial-add-section-btn').removeClass('frgef--neo-page-builder-hide-initial-btn')
            } else {
                $(containers[i]).find('.frgef--neo-page-builder-initial-add-section-btn').addClass('frgef--neo-page-builder-hide-initial-btn')
            }
        }
    }
}
