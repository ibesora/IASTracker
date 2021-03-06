<?php

class IASValidator extends Eloquent {

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'Validators';
	protected $primaryKey = 'userId';
	protected $fillable = array('userId', 'organization', 'createdId', 'created_at', 
		'updated_at');

	/**
	 * The attributes excluded from the model's JSON form.
	 *
	 * @var array
	 */
	protected $hidden = array();

	public function scopeUserId($query, $id)
	{

		return $query->orderBy('userId', $id);

	}

}

?>