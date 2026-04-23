<?php

function env_value(string $key, string $default = ''): string {
    $v = $_ENV[$key] ?? getenv($key);
    return $v === false || $v === null || $v === '' ? $default : (string)$v;
}

return [
    'app_secret' => env_value('APP_SECRET', 'change-me-training-only'),
    'toggles' => [
        'unsafe_sql_search' => env_value('UNSAFE_SQL_SEARCH', '0') === '1',
        'unsafe_reset_compare' => env_value('UNSAFE_RESET_COMPARE', '0') === '1',
        'unsafe_avatar_path' => env_value('UNSAFE_AVATAR_PATH', '0') === '1',
        'unsafe_template_render' => env_value('UNSAFE_TEMPLATE_RENDER', '0') === '1',
    ]
];
