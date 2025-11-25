<?php
// This file is part of the TTS Reader block - Moodle plugin
// English language strings
// @copyright  2025 Tu Nombre o Institución
// @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later

defined('MOODLE_INTERNAL') || die();

// Plugin information
$string['pluginname'] = 'TTS Reader';
$string['tts_reader'] = 'TTS Reader';
$string['tts_reader:addinstance'] = 'Add a new TTS Reader block';
$string['tts_reader:myaddinstance'] = 'Add a new TTS Reader block to Dashboard';
$string['tts_reader:use'] = 'Use the TTS Reader';

// Configuration
$string['config_header'] = 'TTS Reader settings';
$string['config_position'] = 'Widget position';
$string['config_position_desc'] = 'Location of the floating widget on the screen';
$string['position_right_center'] = 'Right - Center';
$string['position_right_top'] = 'Right - Top';
$string['position_right_bottom'] = 'Right - Bottom';
$string['position_left_center'] = 'Left - Center';
$string['position_left_top'] = 'Left - Top';
$string['position_left_bottom'] = 'Left - Bottom';

$string['config_auto_minimize'] = 'Start minimized';
$string['config_auto_minimize_desc'] = 'The widget will start minimized when the page loads';

$string['config_show_indicator'] = 'Show status indicator';
$string['config_show_indicator_desc'] = 'Displays an indicator when the reader is active';

$string['config_default_speed'] = 'Default speed';
$string['config_default_speed_desc'] = 'Default reading speed (0.5 - 2.0)';

$string['config_default_volume'] = 'Default volume';
$string['config_default_volume_desc'] = 'Default volume (0 - 100)';

// Widget interface
$string['widget_title'] = 'TTS Reader';
$string['voice_label'] = 'Voice';
$string['speed_label'] = 'Speed';
$string['volume_label'] = 'Volume';
$string['play_button'] = 'Play';
$string['pause_button'] = 'Pause';
$string['stop_button'] = 'Stop';
$string['status_ready'] = 'Ready to read this page';
$string['status_reading'] = 'Reading...';
$string['status_paused'] = 'Paused';
$string['status_completed'] = 'Reading completed';
$string['loading_voices'] = 'Loading voices...';
$string['no_spanish_voices'] = 'No Spanish voices available';

// Privacy
$string['privacy:metadata'] = 'The TTS Reader block does not store any personal data. It only saves user preferences locally in the browser using localStorage.';