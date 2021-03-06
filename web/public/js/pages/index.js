var iasList = null;
var mapHandler = null;
var iasMapHandler = null;
var userMapHandler = null;
var loadingImage = null;
var userMarkers = null;
var userObservationsMarkers = null;
var userValidatedMarkers = null;
var otherUsersObservationsMarkers = null;
var otherUsersValidatedMarkers = null;
var shapeLayers = null;
var activeTimeOut = null;

$(document).ready(function () {

	$("#observedCheckBox").attr("disabled", true);
	$("#validatedCheckBox").attr("disabled", true);
	$("#userObsCheckBox").attr("disabled", true);

	$('#input-state').change(onStateChanged);

	mapHandler = new MapHandler("map", mapDescriptors, crsDescriptors, "layersControl", "controls", "observationsControls");
	$('.datetimepicker').datetimepicker({
		locale: 'ca',
		format: 'DD/MM/YYYY'
	});

	$("#navbar-loguejat").on("mouseover", function () {
        $('#panell-usuari').removeClass('hidden');
    });

    $("#navbar-loguejat").on("mouseleave", function () {
        $('#panell-usuari').addClass('hidden');
    });

	api.getIASMapFilter(getIASMapFilterOK, "#iasContents");
	loadingImage = $('#contentModalContents').html();
	configureShapes();

});

function getIASMapFilterOK(data)
{

	iasList = data;
	
	configureSwitch(".IASCheck");
	api.getObservations(addObservationMarkers);
	$('#taxonomyFilterSelect').change(onTaxonFilterChanged);

	$('#searchIAS').keyup(function() {

		if(null != activeTimeOut)
		clearTimeout(activeTimeOut);

		activeTimeOut = setTimeout(function() {searchIAS()}, 100);

	});

}

function onTaxonFilterChanged()
{

	searchIAS();

}

function searchIAS()
{

	var searchStr = $('#searchIAS').val();
	var val = $('#taxonomyFilterSelect').val();
	var taxonomies = taxonChilds[val];

	for(var i=0; i<iasList.length; ++i)
	{

		var current = iasList[i];
		var name = '';
		if($('#btnCommonName').hasClass('active'))
			name = current.description.name;
		else
			name = current.latinName;

		if((name.toLowerCase().indexOf(searchStr.toLowerCase()) > -1)
			&& ((current.taxonId == val) || (-1 == val) || (-1 != $.inArray(current.taxonId, taxonomies))))
			$('#IASRow'+ current.id).show();
		else
			$('#IASRow'+ current.id).hide();

	}

}

function showCommonName()
{

	$('#btnCommonName').addClass('active').siblings().removeClass('active');
	for(var i=0; i<iasList.length; ++i)
	{

		var current = iasList[i];
		$('#IASName'+ current.id).html(current.description.name);

	}

	searchIAS();

}

function showScientificName()
{

	$('#btnScientificName').addClass('active').siblings().removeClass('active');
	for(var i=0; i<iasList.length; ++i)
	{

		var current = iasList[i];
		$('#IASName'+ current.id).html(current.latinName);

	}

	searchIAS();

}

function onStateChanged()
{

	$('#regionAndAreaSelect').hide();
	$('#filterSelectLoader').show();
	var id = $('#input-state').val();
	api.getStateRegions(id, stateRegionsOk, '#regionAndAreaSelect');

}

function stateRegionsOk(data)
{

	$('#input-regions').change(onRegionChanged);
	$('#filterSelectLoader').hide();
	$('#regionAndAreaSelect').show();

}

function onRegionChanged()
{

	$('#areaSelect').hide();
	$('#filterSelectLoader').show();
	var id = $('#input-regions').val();
	api.getRegionAreas(id, areaRegionsOk, '#areaSelect');

}

function areaRegionsOk(data)
{

	$('#filterSelectLoader').hide();
	$('#areaSelect').show();

}

function configureSwitch(classId)
{

	$(classId).bootstrapSwitch({size: 'mini'});
	$(classId).each(function(index) {

		var functionString = $(this).attr('onclick');
		if("" != functionString)
		{

			var func = window[functionString];
			if("function" === typeof func)
			{

				var arg = $(this).attr('data');
				if(undefined !== typeof arg)
					$(this).on('switchChange.bootstrapSwitch', function() { func.apply(null, [arg]); });
				else
					$(this).on('switchChange.bootstrapSwitch', func);

			}

		}

	});

}

