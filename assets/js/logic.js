import '../css/style.css';

initDomObserver()
let fixedModalTimeout
let page = {data: {}, rows: [], entitiesSettings: {}}
let revisions = []
let startX, startY, startWidth, startHeight
let resizedModalOffset = {top: 100, left: null}
let resizedModalSize = {height: 'auto', width: 480}
let resizableModalDisplayMode = 'standalone'
let currentRevision = timestamp('encode')

/**
 * Initializes the DOM observer to detect and handle changes in the DOM.
 *
 * The observer listens for changes in the DOM, such as nodes being added or
 * attributes being modified. When a change is detected, the observer checks
 * if the target element matches a specific pattern indicating that a page builder
 * is being used. If a match is found, the method refreshOnDOMChanges() is
 * called to handle the changes.
 *
 * Additionally, the observer listens for mousemove and click events on the
 * document. If the mousemove event occurs, the method tooltipPosition() is called
 * to reposition a tooltip. If the click event occurs outside of a specific
 * modal element, the method removeModal() is called to remove the modal element
 * from the DOM, and enable certain disabled buttons.
 *
 * @returns {void}
 */
function initDomObserver() {

    $(document).ready(function(){
        if ($('#frgef--neo-page-builder').length > 0) {
            $.post('/_npb/page', {}, function(data, status){

                if (status === 'success') {

                    $('#frgef--neo-page-builder').append($(data)).addClass('frgef--neo-page-builder-loaded')
                    MutationObserver = window.MutationObserver || window.WebKitMutationObserver
                    var observer = new MutationObserver(function(mutations, observer) {

                        for (let i = 0; i < mutations.length; i++) {
                            const mutation = mutations[i]
                            if (mutation.target && ($(mutation.target).is('[id^="frgef--neo-page-builder"]') || $(mutation.target).is('[class^="frgef--neo-page-builder"]'))) {
                                refreshOnDOMChanges()
                            }
                        }
                        refreshOnDOMChanges()
                    })

                    observer.observe(document, {
                        subtree: true,
                        attributes: true
                    })

                    $(document).on('mousemove', function (event) {
                        tooltipPosition(event)
                    })

                    $(document).on('click', function (event) {
                        if (!$(event.target).is('.frgef--neo-page-builder-fixed-modal')
                            && $(event.target).closest('.frgef--neo-page-builder-fixed-modal').length === 0) {

                            $('.frgef--neo-page-builder-fixed-modal').remove()

                            if (!$(event.target).is('.frgef--neo-page-builder-add-row:disabled')
                                && $(event.target).closest('.frgef--neo-page-builder-add-row:disabled').length === 0) {
                                $('.frgef--neo-page-builder-add-row').attr('disabled', false)
                            }

                            if (!$(event.target).is('.frgef--neo-page-builder-add-section:disabled')
                                && $(event.target).closest('.frgef--neo-page-builder-add-section:disabled').length === 0) {
                                $('.frgef--neo-page-builder-add-section').attr('disabled', false)
                            }

                            if (!$(event.target).is('.frgef--neo-page-builder-block-section:disabled')
                                && $(event.target).closest('.frgef--neo-page-builder-add-block:disabled').length === 0) {
                                $('.frgef--neo-page-builder-add-block').attr('disabled', false)
                            }

                            if (!$(event.target).is('.frgef--neo-page-builder-headband-header-icon-container')
                                && $(event.target).closest('.frgef--neo-page-builder-headband-header-icon-container:disabled').length === 0) {
                                $('.frgef--neo-page-builder-headband-header-icon-container').attr('disabled', false)
                            }
                        }
                    })
                } else {
                    reportMessage('error', data)
                }
            })
        }

        $('#display-page-settings').on('click', function (){
            console.log(page)
            downloadObjectAsJson(page, 'page')
        })

        $('#upload-page-settings').on('click', function (){
            importConfigFromFile()
            //downloadObjectAsJson(page, 'page')
        })

        $(window).on('resize', function () {
            interactiveHeaderInputPosition()
            autoResizeResizableModal()
        })

        setRevision('page')
    })
}

/**
 * Reports a message of a specified type.
 *
 * @param {string} type - The type of the message.
 * @param {string} error - The error message to report.
 */
function reportMessage(type, error) {

    console.log(error)
}

