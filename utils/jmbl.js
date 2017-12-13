const JMBL={
	shallowClone:function(obj){
		let m={};
		for (var v in obj) {
			m[v]=obj[v];
		}

		return m;
	},
	deepClone:function(obj){
		if (Array.isArray(obj)){
			let m=[]; 	
			for (var i=0;i<obj.length;i+=1){
				m.push(this.deepClone(obj[i]));
			}
			return m;
		}else if (obj === Object(obj)){
			let m={};
			for (var v in obj){
				m[v]=this.deepClone(obj[v]);
			}
			return m;
		}
		return obj;
	},
	removeFromArray:function(_element,_array){
		for (var i=0;i<_array.length;i+=1){
			if (_array[i]===_element){
				_array.splice(i,1);
				return true;
			}
		}

		return false;
	},
	tweenWait:function(_obj,maxTicks,_func){
		let ticks=0;
		function _tickThis(){
			ticks+=1;
			if (ticks>maxTicks){
				app.ticker.remove(_tickThis);
				if (_func!=null) _func.call(_obj);
			}
		}
		app.ticker.add(_tickThis);
	},
	tweenColor:function(_obj,maxTicks,par,_func){
		if (par==null) return;
		let properties={};
		let ticks=0;

		for (var v in par){
			if (v=="delay"){
				ticks=-par[v];
			}else{
				properties[v]={start:_obj[v],end:par[v],
					incR:Math.floor(par[v]/0x010000)-Math.floor(_obj[v]/0x010000),
					incG:Math.floor((par[v]%0x010000)/0x000100)-Math.floor((_obj[v]%0x010000)/0x000100),
					incB:Math.floor(par[v]%0x000100)-Math.floor(_obj[v]%0x000100),
				};
			}
		}

		
		function _tickThis(){
			ticks+=1;
			if (ticks>maxTicks){
				app.ticker.remove(_tickThis);
				if (_func!=null) _func.call(_obj);
			}else if (ticks>=0){
				for (var v in properties){
					_obj[v]=properties[v].start+Math.floor(properties[v].incR/maxTicks*ticks)*0x010000+Math.floor(properties[v].incG/maxTicks*ticks)*0x000100+Math.floor(properties[v].incB/maxTicks*ticks);
				}
			}
		}

		app.ticker.add(_tickThis);
	},
	tweenTo:function(_obj,maxTicks,par,_func){
		if (par==null) return;
		let properties={};
		let ticks=0;

		for (var v in par){
			if (v=="delay"){
				ticks=-par[v];
			}else{
				properties[v]={start:_obj[v],end:par[v]};
			}
		}
		function _tickThis(){
			ticks+=1;
			if (ticks>maxTicks){
				app.ticker.remove(_tickThis);
				if (_func!=null) _func.call(_obj);
			}else if (ticks>=0){
				for (var v in properties){
					_obj[v]=properties[v].start+(properties[v].end-properties[v].start)/maxTicks*ticks;
				}
			}
		}

		app.ticker.add(_tickThis);
	},
	tweenFrom:function(_obj,maxTicks,par,_func){
		let newPar={};
		for (var v in par){
			if (v=="delay"){
				newPar[v]=par[v];
			}else{
				newPar[v]=_obj[v];
				_obj[v]=par[v];
			}
		}

		JMBL.tweenTo(_obj,maxTicks,newPar,_func);
	},
}