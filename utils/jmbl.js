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


	primes:[1,2,3,5,7,11,13,17,23,29,31,37,41,43,47,53,59,61,67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199],
	getDivisors:function(n){
		if (n==0) return [];
		let _neg=1;
		if (n<0){
			n=Math.abs(n);
			_neg=-1;
		}
		if (n==0) return [0];
		let m=[];
		for (var i=0;i<=n;i+=1){
			/*let div=n/i;
			if (Math.floor(div)==div){
				m.push(div);
			}*/
			if (n%i == 0){
				m.push(i*_neg);
			}
		}
		return m;
	},
	getPrimeDivisors:function(n){
		let m=[];

		for (var i=0;i<JMBL.primes.length;i+=1){
			//if (JMBL.primes[i]>n) break;
			if (n%JMBL.primes[i]==0){
				m.push(JMBL.primes[i]);
			}
		}
		if (n<0) m.unshift(-1);
		return m;
	}

		/*public static function getFactors(n:int):Array{
			if (n==0) return [[0,0]];
			var _limit:Number=Math.sqrt(n);
			var a:Array=new Array;
			for (var i:int=0;i<primes.length;i+=1){
				if (primes[i] > Math.sqrt(n) && primes[i]!=1) break;
				
				if (n%primes[i]==0){
					a.push([primes[i],n/primes[i]]);
				}
			}
			
			return a;
		}*/
}