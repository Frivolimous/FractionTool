function ObjectManager(_stage){
	this.stage=_stage;
	this.objects=[];

	this.addObject=function(_object){
		this.stage.addChildAt(_object,0);
		this.objects.push(_object);
	}

	this.removeObject=function(_object){

		for (var i=0;i<this.objects.length;i+=1){
			if (this.objects[i]==_object){
				return this.removeObjectAt(i);
			}
		}
	}

	this.removeObjectAt=function(i){
		let _object=this.objects[i];
		if (_object.parent!=null) _object.parent.removeChild(_object);
		this.objects.splice(i,1);
		return _object;
	}

	this.getClosestObject=function(point,maxDist,filter){
		//options:
		//  filter - an object to exclude from the list
		var m=null;
		var _distance=maxDist*maxDist;
		var _distance2=0;
		
		for (var i=0;i<this.objects.length;i+=1){
			if (filter!=null && filter==this.objects[i]) continue;
			if (!this.objects[i].interactive) continue;
			_distance2=this.objects[i].getDistance(point.x,point.y);
			if (_distance2<_distance){
				_distance=_distance2;
				m=this.objects[i];
			}
		}
		return m;
	}

	this.removeAll=function(){
		while (this.objects.length>0){
			this.removeObjectAt(0);
		}
	}

	this.forEach=function(_function){
		for (var i=0;i<this.objects.length;i+=1){
			_function.call(this.objects[i]);
		}
	}
}