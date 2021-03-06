<div class="row">
	<dic class="col-md-12">
		<div id="barra-buscador">
			<input type="text" class="form-control" placeholder="{{Lang::get('ui.search')}}" id="searchIAS">	
		</div>
	</div>
</div>
<div class="row">
	<div class="form-group col-md-12">
		<span><b>{{Lang::get('ui.taxonomy')}}</b> <br /></span>
		<label for="input-grup">{{Lang::get('ui.group')}}</label>
		{{Form::select('taxonomy', $taxonomies, null, array('id' => 'taxonomyFilterSelect'))}}
	</div>
</div>
<div class="row" style="text-align: center;">
	<div class="col-md-12">
		<div class="btn-group" role="group" aria-label="...">
			<button id="btnCommonName" type="button" class="btn btn-default" onclick="showCommonName()">{{Lang::get('ui.commonName')}}</button>
			<button id="btnScientificName" type="button" class="btn btn-default active" onclick="showScientificName()">{{Lang::get('ui.scientificName')}}</button>
		</div>
	</div>
</div>
<br />
<?php
	for($i=0; $i<count($data); ++$i)
	{

		$current = $data[$i];
?>
<div class="row iasRow" id="IASRow{{$current->id}}" >
	<div class="col-md-2" onclick="showIAS({{$current->id}})" style="cursor:pointer;">
<?php
		if(property_exists($current->image,'url'))
		{
?>
			{{ HTML::image(Config::get('app.urlImg').$current->image->url, $current->image->text, array('style' => 'width: 20px;')); }}
<?php
		}
?>
	</div>
	<div id="IASName{{$current->id}}"class="col-md-6" onclick="showIAS({{$current->id}})" style="cursor:pointer;">
		{{$current->latinName}}
	</div>
	<div class="col-md-4">
		<input type="checkbox" id="IASCheck{{$current->id}}" class="IASCheck" onclick="activeIAS" data="{{$current->id}}" checked>
	</div>
</div>
<?php

	}
?>