/**
 * Refreshes the DOM when changes occur.
 *
 * This method is responsible for refreshing the tooltip listener and fixed modal when changes occur in the DOM.
 *
 * @return {void} Returns nothing.
 */
function refreshOnDOMChanges() {
    refreshTooltipListener()
    settingsListener()
    updatePage()
}

/**
 * Refreshes the tooltip listener for the page builder.
 * Whenever a hover event occurs on an element with the 'data-title' attribute,
 * a tooltip is created and displayed if the window width is greater than 780px.
 * If the window width is less than or equal to 780px, the tooltip is removed.
 *
 * @return {void}
 */
function refreshTooltipListener() {

    $('#frgef--neo-page-builder [data-title]').on('mouseover', function(){

        if (window.innerWidth > 780) {

            const title = $(this).data('title')
            if ($('#frgef--neo-page-builder-tooltip').length === 0) {
                $('#frgef--neo-page-builder').append(`<div id="frgef--neo-page-builder-tooltip"><span>${title}</span></div>`)
            }

        } else {

            $('#frgef--neo-page-builder-tooltip').off()
            $('#frgef--neo-page-builder-tooltip').remove()
        }
    })

    $('#frgef--neo-page-builder [data-title]').on('mouseleave', function(){
        $('#frgef--neo-page-builder-tooltip').off()
        $('#frgef--neo-page-builder-tooltip').remove()
    })
}

/**
 * Calculates the position of a tooltip based on the provided event.
 * If the tooltip element exists on the page, it adds the necessary classes
 * and sets the CSS position properties accordingly.
 *
 * @param {Event} event - The event object representing the triggering event.
 */
function tooltipPosition(event) {

    if ($('#frgef--neo-page-builder-tooltip').length > 0) {

        $('#frgef--neo-page-builder-tooltip')
            .removeClass('frgef--neo-page-builder-tooltip-position-top')
            .removeClass('frgef--neo-page-builder-tooltip-position-bottom')
            .removeClass('frgef--neo-page-builder-tooltip-position-center')
            .removeClass('frgef--neo-page-builder-tooltip-position-left')
            .removeClass('frgef--neo-page-builder-tooltip-position-right')

        const tooltipHeight = $('#frgef--neo-page-builder-tooltip').height() + 40
        const tooltipWidth = $('#frgef--neo-page-builder-tooltip').width() + 40

        const left = tooltipWidth / 2
        let position = {left: 'unset', top: 'unset'}

        if (event.clientY > tooltipHeight + 20) {

            position.top = event.clientY - tooltipHeight
            $('#frgef--neo-page-builder-tooltip').addClass('frgef--neo-page-builder-tooltip-position-top')

            if (event.clientX < left + 20) {
                position.left = event.clientX - 18
                $('#frgef--neo-page-builder-tooltip').addClass('frgef--neo-page-builder-tooltip-position-left')
            } else if (event.clientX > window.innerWidth - (left + 20)) {
                position.left = event.clientX - (tooltipWidth - 18)
                $('#frgef--neo-page-builder-tooltip').addClass('frgef--neo-page-builder-tooltip-position-right')
            } else {
                position.left = event.clientX - left
                $('#frgef--neo-page-builder-tooltip').addClass('frgef--neo-page-builder-tooltip-position-center')
            }

        } else {

            position.top = event.clientY + tooltipHeight - 30
            $('#frgef--neo-page-builder-tooltip').addClass('frgef--neo-page-builder-tooltip-position-bottom')

            if (event.clientX < left + 20) {
                position.left = event.clientX - 18
                $('#frgef--neo-page-builder-tooltip').addClass('frgef--neo-page-builder-tooltip-position-left')
            } else if (event.clientX > window.innerWidth - (left + 20)) {
                position.left = event.clientX - (tooltipWidth - 18)
                $('#frgef--neo-page-builder-tooltip').addClass('frgef--neo-page-builder-tooltip-position-right')
            } else {
                position.left = event.clientX - left
                $('#frgef--neo-page-builder-tooltip').addClass('frgef--neo-page-builder-tooltip-position-center')
            }
        }

        $('#frgef--neo-page-builder-tooltip').css(position)
    }
}

/**
 * Positions the interactive header input within the header container.
 *
 * This method calculates the width and position of the input element inside each interactive header container
 * and adjusts its position accordingly.
 *
 * @returns {void}
 */
