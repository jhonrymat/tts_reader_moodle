<?php
// This file is part of Moodle - http://moodle.org/

defined('MOODLE_INTERNAL') || die();

class block_tts_reader extends block_base {
    
    public function init() {
        $this->title = get_string('pluginname', 'block_tts_reader');
    }
    
    public function applicable_formats() {
        // Este bloque aparecerá en todas las páginas
        return array(
            'all' => true,
            'site' => true,
            'course' => true,
            'mod' => true,
            'my' => true
        );
    }
    
    public function instance_allow_multiple() {
        return false; // Solo una instancia por página
    }
    
    public function has_config() {
        return true; // Tiene configuración global
    }
    
    public function hide_header() {
        return true; // Ocultar header del bloque
    }
    
    public function get_content() {
        global $PAGE, $CFG;
        
        if ($this->content !== null) {
            return $this->content;
        }
        
        $this->content = new stdClass();
        $this->content->text = ''; // El widget es flotante, no necesita contenido visible
        $this->content->footer = '';
        
        // Inyectar CSS y JavaScript
        $PAGE->requires->css('/blocks/tts_reader/styles.css');
        $PAGE->requires->js('/blocks/tts_reader/tts_widget.js', true);
        
        // Obtener configuración
        $position = get_config('block_tts_reader', 'widget_position') ?: 'right-center';
        $auto_minimize = get_config('block_tts_reader', 'auto_minimize') ?: 1;
        $show_indicator = get_config('block_tts_reader', 'show_indicator') ?: 1;
        
        // Pasar configuración a JavaScript
        $config = array(
            'position' => $position,
            'autoMinimize' => (bool)$auto_minimize,
            'showIndicator' => (bool)$show_indicator,
            'wwwroot' => $CFG->wwwroot
        );
        
        $PAGE->requires->js_init_code("
            if (typeof TTSWidget !== 'undefined') {
                TTSWidget.init(" . json_encode($config) . ");
            }
        ");
        
        return $this->content;
    }
}