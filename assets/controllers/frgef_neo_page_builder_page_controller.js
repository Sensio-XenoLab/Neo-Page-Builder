import { Controller } from '@hotwired/stimulus';

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
     * Represents the current position of the mouse.
     *
     * @type {Object} MousePosition
     * @property {number} left - The distance in pixels from the left edge of the screen to the mouse cursor.
     * @property {number} top - The distance in pixels from the top edge of the screen to the mouse cursor.
     */
    mousePosition = {left: 0, top: 0}

    /**
     * The variable representing the current row button.
     * @type {null}
     */
    currentRowBtn = null

    /**
     * Connects to [data-controller="builder_page"].
     *
     * @return {void}
     */
    connect() {
        this.listeners()
    }

    /**
     * Attaches a click event listener to the initial add row button.
     * When clicked, it performs certain actions and triggers an AJAX request to retrieve a fixed modal.
     */
    listeners() {

        $(this.element).find('#frgef--neo-page-builder-initial-add-row-btn button').off();
        $(this.element).find('#frgef--neo-page-builder-initial-add-row-btn button').on('click', (e) => {

            if (e.currentTarget !== this.currentRowBtn || $('.frgef--neo-page-builder-fixed-modal').length === 0) {

                this.currentRowBtn = e.currentTarget
                $(e.currentTarget).prop('disabled', true)
                $('.frgef--neo-page-builder-fixed-modal').remove()

                const btnPosition = $(e.currentTarget).offset()
                const npbContainerTop = $('#frgef--neo-page-builder').offset().top;
                this.mousePosition = {left: btnPosition.left + this.rowPadding, top: btnPosition.top + this.rowPadding - npbContainerTop};
                this.ajax('/_npb/fixed-modal', {type: 'row'}, this.currentRowBtn)
            }
        });

        $('#frgef--neo-page-builder-headband-header-master > button').off()
        $('#frgef--neo-page-builder-headband-header-master > button').on('click', (e) => {
            $('#frgef--neo-page-builder-resizable-modal-container').remove()
            $('#frgef--neo-page-builder-wrapper').removeAttr('style')
            const elmt = e.currentTarget
            if ($(elmt).hasClass('frgef--neo-page-builder-headband-header-icon-container-trash')) {
                /*$('#frgef--neo-page-builder-rows-wrapper > .frgef--neo-page-builder-row').remove()
                $('#frgef--neo-page-builder-initial-add-row-btn').removeClass('frgef--neo-page-builder-hide-initial-btn')*/
                this.displayHeaderIconsModal('trash', elmt)
            } else if ($(elmt).hasClass('frgef--neo-page-builder-headband-header-icon-container-save')) {
                this.displayHeaderIconsModal('save', elmt)
            } else if ($(elmt).hasClass('frgef--neo-page-builder-headband-header-icon-container-exchange')) {
                this.displayHeaderIconsModal('exchange', elmt)
            } else if ($(elmt).hasClass('frgef--neo-page-builder-headband-header-icon-container-add')) {

            } else if ($(elmt).hasClass('frgef--neo-page-builder-headband-header-icon-container-dots')) {
                this.displayHeaderIconsModal('dots', elmt)
            }
        })
    }

    displayHeaderIconsModal(type, elmt) {

        if (elmt !== this.currentRowBtn || $('.frgef--neo-page-builder-fixed-modal').length === 0) {

            if (this.currentRowBtn !== null) {
                $(this.currentRowBtn).prop('disabled', false);
            }

            this.currentRowBtn = elmt
            $(elmt).prop('disabled', true)
            $('.frgef--neo-page-builder-fixed-modal').remove()

            const btnPosition = $(elmt).offset()
            const npbContainerTop = $('#frgef--neo-page-builder').offset().top
            this.mousePosition = {
                left: btnPosition.left + this.rowPadding - 5,
                top: btnPosition.top + this.rowPadding - npbContainerTop
            }

            const uuid = null
            $.post(
                '/_npb/header-fixed-modal',
                {type, uuid},
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

    /**
     * Display choices in a fixed modal.
     * @param {string} html - The HTML content to be appended to the page builder wrapper.
     * @param {Element} elmt - The triggered button element.
     * @return {void}
     */
    displayChoices(html, elmt) {

        $('#frgef--neo-page-builder-wrapper').append(html)

        const width = $('.frgef--neo-page-builder-fixed-modal').width();
        const wrapperLeft = $('#frgef--neo-page-builder-wrapper').offset().left
        const left = this.mousePosition.left - wrapperLeft
        const position = {left: left - (width / 2), top: this.mousePosition.top}

        if (left + width / 2 > $('#frgef--neo-page-builder-wrapper').width()) {
            position.left = $('#frgef--neo-page-builder-wrapper').width() - width - this.rowPadding + 5
            $('.frgef--neo-page-builder-fixed-modal').removeClass('frgef--neo-page-builder-fixed-modal-leftside').addClass('frgef--neo-page-builder-fixed-modal-rightside')
        }

        if (left - width / 2 < 0) {
            position.left = this.rowPadding - 5
            $('.frgef--neo-page-builder-fixed-modal').addClass('frgef--neo-page-builder-fixed-modal-leftside').removeClass('frgef--neo-page-builder-fixed-modal-rightside')
        }

        const pad = $('#frgef--neo-page-builder-fixed-modal-header-action').length > 0 ? 5 : 10
        position['--frgef--neo-page-builder-left-value'] = ($(elmt).offset().left - position.left - wrapperLeft + pad) + 'px'

        $('.frgef--neo-page-builder-fixed-modal')
            .css(position)
            .attr('data-ref', $(elmt).attr('id'))

        $('.frgef--neo-page-builder-fixed-modal-close-wrapper').off()
        $('.frgef--neo-page-builder-fixed-modal-close-wrapper').on('click', () => {
            $('.frgef--neo-page-builder-fixed-modal').remove()
            $(this.currentRowBtn).prop('disabled', false)
            $(this.currentRowBtn).removeAttr('data-disabled');
            this.currentRowBtn = null
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
            const elmt = this.currentRowBtn
            $('.frgef--neo-page-builder-fixed-modal').remove()
            $(this.currentRowBtn).prop('disabled', false)
            this.currentRowBtn = null
            this.ajax(
                '/_npb/row',
                {pattern: model},
                elmt,
                '#frgef--neo-page-builder-rows-wrapper'
            )
        })

        $(window).on('resize', () => {

            if ($('.frgef--neo-page-builder-fixed-modal').length > 0 && this.currentRowBtn !== null) {

                const size = $(this.currentRowBtn).offset()
                const wrapperLeft = $('#frgef--neo-page-builder-wrapper').offset().left
                const left = size.left - wrapperLeft
                const npbContainerTop = $('#frgef--neo-page-builder').offset().top
                const position = {
                    left: left - (width / 2) + this.rowPadding,
                    top: size.top + this.rowPadding - npbContainerTop
                }

                if ($('#frgef--neo-page-builder-fixed-modal-header-action').length > 0) {
                    position.left -= 5
                }

                if (left + width / 2 > $('#frgef--neo-page-builder-wrapper').width()) {
                    position.left = $('#frgef--neo-page-builder-wrapper').width() - width - this.rowPadding + 5
                    $('.frgef--neo-page-builder-fixed-modal').removeClass('frgef--neo-page-builder-fixed-modal-leftside').addClass('frgef--neo-page-builder-fixed-modal-rightside')
                }

                if (left - width / 2 < 0) {
                    position.left = this.rowPadding - 5
                    $('.frgef--neo-page-builder-fixed-modal').addClass('frgef--neo-page-builder-fixed-modal-leftside').removeClass('frgef--neo-page-builder-fixed-modal-rightside')
                }

                const elmt = '#' + $('.frgef--neo-page-builder-fixed-modal').attr('data-ref')
                const pad = $('#frgef--neo-page-builder-fixed-modal-header-action').length > 0 ? 5 : 10

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
     * Perform an AJAX request using the POST method.
     *
     * @param {string} url - The URL to send the request to.
     * @param {Object} json - The JSON data to send along with the request.
     * @param {Element} elmt - The element triggered.
     * @param {string|null} container - The selector for the container element where the response data should be appended, or null if the response should be handled differently.
     * @return {void}
     */
    ajax(url, json, elmt, container = null) {

        $.post(url, json,  (data, status) => {
            if (status === 'success') {
                if (container !== null) {
                    $(container).append($(data))
                    $(this.element).find('#frgef--neo-page-builder-initial-add-row-btn').addClass('frgef--neo-page-builder-hide-initial-btn')
                } else {
                    this.displayChoices(data, elmt)
                }
            } else {
                this.reportMessage('error', status)
            }
        })
    }

    /**
     * Reports a message.
     *
     * @param {string} type - The type of the message.
     * @param {string} status - The status of the message.
     *
     * @return {undefined} - No value is returned.
     */
    reportMessage(type, status) {
        console.log(status)
    }
}
