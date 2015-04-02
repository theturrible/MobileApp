//courses trying to load
 var win = Titanium.UI.createWindow();
var table = Ti.UI.createTableView();
var tableData = [];
var httpClient = Ti.Network.createHTTPClient({
		timeout: 10000
});

httpClient.onload = function(){
//actual code
	var classes = JSON.parse(httpClient.responseText); 
	Titanium.API.log(httpClient.responseText);
	for(var i=0;i<classes.length;i++){
	        var obj = classes[i];
	       	Titanium.API.log(JSON.stringify(obj));
	       	
	  	var row = Titanium.UI.createTableViewRow({
            hasChild: true,
            className: 'recipe-row',
            backgroundColor: '#fff',  //this is the data we want to search on (title)
            title: obj.section + " " + obj.num + " " + obj.name
        });
 

        //add the table row to our tableData[] object
        tableData.push(row);
	}
	
	table.setData(tableData);
	win.add(table);
};

httpClient.onerror = function(){
	alert("Unfortunately, we have encountered an error getting out server to play nice.");
	$.index.open();
};




httpClient.open('GET', 'http://localhost:8080/api/courses');
httpClient.setRequestHeader('Content-Type', 'application/json');
httpClient.send();


win.open();

