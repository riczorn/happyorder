<?php
/**
* HappyOrder
* 
* mock the node backend for demo purposes
* support@happyorder.it
*/

$command = $_SERVER['REQUEST_URI'];
$command = str_replace('/my/','',$command);
switch ($command) {
case 'status': echo file_get_contents(__DIR__.'/json/status.json');
		break;
case 'login': 
	    require(__DIR__.'/login.php'); 
		break;
default:
		$err = new stdClass();
		$err->id = 500;
		$err->status = 'ko';
		$err->message = 'unexpected syntax '.$command;
		echo json_encode($err);
		break;
}
