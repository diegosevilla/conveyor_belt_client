var socket = require('socket.io-client')('https://conveyor-belt-controller.herokuapp.com');
var fs = require('fs');

var controller = {};
var taken;


controller.state = 'stop';
controller.speed = '';
controller.direction = 'forward';
controller.distance = 0;

socket.on('connect', function(){
	console.log('connected');
	socket.emit('controller');
	taken = false;
});

socket.on('index', function(index){
	console.log('i am controller #' + index);
});

socket.on('logs', function(fn){
	fs.readFile('logs.txt', 'utf8', function(err, data){
		var res = {};
		if(err){
			res.status = 400;
			res.body = err;
		} else {
			res.status = 200;
			res.body = data.split('\n');
		}
		fn(res);
	})
});

socket.on('select', function(data, fn){
	var result;
		
	if(taken)
		result = {status:400, message:'controller already taken'};
	else{
		result = {status:200, message:'successfully selected this controller'}; 
		taken = true;
	}
	console.log(result);
	fn(result);
	writeToFile(data.username, 'Select', formatDate(new Date()), result.status, result.message);
});

socket.on('deselect', function(data, fn){
	var result;

	if(!taken)
		result = {status:400, message:data.username + ' is not connected to this controller'};
	else{
		result = {status:200, message:'successfully deselected this controller'}; 
		taken = false;
	}
	console.log(result);
	fn(result);
	writeToFile(data.username, 'Deselect', formatDate(new Date()), result.status, result.message);
});

socket.on('status', function(fn){
	fn(controller);			
});

socket.on('stop', function(data, fn){
	if(controller.state == 'stop'){
		controller.status = 400;
		controller.message = 'Controller already stopped';
	} else{ 
		controller.status = 200;
		controller.message = 'Stop operation successfully executed';
		controller.state = 'stop';
	}
	fn(controller);
	writeToFile(data.username, 'stopped the controller', formatDate(new Date()), controller.status, controller.message);
});

socket.on('forward', function(data, fn){
	if(controller.direction == 'forward'){
		controller.status = 400;
		controller.message = 'Controller is already in forward direction';
	} else if(controller.state != 'stop'){
		controller.status = 400;
		controller.message = 'Controller is running. Please stop first';
	} else {
		controller.status = 200;
		controller.message = 'Forward operation successfully executed';
		controller.direction = 'forward';
	}
	console.log(controller);
	fn(controller);
	writeToFile(data.username, 'set direction to Forward', formatDate(new Date()), controller.status, controller.message);
});

socket.on('reverse', function(data, fn){ 
	if(controller.direction == 'reverse'){
		controller.status = 400;
		controller.message = 'Controller is already in reverse direction';
	} else if(controller.state != 'stop'){
		controller.status = 400;
		controller.message = 'Controller is running. Please stop first';
	} else{
		controller.status = 200;
		controller.message = 'Reverse operation successfully executed';
		controller.direction = 'reverse';
	}
	console.log(controller);
	fn(controller);
	writeToFile(data.username, 'set direction to Reverse', formatDate(new Date()), controller.status, controller.message);
});

socket.on('low', function(data, fn){
	if(controller.state == 'stop'){
		controller.speed = 'low';
		controller.status = 200;
		controller.message = 'speed set to low';
		controller.state = 'running';
	} else {
		controller.status = 400;
		controller.message = 'Controller is running. Please stop first';
	}
	console.log(controller);
	fn(controller);
	writeToFile(data.username, 'set Speed to Low', formatDate(new Date()), controller.status, controller.message);
});

socket.on('med', function(data, fn){
	if(controller.state == 'stop'){
		controller.speed = 'med';
		controller.status = 200;
		controller.message = 'speed set to medium';
		controller.state = 'running';
	} else {
		controller.status = 400;
		controller.message = 'Controller is running. Please stop first';
	}
	console.log(controller);
	fn(controller);
	writeToFile(data.username, 'set Speed to Medium', formatDate(new Date()), controller.status, controller.message);
});

socket.on('high', function(data, fn){
	if(controller.state == 'stop'){
		controller.speed = 'high';
		controller.status = 200;
		controller.message = 'speed set to high';
		controller.state = 'running';
	} else {
		controller.status = 400;
		controller.message = 'Controller is running. Please stop first';
	}
	console.log(controller);
	fn(controller);
	writeToFile(data.username, 'set Speed to High', formatDate(new Date()), controller.status, controller.message);
});

socket.on('move_pt_five', function(data, fn){
	setDistance(0.5)
	console.log(controller);
	fn(controller);
	writeToFile(data.username, 'moved Conveyor 0.5m ' + controller.direction, formatDate(new Date()), controller.status, controller.message);
});

socket.on('move_one', function(data, fn){
	setDistance(1)
	console.log(controller);
	fn(controller);
	writeToFile(data.username, 'moved Conveyor 1.0m ' + controller.direction, formatDate(new Date()), controller.status, controller.message);
});

socket.on('move_one_pt_five', function(data, fn){
	setDistance(1.5)
	console.log(controller);
	fn(controller);
	writeToFile(data.username, 'moved Conveyor 1.5m ' + controller.direction, formatDate(new Date()), controller.status, controller.message);
});

socket.on('move_two', function(data, fn){
	setDistance(2)
	console.log(controller);
	fn(controller);
	writeToFile(data.username, 'moved Conveyor 2.0m ' + controller.direction, formatDate(new Date()), controller.status, controller.message);
});

socket.on('move_two_pt_five', function(data, fn){
	setDistance(2.5)
	console.log(controller);
	fn(controller);
	writeToFile(data.username, 'moved Conveyor 2.5m ' + controller.direction, formatDate(new Date()), controller.status, controller.message);
});

socket.on('move_three', function(data, fn){
	setDistance(3)
	console.log(controller);
	fn(controller);
	writeToFile(data.username, 'moved Conveyor 3.0m ' + controller.direction, formatDate(new Date()), controller.status, controller.message);
});

function setDistance(n){
	if(controller.direction == 'forward' && controller.distance + n > 3){
		controller.status = 400;
		controller.message = 'Error! Will exceed the maximum distance of 3';
	} else if(controller.direction == 'reverse' && controller.distance - n < 0){
		controller.status = 400;
		controller.message = 'Error! Will exceed the minimum distance of 0';
	} else{
		if(controller.direction == 'forward')
			controller.distance += n;
		else
			controller.distance -= n;
		controller.status = 200
		controller.message = 'Conveyor now at ' + controller.distance.toFixed(1)+ 'm';
	}
	return;
}

function writeToFile(user, operation, time, status, message){
	var str = '[' + time + '] - ' + user + ' ' + operation + ';RESULT: [' + status + '] : ' + message + '\n';
	console.log(str);
	fs.appendFile('logs.txt', str, function (err) {
	  if (err) throw err;
	});
}

function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}