function interactiveHeaderInputPosition() {

    const containers = $('.frgef--neo-page-builder-headband-interactive')
    if (containers.length > 0) {
        for (let i = 0; i < containers.length; i++) {
            const container = containers[i]
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
    }
}

/**
 * Automatically resizes the resizable modal based on the window width and modal width.
 * If the modal width is greater than or equal to half of the window width minus 20 pixels,
 * the modal and wrapper widths are adjusted accordingly.
 * Otherwise, the wrapper width is adjusted to accommodate the modal width.
 *
 * @function autoResizeResizableModal
 * @returns {void}
 */
function autoResizeResizableModal() {

    if ($('#frgef--neo-page-builder-resizable-modal-container[data-mode="sidebar"]').length > 0
    ) {
        const modalWidth = $('#frgef--neo-page-builder-resizable-modal-container[data-mode="sidebar"]').width()
        if (modalWidth >= window.innerWidth /2 - 20) {
            $('#frgef--neo-page-builder-resizable-modal-container[data-mode="sidebar"]').css({width: window.innerWidth / 2 - 20, left:  window.innerWidth - modalWidth - 20})
            $('#frgef--neo-page-builder-wrapper').css({width: window.innerWidth / 2 + 20})
            resizedModalOffset.left = window.innerWidth - modalWidth - 20
        } else {
            $('#frgef--neo-page-builder-wrapper').css({width: window.innerWidth - modalWidth})
        }
    }
}

/**
 * Sets up a click event listener on a specific element that opens a resizable modal.
 * The type of the modal (either 'settings' or 'revisions') is determined by the data-title attribute of the element.
 * The content of the modal is generated based on the type and the closest ancestor of the clicked element.
 * The modal is appended to the #frgef--neo-page-builder element and positioned according to the resizedModalOffset and resizedModalSize variables.
 * The modal is made draggable within the window and its position is updated in the resizedModalOffset variable.
 * The modal can be resized by dragging the #frgef--neo-page-builder-resizable-modal-resizer element and the size is updated in the resizedModalSize variable.
 * The resizableModalListeners function is called to add any additional event listeners on the modal.
 *
 * @returns {void}
 */
function settingsListener() {

    $('.frgef--neo-page-builder-headband-header-icon-container-draggable-modal').off('click')
    $('.frgef--neo-page-builder-headband-header-icon-container-draggable-modal').on('click', function () {

        $('#frgef--neo-page-builder-resizable-modal-container').remove()
        $('#frgef--neo-page-builder-wrapper').removeAttr('style')

        $('.frgef--neo-page-builder-fixed-modal').remove()
        $('[class^="frgef--neo-page-builder-headband"] button').prop('disabled', false)

        const type = $(this).hasClass('frgef--neo-page-builder-headband-header-icon-container-cog') ? 'settings' : 'revisions'

        let elementType = 'page'
        let elementID = null
        let elementPattern = null
        let data = null
        let friendlyName = 'Page'
        let info = {}

        if (type === 'settings') {

            if ($(this).closest('.frgef--neo-page-builder-block').length > 0) {

                elementType = 'block'
                elementID = $(this).closest('.frgef--neo-page-builder-block').data('uuid')
                elementPattern = $(this).closest('.frgef--neo-page-builder-block').data('pattern')
                data = page.entitiesSettings[$(this).closest('.frgef--neo-page-builder-block').data('pattern')] ?? null
                friendlyName = $($(this).closest('.frgef--neo-page-builder-block').find('.frgef--neo-page-builder-headband-input')[0]).val()

            } else if ($(this).closest('.frgef--neo-page-builder-section').length > 0) {

                elementType = 'section'
                elementID = $(this).closest('.frgef--neo-page-builder-section').data('uuid')
                elementPattern = $(this).closest('.frgef--neo-page-builder-section').data('pattern')
                data = page.entitiesSettings[$(this).closest('.frgef--neo-page-builder-section').data('pattern')] ?? null
                friendlyName = $($(this).closest('.frgef--neo-page-builder-section').find('.frgef--neo-page-builder-headband-input')[0]).val()

            } else if ($(this).closest('.frgef--neo-page-builder-row').length > 0) {

                elementType = 'row'
                elementID = $(this).closest('.frgef--neo-page-builder-row').data('uuid')
                elementPattern = $(this).closest('.frgef--neo-page-builder-row').data('pattern')
                data = page.entitiesSettings[$(this).closest('.frgef--neo-page-builder-row').data('pattern')] ?? null
                friendlyName = $($(this).closest('.frgef--neo-page-builder-row').find('.frgef--neo-page-builder-headband-input')[0]).val()
            }

            let entitySettings = page.entitiesSettings[elementID] ?? null
            info = {elementID, elementType, elementPattern, data, friendlyName, entitySettings}

        } else if (type === 'revisions') {

            let entitySettings = page.entitiesSettings[elementID] ?? null
            data = JSON.stringify(getRevisions('page'))
            info = {elementID, elementType, elementPattern, data, friendlyName, entitySettings, currentRevision}
        }

        $.post(
            '/_npb/resizable-modal',
            {
                type: type,
                info: info,
                mode: resizableModalDisplayMode
            },
            function (data, status) {
                if (status === 'success') {

                    $('#frgef--neo-page-builder').append($(data))

                    if (resizableModalDisplayMode === 'sidebar') {
                        const modalWidth = $('#frgef--neo-page-builder-resizable-modal-container').width()
                        $('#frgef--neo-page-builder-wrapper').css({width: 'calc(100% - ' + modalWidth + 'px)'})
                    }

                    $('#frgef--neo-page-builder-resizable-modal-container').css({
                        top: resizedModalOffset.top,
                        left: resizedModalOffset.left === null
                            ? window.innerWidth - $('#frgef--neo-page-builder-resizable-modal-container').width() - 20
                            : resizedModalOffset.left,
                        width: resizedModalSize.width,
                        height: resizedModalSize.height,
                    })

                    $('#frgef--neo-page-builder-resizable-modal-container').draggable({
                        containment: 'window',
                        handle: '#frgef--neo-page-builder-resizable-modal-header',
                        iframeFix: true,
                        cancel: '#frgef--neo-page-builder-resizable-modal-container:not([data-mode="standalone"])',
                        stop: function( event, ui ) {
                            resizedModalOffset.left = Math.max(0, ui.position.left)
                            resizedModalOffset.top = Math.max(0, ui.position.top)
                        }
                    })

                    $('#frgef--neo-page-builder-resizable-modal-resizer').off()
                    $('#frgef--neo-page-builder-resizable-modal-resizer').on('mousedown', function (e) {

                        if ($('#frgef--neo-page-builder-resizable-modal-container').attr('data-mode') !== 'fullscreen') {

                            $(this).addClass('frgef--neo-page-builder-resizable-modal-resizer-show')

                            startX = e.clientX
                            startY = e.clientY
                            startWidth = parseInt($('#frgef--neo-page-builder-resizable-modal-container').width(), 10)
                            startHeight = parseInt($('#frgef--neo-page-builder-resizable-modal-container').height(), 10)

                            $(document).on('mousemove', startDrag)
                        }

                        $(document).on('mouseup', function () {
                            $('#frgef--neo-page-builder-resizable-modal-resizer').removeClass('frgef--neo-page-builder-resizable-modal-resizer-show')
                            $(document).off('mousemove')
                            $(document).off('mouseup')
                            $(document).on('mousemove', function (event) {
                                tooltipPosition(event)
                            })
                        })
                    })

                    resizableModalListeners()

                } else {
                    reportMessage('error', data)
                }
            }
        )
    })
}

function startDrag(ev) {

    if ($('#frgef--neo-page-builder-resizable-modal-container').attr('data-mode') === 'standalone') {

        let w = startWidth + ev.clientX - startX
        let h = startHeight + ev.clientY - startY
        let offset = $('#frgef--neo-page-builder-resizable-modal-container').offset()
        resizedModalSize = {height: h, width: w}

        if (w >= 380 && offset.left + w < window.innerWidth - 10) {
            $('#frgef--neo-page-builder-resizable-modal-container').css({width: w})
        }

        if (h >= 195 && offset.top + h < window.innerHeight - 10) {
            $('#frgef--neo-page-builder-resizable-modal-container').css({height: h})
        }

    } else if ($('#frgef--neo-page-builder-resizable-modal-container').attr('data-mode') === 'sidebar') {

        let w = window.innerWidth - ev.clientX
        let offset = $('#frgef--neo-page-builder-resizable-modal-container').offset()
        resizedModalSize = {height: resizedModalSize.height, width: w}

        if (w >= 380 && w < window.innerWidth / 2 - 10) {
            $('#frgef--neo-page-builder-resizable-modal-container').css({width: w})
            $('#frgef--neo-page-builder-wrapper').css({width: window.innerWidth - w})
        }

        interactiveHeaderInputPosition()
    }
}

/**
 * Updates the page data based on the current state of the HTML elements.
 *
 * @return {void}
 */
function updatePage() {

    let updatedPage = []
    const rows = $('#frgef--neo-page-builder-rows-wrapper > .frgef--neo-page-builder-row')
    for (let i = 0; i < rows.length; i++) {

        let row = rows[i]
        let rowData = {
            elementType: 'row',
            elementID: $(row).data('uuid'),
            elementPattern: $(row).data('pattern'),
            friendlyName: $($(row).find('.frgef--neo-page-builder-headband-input')[0]).val(),
            children: []
        }

        if (rowData.elementPattern.includes('special')) {

            let children = $(row).children().map(function() {
                if ($(this).hasClass('frgef--neo-page-builder-row-special-blocks') || $(this).hasClass('frgef--neo-page-builder-row-special-section')) {
                    return this
                }
            }).get()

            for (let j = 0; j < children.length; j++) {
                if ($(children[j]).hasClass('frgef--neo-page-builder-row-special-blocks')) {

                    let blocksWrappers = $(children[j]).find('.frgef--neo-page-builder-blocks-wrapper')
                    for (let l = 0; l < blocksWrappers.length; l++) {

                        let blocks = $(blocksWrappers[l]).find('.frgef--neo-page-builder-block')
                        let wrapper = {
                            type: 'blocks-wrapper',
                            entities: []
                        }

                        for (let k = 0; k < blocks.length; k++) {
                            wrapper.entities.push({
                                elementType: 'block',
                                elementID: $(blocks[k]).data('uuid'),
                                elementPattern: $(blocks[k]).data('pattern'),
                                friendlyName: $($(blocks[k]).find('.frgef--neo-page-builder-headband-input')[0]).val(),
                            })
                        }
                        rowData.children.push(wrapper)
                    }

                } else if ($(children[j]).hasClass('frgef--neo-page-builder-row-special-section')) {

                    let sections = $(children[j]).find('.frgef--neo-page-builder-section-special').map(function() {

                        let section = {
                            elementType: 'section',
                            elementID: $(this).data('uuid'),
                            elementPattern: $(this).data('pattern'),
                            friendlyName: $($(this).find('.frgef--neo-page-builder-headband-input')[0]).val(),
                            children: []
                        }

                        let blocksWrappers = $(this).find('.frgef--neo-page-builder-blocks-wrapper')
                        for (let l = 0; l < blocksWrappers.length; l++) {

                            let blocks = $(blocksWrappers[l]).find('.frgef--neo-page-builder-block')
                            let wrapper = {
                                type: 'blocks-wrapper',
                                entities: []
                            }

                            for (let k = 0; k < blocks.length; k++) {
                                wrapper.entities.push({
                                    elementType: 'block',
                                    elementID: $(blocks[k]).data('uuid'),
                                    elementPattern: $(blocks[k]).data('pattern'),
                                    friendlyName: $($(blocks[k]).find('.frgef--neo-page-builder-headband-input')[0]).val(),
                                })
                            }
                            section.children.push(wrapper)
                        }
                        return section
                    }).get()
                    rowData.children.push({type: 'sections', entities: sections})
                }
            }

        } else if (rowData.elementPattern === 'full') {

            let blocks = $(row).find('.frgef--neo-page-builder-block').map(function() {
                return {
                    elementType: 'block',
                    elementID: $(this).data('uuid'),
                    elementPattern: $(this).data('pattern'),
                    friendlyName: $($(this).find('.frgef--neo-page-builder-headband-input')[0]).val(),
                }
            }).get()

            rowData.children = [{
                elementType: 'blocks-wrapper',
                children: blocks
            }]

        } else {

            let sections = $(row).find('.frgef--neo-page-builder-section').map(function() {

                let section = {
                    elementType: 'section',
                    elementID: $(this).data('uuid'),
                    elementPattern: $(this).data('pattern'),
                    friendlyName: $($(this).find('.frgef--neo-page-builder-headband-input')[0]).val(),
                    children: []
                }

                let blocksWrappers = $(this).find('.frgef--neo-page-builder-blocks-wrapper')
                for (let j = 0; j < blocksWrappers.length; j++) {

                    let blocks = $(blocksWrappers[j]).find('.frgef--neo-page-builder-block')
                    let wrapper = {
                        type: 'blocks-wrapper',
                        entities: []
                    }

                    for (let k = 0; k < blocks.length; k++) {
                        wrapper.entities.push({
                            elementType: 'block',
                            elementID: $(blocks[k]).data('uuid'),
                            elementPattern: $(blocks[k]).data('pattern'),
                            friendlyName: $($(blocks[k]).find('.frgef--neo-page-builder-headband-input')[0]).val()
                        })
                    }
                    section.children.push(wrapper)
                }
                return section
            }).get()
            rowData.children = sections
        }
        updatedPage.push(rowData)
    }
    page.rows = updatedPage
}

function resizableModalListeners() {

    //Header buttons
    $('#frgef--neo-page-builder-resizable-modal-header-icon-fullscreen').off('click')
    $('#frgef--neo-page-builder-resizable-modal-header-icon-fullscreen').on('click', function () {
        const data = $('#frgef--neo-page-builder-resizable-modal-container').attr('data-mode')
        if (data === 'standalone' || data === 'sidebar') {
            $('#frgef--neo-page-builder-resizable-modal-container').attr('data-mode', 'fullscreen')
            resizableModalDisplayMode = 'fullscreen'
        } else {
            $('#frgef--neo-page-builder-resizable-modal-container').attr('data-mode', 'standalone')
            resizableModalDisplayMode = 'standalone'
        }
        $('#frgef--neo-page-builder-tooltip').remove()
        $('#frgef--neo-page-builder-wrapper').removeAttr('style')
        interactiveHeaderInputPosition()
    })

    $('#frgef--neo-page-builder-resizable-modal-header-icon-sidebar').off('click')
    $('#frgef--neo-page-builder-resizable-modal-header-icon-sidebar').on('click', function () {
        const data = $('#frgef--neo-page-builder-resizable-modal-container').attr('data-mode')
        if (data === 'standalone' || data === 'fullscreen') {
            $('#frgef--neo-page-builder-resizable-modal-container').attr('data-mode', 'sidebar')
            const modalWidth = $('#frgef--neo-page-builder-resizable-modal-container').width()
            $('#frgef--neo-page-builder-wrapper').css({width: 'calc(100% - ' + modalWidth + 'px)'})
            resizableModalDisplayMode = 'sidebar'
        } else {
            $('#frgef--neo-page-builder-resizable-modal-container').attr('data-mode', 'standalone')
            $('#frgef--neo-page-builder-wrapper').removeAttr('style')
            resizableModalDisplayMode = 'standalone'
        }
        $('#frgef--neo-page-builder-tooltip').remove()
        interactiveHeaderInputPosition()
    })

    $('#frgef--neo-page-builder-resizable-modal-header-icon-details').off('click')
    $('#frgef--neo-page-builder-resizable-modal-header-icon-details').on('click', function () {

    })

    // Footer buttons
    $('#frgef--neo-page-builder-resizable-modal-footer-icon-close').off('click')
    $('#frgef--neo-page-builder-resizable-modal-footer-icon-close').on('click', function () {
        $('#frgef--neo-page-builder-resizable-modal-container').remove()
        $('#frgef--neo-page-builder-tooltip').remove()
        $('#frgef--neo-page-builder-wrapper').removeAttr('style')
    })

    $('#frgef--neo-page-builder-resizable-modal-footer-icon-backward').off('click')
    $('#frgef--neo-page-builder-resizable-modal-footer-icon-backward').on('click', function () {

    })

    $('#frgef--neo-page-builder-resizable-modal-footer-icon-forward').off('click')
    $('#frgef--neo-page-builder-resizable-modal-footer-icon-forward').on('click', function () {

    })

    $('#frgef--neo-page-builder-resizable-modal-footer-icon-check').off('click')
    $('#frgef--neo-page-builder-resizable-modal-footer-icon-check').on('click', function () {

        $('#frgef--neo-page-builder-resizable-modal-container').remove()
        $('#frgef--neo-page-builder-tooltip').remove()
        $('#frgef--neo-page-builder-wrapper').removeAttr('style')
    })
}

/**
 * Downloads the given JavaScript object as JSON file.
 *
 * @param {object} exportObj - The object to be exported as JSON.
 * @param {string} exportName - The name of the exported file (without file extension).
 * @return {void} - This function does not return anything.
 */
function downloadObjectAsJson(exportObj, exportName){
    let json = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj))
    let link = '<a style="display: none;" id="frgef--neo-page-builder-config-downloader"></a>'
    $(document.body).append(link)
    $('#frgef--neo-page-builder-config-downloader').attr('href', json).attr('download', exportName + '.json')
    $('#frgef--neo-page-builder-config-downloader')[0].click()
    $('#frgef--neo-page-builder-config-downloader')[0].remove()
}