function addObservationMarkers(data)
{

	var numObservacions = data.length;
	userObservationsMarkers = new Array();
	userValidatedMarkers = new Array();
	otherUsersObservationsMarkers = new Array();
	otherUsersValidatedMarkers = new Array();

	for(var i=0; i<numObservacions; ++i)
	{

		var current = data[i];
		var marker;
		if(1 == current.statusId)
		{

			var greenIcon = constructValidatedIcon();
			marker = mapHandler.createMarker(current.latitude, current.longitude, 
				current.accuracy, 'red', '#f03', 0.5, {id : current.id, IASId: current.IASId}, onMarkerClick, greenIcon);

			if(current.userId != loggedUserId)
				otherUsersValidatedMarkers.push(marker);
			else
				userValidatedMarkers.push(marker);

		}
		else
		{

			marker = mapHandler.createMarker(current.latitude, current.longitude, 
				current.accuracy, 'red', '#f03', 0.5, {id : current.id, IASId: current.IASId}, onMarkerClick);

			if(current.userId != loggedUserId)
				otherUsersObservationsMarkers.push(marker);
			else
				userObservationsMarkers.push(marker);

		}

	}

	showObservations();
	showValidatedObservations();

	$("#observedCheckBox").bootstrapSwitch('disabled', false);
	$("#validatedCheckBox").bootstrapSwitch('disabled', false);
	$("#userObsCheckBox").bootstrapSwitch('disabled', false);

	$('#overlay').hide();

}

function onMarkerClick(e)
{

	$('#contentModalContents').html(loadingImage);
	$('#contentModalTitle').html('')
	$('#contentModal').modal();
	api.getIASObservation(this.options.id, observationLoaded, '#contentModalContents');

}

function showUser(id)
{

	$('#contentModalContents').html(loadingImage);
	$('#contentModalTitle').html('')
	$('#contentModal').modal();
	api.getUser(id, userLoaded, '#contentModalContents');

}

function showIAS(id)
{

	$('#contentModalContents').html(loadingImage);
	$('#contentModalTitle').html('')
	$('#contentModal').modal();
	api.getIAS(id, iasLoaded, '#contentModalContents');

}

function observationLoaded(data)
{

}

function userLoaded(data)
{

	userMapHandler = new MapHandler("UserObsMap", mapDescriptors, crsDescriptors);
	api.getUserObservations(data.id, addUserMarkers);
	configureSwitch(".IASUserCheck");

}

function iasLoaded(data)
{

	iasMapHandler = new MapHandler("IASObsMap", mapDescriptors, crsDescriptors);
	api.getIASObservations(data, addIASMarkers);

}

function addIASMarkers(data)
{

	var numObservacions = data.length;
	for(var i=0; i<numObservacions; ++i)
	{

		var current = data[i];
		var marker;
		if(1 == current.statusId)
		{

			var greenIcon = constructValidatedIcon();
			marker = iasMapHandler.createMarker(current.latitude, current.longitude, 
				current.accuracy, 'red', '#f03', 0.5, {id : current.id}, null, greenIcon);

		}
		else
		{

			marker = iasMapHandler.createMarker(current.latitude, current.longitude, 
				current.accuracy, 'red', '#f03', 0.5, {id : current.id}, null);

		}

		iasMapHandler.addMarker(marker);

	}

}

function addUserMarkers(data)
{

	userMarkers = new Array();
	var numObservacions = data.length;
	for(var i=0; i<numObservacions; ++i)
	{

		var current = data[i];
		var marker;
		if(1 == current.statusId)
		{

			var greenIcon = constructValidatedIcon();
			marker = userMapHandler.createMarker(current.latitude, current.longitude, 
				current.accuracy, 'red', '#f03', 0.5, {id : current.id, IASId: current.IASId}, onMarkerClick, greenIcon);

		}
		else
		{

			marker = userMapHandler.createMarker(current.latitude, current.longitude, 
				current.accuracy, 'red', '#f03', 0.5, {id : current.id, IASId: current.IASId}, onMarkerClick);

		}

		userMarkers.push(marker);
		userMapHandler.addMarker(marker);

	}

}

