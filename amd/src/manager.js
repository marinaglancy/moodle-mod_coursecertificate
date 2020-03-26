// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * This module instantiates the functionality for actions on course certificates.
 *
 * @module      mod_coursecertificate/manager
 * @package     mod_coursecertificate
 * @copyright   2020 Mikel Martín <mikel@moodle.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define([
    'core/ajax',
    'core/notification',
    'core/templates',
    'core/str'
], function(
    Ajax,
    Notification,
    Templates,
    Str
) {

    /** @type {Object} The list of selectors for the coursecertificate module. */
    const SELECTORS = {
        AUTOMATICSENDREGION: "[data-region='automaticsend-alert']",
        TOGGLEAUTOMATICSEND: "[data-action='toggle-automaticsend']"
    },
    /** @type {Object} The list of templates for the coursecertificate module. */
    TEMPLATES = {
        LOADING: 'core/loading',
        AUTOMATICSENDALERT: 'mod_coursecertificate/automaticsend_alert'
    },
    /** @type {Object} The list of services for the coursecertificate module. */
    SERVICES = {
        UPDATEAUTOMATICSEND: 'mod_coursecertificate_update_certificate_automaticsend'
    };

    /**
     * Toggle the automaticsend setting for coursecertificate.
     *
     * @param {Element} automaticsendregion
     */
    function toggleAutomaticSend(automaticsendregion) {
        M.util.js_pending('mod_coursecertificate_toggle_automaticsend');
        const {certificateid, automaticsend} = automaticsendregion.querySelector(SELECTORS.TOGGLEAUTOMATICSEND).dataset;
        const newstatus = automaticsend === '0';
        const strings = newstatus
        ? [{'key': 'confirmation', component: 'admin'},
            {'key': 'enableautomaticsend', component: 'coursecertificate'},
            {'key': 'confirm'},
            {'key': 'cancel'}]
        : [{'key': 'confirmation', component: 'admin'},
            {'key': 'disableautomaticsend', component: 'coursecertificate'},
            {'key': 'confirm'},
            {'key': 'cancel'}];
        // Get strings.
        Str.get_strings(strings).then((s) => {
            // Show confirm notification.
            Notification.confirm(s[0], s[1], s[2], s[3], () => {
                // Show loading temaplte.
                Templates.render(TEMPLATES.LOADING, {visible: true}, '')
                .then((html) => {
                    automaticsendregion.innerHTML = html;
                    // Call external API to update automaticsend setting.
                    return Ajax.call([{
                        methodname: SERVICES.UPDATEAUTOMATICSEND,
                        args: {certificateid: certificateid, automaticsend: newstatus}
                    }])[0];
                })
                .then(() => {
                    // Reload automatic send alert template.
                    return  Templates.render(
                        TEMPLATES.AUTOMATICSENDALERT,
                        {certificateid: certificateid, automaticsend: newstatus},
                        ''
                    );
                })
                .then((html) => {
                    automaticsendregion.innerHTML = html;
                    M.util.js_complete('mod_coursecertificate_toggle_automaticsend');
                    return null;

                });
            });
            return null;
        }).fail(Notification.exception);
    }

    return {
        init: function() {
            const automaticsendregion = document.querySelector(SELECTORS.AUTOMATICSENDREGION);
            automaticsendregion.addEventListener('click', (e) => {
                if (e.target && e.target.matches(SELECTORS.TOGGLEAUTOMATICSEND)) {
                    toggleAutomaticSend(automaticsendregion);
                }
            });
        }
    };
});