/**
 * Opens a file dialog to import a configuration file.
 *
 * @function importConfigFromFile
 * @returns {void}
 */
function importConfigFromFile() {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'
    fileInput.addEventListener('change', handleFileSelect)
    fileInput.click()
}

/**
 * Handles file selection event.
 *
 * @param {Event} event - The file selection event object.
 * @return {void}
 */
function handleFileSelect(event) {
    const file = event.target.files[0]
    const reader = new FileReader()
    reader.onload = function (e) {
        const contents = e.target.result
        page = JSON.parse(contents)
    }
    reader.readAsText(file)
}

/**
 * Sets the revision for a given key in the local storage.
 * If the key does not exist in the local storage, a new entry will be created.
 * The maximum number of revisions is limited to 9. If more revisions exist, the oldest revision will be removed.
 * Each revision contains a date and settings object.
 *
 * @param {string} key - The key to set the revision for.
 * @return {void}
 */
function setRevision(key) {

    //window.localStorage.clear()
    if (window.localStorage.getItem('neo-page-builder') === null) {
        let json = {}
        json[key] = []
        window.localStorage.setItem('neo-page-builder', JSON.stringify(json))
    }

    let revisions = JSON.parse(window.localStorage.getItem('neo-page-builder'))
    if (revisions[key] === undefined) {
        revisions[key] = []
    }

    let currentRevisions = []
    for (let i = 0; i < 9; i++) {
        if (revisions[key][i]) {
            currentRevisions.push(revisions[key][i])
        }
    }

    revisions[key] = currentRevisions
    currentRevision = {date: timestamp('encode'), settings: page}
    revisions[key].unshift(currentRevision)
    window.localStorage.setItem('neo-page-builder', JSON.stringify(revisions))
}

