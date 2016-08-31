var YAML  = require("yamljs");
var redis = require("redis").createClient();

var keyCount  = 0;

var keyMap = {};

redis.keys("*", function(err, keys){
	
	keyCount = keys.length;

	keys.forEach(function(key){
		redis.type(key, function(err, type){
			print(key, type);
		})
	});
});

function print(key, type){
	if(type === "string"){
		
		redis.get(key, function(err, value){
			put(keyMap, key, value);
		});

	} else if(type === "hash"){

		redis.hkeys(key, function(err, hkeys) {

			keyCount += hkeys.length;

			var hash = {}
			
			put(keyMap, key, hash);

			hkeys.forEach(function(keyInHash) {
				redis.hget([key, keyInHash], function(err, value) {					
					put(hash, keyInHash, value);
				});				
			});			
		});
	} else if(type === "list"){
		redis.lrange([key, 0, -1], function(err, items){
			put(keyMap, key, items);
		})
	}
}

function put(obj, key, value){
	obj[key] = value;
	
	keyCount--;

	if(keyCount === 0){
		console.log(YAML.stringify(keyMap));
	}
}