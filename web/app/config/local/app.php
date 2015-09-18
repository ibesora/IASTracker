<?php

return array(

	/*
	|--------------------------------------------------------------------------
	| Application Debug Mode
	|--------------------------------------------------------------------------
	|
	| When your application is in debug mode, detailed error messages with
	| stack traces will be shown on every error that occurs within your
	| application. If disabled, a simple generic error page is shown.
	|
	*/

	'debug' => true,
	'url' => 'http://127.0.0.1/IASTracker/',
	'urlImg' => 'http://127.0.0.1/IASTracker/img/',
	'urlImgThumbs' => 'http://127.0.0.1/IASTracker/img/thumbs',
	'urlUserImgThumbs' => 'http://127.0.0.1/IASTracker/img/thumbs/users/',
	'providers' => append_config(array(
		'Way\Generators\GeneratorsServiceProvider',
	))
);