function constructValidatedIcon()
{

	return L.icon({
	    iconUrl: 'js/images/greenMarker-icon.png',
	    shadowUrl: 'js/images/marker-shadow.png',

	    iconSize:     [25, 41], // size of the icon
	    shadowSize:   [41, 41], // size of the shadow
	    iconAnchor:   [13, 41], // point of the icon which will correspond to marker's location
	    shadowAnchor: [12, 40]  // the same for the shadow
	});

}

function showObservations()
{

	var onlyUserObs = (-1 != loggedUserId) && $('#userObsCheckBox').is(':checked');
	showObservationsAux(onlyUserObs);

}

function showValidatedObservations()
{

	var onlyUserObs = (-1 != loggedUserId) && $('#userObsCheckBox').is(':checked');
	showValidatedAux(onlyUserObs);

}

function showOnlyUserObservations()
{

	var onlyUserObs = (-1 != loggedUserId) && $('#userObsCheckBox').is(':checked');
	showObservationsAux(onlyUserObs);
	showValidatedAux(onlyUserObs);

}

function showObservationsAux( onlyUserObs )
{

	if($('#observedCheckBox').is(':checked'))
	{

		for(var i=0; i<userObservationsMarkers.length; ++i)
		{

			var current = userObservationsMarkers[i];
			if($('#IASCheck' + current.marker.options.IASId).is(':checked'))
				mapHandler.addMarker(current);

		}

		if(!onlyUserObs)
		{

			for(var i=0; i<otherUsersObservationsMarkers.length; ++i)
			{

				var current = otherUsersObservationsMarkers[i];
				if($('#IASCheck' + current.marker.options.IASId).is(':checked'))
					mapHandler.addMarker(otherUsersObservationsMarkers[i]);

			}

		}

	}
	else
	{

		for(var i=0; i<userObservationsMarkers.length; ++i)
		{

			var current = userObservationsMarkers[i];
			if($('#IASCheck' + current.marker.options.IASId).is(':checked'))
				mapHandler.removeMarker(userObservationsMarkers[i]);

		}

		if(!onlyUserObs)
		{

			for(var i=0; i<otherUsersObservationsMarkers.length; ++i)
			{

				var current = otherUsersObservationsMarkers[i];
				if($('#IASCheck' + current.marker.options.IASId).is(':checked'))
					mapHandler.removeMarker(otherUsersObservationsMarkers[i]);

			}

		}

	}

}

function showValidatedAux( onlyUserObs )
{

	if($('#validatedCheckBox').is(':checked'))
	{

		for(var i=0; i<userValidatedMarkers.length; ++i)
		{

			var current = userValidatedMarkers[i];
			if($('#IASCheck' + current.marker.options.IASId).is(':checked'))
				mapHandler.addMarker(userValidatedMarkers[i]);

		}

		if(!onlyUserObs)
		{

			for(var i=0; i<otherUsersValidatedMarkers.length; ++i)
			{

				var current = otherUsersValidatedMarkers[i];
				if($('#IASCheck' + current.marker.options.IASId).is(':checked'))
					mapHandler.addMarker(otherUsersValidatedMarkers[i]);

			}

		}

	}
	else
	{

		for(var i=0; i<userValidatedMarkers.length; ++i)
		{

			var current = userValidatedMarkers[i];
			if($('#IASCheck' + current.marker.options.IASId).is(':checked'))
				mapHandler.removeMarker(userValidatedMarkers[i]);

		}

		if(!onlyUserObs)
		{

			for(var i=0; i<otherUsersValidatedMarkers.length; ++i)
			{

				var current = otherUsersValidatedMarkers[i];
				if($('#IASCheck' + current.marker.options.IASId).is(':checked'))
					mapHandler.removeMarker(otherUsersValidatedMarkers[i]);

			}

		}

	}

}

function filterObs()
{

	clearObservations();
	$('#overlay').show();

	var taxonomyId = $('#input-group').val();
	var fromDate = $('#fromDate').val();
	var toDate = $('#toDate').val();
	var stateId = $('#input-state').val();
	var regionId = $('#input-regions').val();
	var areaId = $('#input-areas').val();

	api.getFilteredObservations( 
		{
			taxonomyId : taxonomyId,
			fromDate : fromDate,
			toDate : toDate,
			stateId : stateId,
			regionId : regionId,
			areaId : areaId
		}
		,addObservationMarkers
	);

}

