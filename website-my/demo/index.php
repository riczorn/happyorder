<?php
/**
* HappyOrder
* 
* mock the windows backend for demo purposes
* support@happyorder.it
*/

$command = $_SERVER['REQUEST_URI'];
$command = trim(str_replace('/my/demo/','',$command));
$action = @$_GET['action'];
error_log("COMMAND IS $command ; ACTION= $action");
if (empty($action)) {
		$request  = preg_replace("/^.*ekoroute\//", "", $command);
		$_GET['action']=$request;
		 error_log("ho route/1 $request");  
} else { 
		 error_log("ho route/2 $action");  
}

echo "Full URL IS $command ; ACTION= $action";



switch ($command) {
	case '': 
	case '/': 
			echo file_get_contents(__DIR__.'/gamba/index.html');
		break;
case 'interface/settings.xml': echo file_get_contents(__DIR__.'/gamba/settings.xml');
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
