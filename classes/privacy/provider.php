<?php
// This file is part of Moodle - http://moodle.org/

namespace block_tts_reader\privacy;

defined('MOODLE_INTERNAL') || die();

/**
 * Privacy Subsystem implementation for block_tts_reader.
 *
 * Este plugin no almacena datos personales en la base de datos de Moodle.
 * Las preferencias del usuario se guardan localmente en el navegador usando localStorage.
 */
class provider implements \core_privacy\local\metadata\null_provider {
    
    /**
     * Get the language string identifier with the component's language
     * file to explain why this plugin stores no data.
     *
     * @return string
     */
    public static function get_reason() : string {
        return 'privacy:metadata';
    }
}