<?php

echo json_encode(main());

function main() {
	$stringSettings = getSettings();
	if (!$stringSettings) {
	
		error_log('LOGIN FAILED');
		error_log('======= GET =========='."\n".var_export($_GET,true));
		error_log('======= POST =========='."\n".var_export($_POST,true));
		echo '{"status":"error","message":"login failed"}';
	}
	else {
	$settings = json_decode($stringSettings);

	$loginResponse = json_decode(file_get_contents(__DIR__.'/json/login.json'));

$loginResponse->settings=$settings;

	return $loginResponse;
	}
}

function getSettings() {
	$user = $_POST['login'];
	$pass = $_POST['password'];
	if (strlen($user)<50 && strlen($pass)<50) {
	// for future use: :1 is the installation id of a user.
	$dir = md5($user.':'.$pass);
	$dirPath = __DIR__ . '/'. $dir;
	$fileName = $dirPath . '/settings.json';

error_log("testing $user: ".$fileName );
	if (is_dir($dirPath)) {
		if (file_exists($fileName)) {
			error_log( 'success');
			return file_get_contents($fileName);
		}
	}
	}
	return false;
}


