// ==UserScript==
// @name         MC Chat Transcript SSR Copier
// @namespace    https://github.com/kdevnel/Chat-transcripts-ssr
// @version      0.11
// @description  Add the ability to copy the SSR from a chat transcript
// @author       kdevnel
// @require      https://code.jquery.com/jquery-1.12.4.js
// @match        https://mc.a8c.com/support-stats/happychat/*
// @updateURL    https://github.com/kdevnel/Chat-Transcript-SSR-Copier/raw/main/mc-chat-trancript-ssr-copy.user.js
// @grant        none
// ==/UserScript==

var $ = window.jQuery;

function collapseSSR() {
    // Collapse the entire SSR
    $('.hapdash-chat .hapdash-chat-bubble.type-message.chat-MessageToOperator').each(function () {
        var messageContents = $(this).find('p:nth-of-type(1)').html();
        if (messageContents.startsWith("Website Status Report") || messageContents.startsWith("System Status Report") || messageContents.includes("### WordPress Environment ###")) {
            $(this).find('div:nth-of-type(1)').after('<div class="link-bubble"><p><a href="#" class="show-ssr-transcript" onClick="return false;">CLICK HERE TO SHOW SSR</a></p></div>');
            $(this).find('div:nth-of-type(1)').addClass('ssr-message').hide();
            $(this).find('div:nth-of-type(1)').after('<div class="link-bubble-copy"><p><a href="#" class="copy-SSR">Copy SSR to clipboard</a></p></div>');
        }
    });
}

function copyTranscriptSSR() {
    // Allow copying of the SSR directly from the chat transcript
    $('.ssr-message').each(function (message) {
        var $thisMessage = $(this);
        var $thisHTML = $thisMessage.html();
        var thisSSRid = Math.floor(Math.random() * 90000) + 10000;
        var btnID = 'copy-';
        $thisMessage.attr('data-ssr', thisSSRid).wrapInner('<div id="ssr-contents-' + thisSSRid + '"></div>');
        $thisMessage.append('<a href="#" class="copy-SSR" id="copy-' + thisSSRid + '" data-ssr="' + thisSSRid + '" style="font-size: 16px;">Copy SSR to clipboard</a>');
        $('.link-bubble-copy .copy-SSR').attr('id', btnID + thisSSRid).attr('data-ssr', thisSSRid);


    });
}

// === Copy the SSR to the clipboard ===================================================
$("body").on('click', '.copy-SSR', function () {
    var SSRid = $(this).attr('data-ssr');
    copyToClipboard(document.getElementById('ssr-contents-' + SSRid));
    $(this).html('COPIED!');
    setTimeout(function () { $('.copy-SSR').text('Copy SSR to clipboard') }, 3000);
});

// === Helper function: copy to clipboard ===================================================
function copyToClipboard(elem) {
    // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";
    var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
    var origSelectionStart, origSelectionEnd;
    if (isInput) {
        // can just use the original source element for the selection and copy
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
    } else {
        // must use a temporary form element for the selection and copy
        target = document.getElementById(targetId);
        if (!target) {
            var target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = elem.textContent;
    }
    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);

    // copy the selection
    var succeed;
    try {
        succeed = document.execCommand("copy");
    } catch (e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }

    if (isInput) {
        // restore prior selection
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
    } else {
        // clear temporary content
        target.textContent = "";
    }
    return succeed;
}

/* Hook all of the necessary functions to page load */
$(document).ready(function () {
    collapseSSR();
    copyTranscriptSSR();
});

$('body').on('click', '.show-ssr-transcript', function () {
    $('.link-bubble').remove();
    $('.ssr-message').slideDown();
});