function clearObservations()
{

	for(var i=0; i<userObservationsMarkers.length; ++i)
	{

		mapHandler.removeMarker(userObservationsMarkers[i]);

	}

	for(var i=0; i<otherUsersObservationsMarkers.length; ++i)
	{

		mapHandler.removeMarker(otherUsersObservationsMarkers[i]);

	}

	for(var i=0; i<userValidatedMarkers.length; ++i)
	{

		mapHandler.removeMarker(userValidatedMarkers[i]);

	}

	for(var i=0; i<otherUsersValidatedMarkers.length; ++i)
	{

		mapHandler.removeMarker(otherUsersValidatedMarkers[i]);

	}

}

function activeUserIAS(id)
{

	if($('#IASUserCheck'+id).is(':checked'))
	{

		for(var i=0; i<userMarkers.length; ++i)
		{

			var current = userMarkers[i];
			if(current.marker.options.IASId == id)
				userMapHandler.addMarker(current);

		}

	}
	else
	{

		for(var i=0; i<userMarkers.length; ++i)
		{

			var current = userMarkers[i];
			if(current.marker.options.IASId == id)
				userMapHandler.removeMarker(current);

		}

	}

}

function activeIAS(id)
{

	if($('#IASCheck'+id).is(':checked'))
	{

		if(!$('#userObsCheckBox').is(':checked'))
		{

			if($('#validatedCheckBox').is(':checked'))
			{

				for(var i=0; i<otherUsersValidatedMarkers.length; ++i)
				{

					var current = otherUsersValidatedMarkers[i];
					if(current.marker.options.IASId == id)
						mapHandler.addMarker(current);

				}

			}

			if($('#observedCheckBox').is(':checked'))
			{

				for(var i=0; i<otherUsersObservationsMarkers.length; ++i)
				{

					var current = otherUsersObservationsMarkers[i];
					if(current.marker.options.IASId == id)
						mapHandler.addMarker(current);

				}

			}

		}

		if($('#validatedCheckBox').is(':checked'))
		{

			for(var i=0; i<userValidatedMarkers.length; ++i)
			{

				var current = userValidatedMarkers[i];
				if(current.marker.options.IASId == id)
					mapHandler.addMarker(current);

			}

		}

		if($('#observedCheckBox').is(':checked'))
		{

			for(var i=0; i<userObservationsMarkers.length; ++i)
			{

				var current = userObservationsMarkers[i];
				if(current.marker.options.IASId == id)
					mapHandler.addMarker(current);

			}

		}

	}
	else
	{

		if(!$('#userObsCheckBox').is(':checked'))
		{

			if($('#validatedCheckBox').is(':checked'))
			{

				for(var i=0; i<otherUsersValidatedMarkers.length; ++i)
				{

					var current = otherUsersValidatedMarkers[i];
					if(current.marker.options.IASId == id)
						mapHandler.removeMarker(current);

				}

			}

			if($('#observedCheckBox').is(':checked'))
			{

				for(var i=0; i<otherUsersObservationsMarkers.length; ++i)
				{

					var current = otherUsersObservationsMarkers[i];
					if(current.marker.options.IASId == id)
						mapHandler.removeMarker(current);

				}

			}

		}

		if($('#validatedCheckBox').is(':checked'))
		{

			for(var i=0; i<userValidatedMarkers.length; ++i)
			{

				var current = userValidatedMarkers[i];
				if(current.marker.options.IASId == id)
					mapHandler.removeMarker(current);

			}

		}

		if($('#observedCheckBox').is(':checked'))
		{

			for(var i=0; i<userObservationsMarkers.length; ++i)
			{

				var current = userObservationsMarkers[i];
				if(current.marker.options.IASId == id)
					mapHandler.removeMarker(current);

			}

		}

	}

}

function configureShapes()
{

	shapeLayers = new Array();
	for(var i=0; i<shapes.length; ++i)
	{

		var current = shapes[i];
		var layer = new L.Shapefile(current, {
			style : function(feature) {
				return {
					"color": randomColor(),
					"weight": 4,
					"opacity": 1
					};
			},
			onEachFeature: function(feature, layer) {
				layer.bindPopup("" + shapeNames[feature.properties.ID]);
			}
		});
		shapeLayers.push(layer);

	}

}

function randomColor() {
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    var r, g, b;
    var h = Math.random();
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}

