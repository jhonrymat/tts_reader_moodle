<?php
// This file is part of Moodle - http://moodle.org/

defined('MOODLE_INTERNAL') || die();

if ($ADMIN->fulltree) {
    
    // Header
    $settings->add(new admin_setting_heading(
        'block_tts_reader/config_header',
        get_string('config_header', 'block_tts_reader'),
        ''
    ));
    
    // Posición del widget
    $positions = array(
        'right-center' => get_string('position_right_center', 'block_tts_reader'),
        'right-top' => get_string('position_right_top', 'block_tts_reader'),
        'right-bottom' => get_string('position_right_bottom', 'block_tts_reader'),
        'left-center' => get_string('position_left_center', 'block_tts_reader'),
        'left-top' => get_string('position_left_top', 'block_tts_reader'),
        'left-bottom' => get_string('position_left_bottom', 'block_tts_reader'),
    );
    
    $settings->add(new admin_setting_configselect(
        'block_tts_reader/widget_position',
        get_string('config_position', 'block_tts_reader'),
        get_string('config_position_desc', 'block_tts_reader'),
        'right-center',
        $positions
    ));
    
    // Auto minimizar
    $settings->add(new admin_setting_configcheckbox(
        'block_tts_reader/auto_minimize',
        get_string('config_auto_minimize', 'block_tts_reader'),
        get_string('config_auto_minimize_desc', 'block_tts_reader'),
        1
    ));
    
    // Mostrar indicador
    $settings->add(new admin_setting_configcheckbox(
        'block_tts_reader/show_indicator',
        get_string('config_show_indicator', 'block_tts_reader'),
        get_string('config_show_indicator_desc', 'block_tts_reader'),
        1
    ));
    
    // Velocidad predeterminada
    $settings->add(new admin_setting_configtext(
        'block_tts_reader/default_speed',
        get_string('config_default_speed', 'block_tts_reader'),
        get_string('config_default_speed_desc', 'block_tts_reader'),
        '1.0',
        PARAM_FLOAT
    ));
    
    // Volumen predeterminado
    $settings->add(new admin_setting_configtext(
        'block_tts_reader/default_volume',
        get_string('config_default_volume', 'block_tts_reader'),
        get_string('config_default_volume_desc', 'block_tts_reader'),
        '100',
        PARAM_INT
    ));
}