/**
 * Retrieves the revisions of a given key from localStorage.
 *
 * @param {string} key - The key used to store the revisions in localStorage.
 * @return {null|any} - The revisions stored under the specified key, or null if the key is not found.
 */
function getRevisions(key) {
    let storage = window.localStorage.getItem('neo-page-builder')
    storage = storage !== null ? JSON.parse(storage) : null
    return storage[key] !== undefined ? storage[key] : null
}

/**
 * Generates a timestamp based on given mode and optional data.
 *
 * @param {string} mode - The mode can be 'encode' or 'decode'
 * @param {string|null} [data=null] - Optional data required for decoding timestamp
 * @return {string|null} - The generated timestamp or null if mode is invalid
 */
function timestamp(mode, data = null) {

    if (mode === 'encode') {
        let d = new Date
        return d.getFullYear()
            + ('0' + (d.getMonth() + 1)).slice(-2)
            + ('0' + d.getDate()).slice(-2)
            + ('0' + d.getHours()).slice(-2)
            + ('0' + d.getMinutes()).slice(-2)
            + ('0' + d.getSeconds()).slice(-2)
    }

    if (data !== null && mode === 'decode') {
        const year = data.slice(0, 4)
        const month = data.slice(4, 6)
        const date = data.slice(6, 8)
        const hour = data.slice(8, 10)
        const minutes = data.slice(10, 12)
        const seconds = data.slice(12)
        return year + '-' + month + '-' + date + ' ' + hour + ':' + minutes + ':' + seconds
    }

    return null
}