function showAreas()
{

	if($('#areasCheckBox').is(':checked'))
	{

		for(var i=0; i<shapeLayers.length; ++i)
		{

			mapHandler.addLayer(shapeLayers[i]);

		}

	}
	else
	{

		for(var i=0; i<shapeLayers.length; ++i)
		{

			mapHandler.removeLayer(shapeLayers[i]);

		}

	}	

}

function updateUserData()
{

	$('#dataModalText').html('');
	$('#input-name').val(fullName);
	$('#amIExpertCheckbox').bootstrapSwitch('state', isExpert);
	var img = $('#imgPerfilBarra').attr('src');
	$('#imgPerfilCompletar').data('url', img);
	$('#imgPerfilCompletar').css({'background-image': 'url(' + img + ')'});
	$('#completar-dades-modal').modal();
	$('#pas3').addClass('hidden');
	antPas3();

}

function showLogInModal()
{

	$('#loginModal').modal();

}

function showLogIn()
{

	$('#loginModal').modal();
	$('#signupModal').modal('hide');

}

function showSignUpModal()
{

	$('#signupDesc').show();
	$('#signupPanel').show();
	$('#signupDone').hide();
	$('#input-signupEmail').val('');
	$('#form-signupEmail').removeClass('has-error');
	$('#error-usedEmail').addClass('hidden');
	$('#error-invalidEmail').addClass('hidden');
	$('#signupModal').modal();

}

function showSignUp()
{

	$('#loginModal').modal('hide');
	$('#signupModal').modal();

}

function loginUsuari()
{

	$('#loginForm').submit();

}

function userSignUp()
{

	var val = $('#input-signupEmail').val();

	$('#form-signupEmail').removeClass('has-error');
	$('#error-usedEmail').addClass('hidden');
	$('#error-invalidEmail').addClass('hidden');

	if(isValidEmail(val))
	{

		$('#error-invalidEmail').addClass('hidden');
		$('#signupPanel').hide();
		$('#signupLoading').show();
		api.addUser(val, userRegistered);

	}
	else
	{

		$('#signupPanel').show();
		$('#signupLoading').hide();
		$('#error-usedEmail').addClass('hidden');
		$('#form-signupEmail').addClass('has-error');
		$('#error-invalidEmail').removeClass('hidden');

	}

}

function userRegistered(data)
{

	$('#signupLoading').hide();
	if(data.hasOwnProperty('error'))
	{

		$('#signupPanel').show();
		$('#form-signupEmail').addClass('has-error');
		$('#error-usedEmail').removeClass('hidden');

	}
	else
	{
	
		$('#signupDesc').hide();
		$('#signupDone').show();

	}

}

function showRememberPw()
{

	$('#signupModal').modal('hide');
	$('#loginModal').modal('hide');

	$('#remindPasswordDesc').show();
	$('#remindPasswordPanel').show();
	$('#remindPasswordDone').hide();
	$('#input-reminderEmail').val('');
	$('#form-reminderEmail').removeClass('has-error');
	$('#error-notUsedEmail').addClass('hidden');
	$('#error-invalidEmail').addClass('hidden');

	$('#remindModal').modal();

}

function remindPassword()
{

	var val = $('#input-reminderEmail').val();

	$('#form-reminderEmail').removeClass('has-error');
	$('#error-notUsedEmail').addClass('hidden');
	$('#error-invalidEmail').addClass('hidden');

	if(isValidEmail(val))
	{

		$('#error-invalidEmail').addClass('hidden');
		$('#remindPasswordPanel').hide();
		$('#remindPasswordLoading').show();
		api.remindUser(val, userReminded);

	}
	else
	{

		$('#remindPasswordPanel').show();
		$('#remindPasswordLoading').hide();
		$('#error-notUsedEmail').addClass('hidden');
		$('#form-reminderEmail').addClass('has-error');
		$('#error-invalidEmail').removeClass('hidden');

	}

}

function userReminded(data)
{

	$('#remindPasswordLoading').hide();
	if(data.hasOwnProperty('error'))
	{

		$('#remindPasswordPanel').show();
		$('#form-reminderEmail').addClass('has-error');
		$('#error-notUsedEmail').removeClass('hidden');

	}
	else
	{
	
		$('#remindPasswordDesc').hide();
		$('#remindPasswordDone').show();

	}

}