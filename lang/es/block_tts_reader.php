<?php
// This file is part of Moodle - http://moodle.org/

defined('MOODLE_INTERNAL') || die();

// Información del plugin
$string['pluginname'] = 'Lector de Voz TTS';
$string['tts_reader'] = 'Lector de Voz';
$string['tts_reader:addinstance'] = 'Añadir un nuevo bloque de Lector de Voz';
$string['tts_reader:myaddinstance'] = 'Añadir un nuevo bloque de Lector de Voz al Área personal';
$string['tts_reader:use'] = 'Usar el Lector de Voz';

// Configuración
$string['config_header'] = 'Configuración del Lector de Voz';
$string['config_position'] = 'Posición del widget';
$string['config_position_desc'] = 'Ubicación del widget en la pantalla';
$string['position_right_center'] = 'Derecha - Centro';
$string['position_right_top'] = 'Derecha - Arriba';
$string['position_right_bottom'] = 'Derecha - Abajo';
$string['position_left_center'] = 'Izquierda - Centro';
$string['position_left_top'] = 'Izquierda - Arriba';
$string['position_left_bottom'] = 'Izquierda - Abajo';

$string['config_auto_minimize'] = 'Minimizar automáticamente';
$string['config_auto_minimize_desc'] = 'El widget inicia minimizado cuando se carga la página';

$string['config_show_indicator'] = 'Mostrar indicador de estado';
$string['config_show_indicator_desc'] = 'Muestra un indicador cuando el lector está activo';

$string['config_default_speed'] = 'Velocidad predeterminada';
$string['config_default_speed_desc'] = 'Velocidad de lectura por defecto (0.5 - 2.0)';

$string['config_default_volume'] = 'Volumen predeterminado';
$string['config_default_volume_desc'] = 'Volumen por defecto (0 - 100)';

// Interfaz del widget
$string['widget_title'] = 'Lector de Voz';
$string['voice_label'] = 'Voz';
$string['speed_label'] = 'Velocidad';
$string['volume_label'] = 'Volumen';
$string['play_button'] = 'Reproducir';
$string['pause_button'] = 'Pausar';
$string['stop_button'] = 'Detener';
$string['status_ready'] = 'Listo para leer esta página';
$string['status_reading'] = 'Leyendo...';
$string['status_paused'] = 'Pausado';
$string['status_completed'] = 'Lectura completada ✓';
$string['loading_voices'] = 'Cargando voces...';
$string['no_spanish_voices'] = 'Sin voces en español disponibles';

// Privacidad
$string['privacy:metadata'] = 'El bloque Lector de Voz no almacena ningún dato personal. Solo guarda preferencias locales en el navegador del usuario.';