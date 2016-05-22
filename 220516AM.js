var hotel_users = {}
var last_hotel="";
var myCollection = {}
function create_carousel(obj){

	var carousel = $('<div id="hotelCarousel" class="carousel slide" data-ride="carousel">'
		+'<ol class="carousel-indicators">'
 	+'</ol>'
	+'<div class="carousel-inner" role="listbox">'
  	+'</div>'
  	+'<a class="left carousel-control" href="#hotelCarousel" role="button" data-slide="prev">'
    	+'<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>'
    	+'<span class="sr-only">Previous</span>'
  	+'</a>'
  	+'<a class="right carousel-control" href="#hotelCarousel" role="button" data-slide="next">'
    	+'<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>'
    	+'<span class="sr-only">Next</span>'
  	+'</a>'
	+'</div>').appendTo("#desc");

	for(var i=0;i<obj.multimedia.media.length;i++){
		if(i===0){
			$("#desc .carousel-indicators").append('<li data-target="#hotelCarousel" data-slide-to="'+i+'"class="active"></li>');
			$("#desc .carousel-inner").append('<div class="item active"> <img src="'+obj.multimedia.media[i].url+'"></div>');
		}else{
			$("#desc .carousel-indicators").append('<li data-target="#hotelCarousel" data-slide-to='+i+'></li>');
			$("#desc .carousel-inner").append('<div class="item"> <img src="'+obj.multimedia.media[i].url+'"></div>');
		}
	}
};

function show_accomodation(){
	//objeto que contiene la informacion
	var accomodation = accomodations[$(this).attr('no')];
	var lat = accomodation.geoData.latitude;
	var lon = accomodation.geoData.longitude;
	var name = accomodation.basicData.name;
	last_hotel=name;
	if(accomodation.geoData.address){
		var address = accomodation.geoData.address;
	}
	if(accomodation.basicData.body){
		var desc = accomodation.basicData.body;
	}

	if(accomodation.extradata.categorias.categoria.subcategorias.subcategoria.item[1]['#text']){
		var subcat = accomodation.extradata.categorias.categoria.subcategorias.subcategoria.item[1]['#text'];
	}
  //marcador de localizacion en el mapa con nombre
	var marker = L.marker([lat, lon]);

	marker.addTo(map).bindPopup('<p '+'no='+$(this).attr('no')+'>'+name +'</p>',closeOnClick = false).openPopup();

	marker.on('click',function(e){
		alert(this.getPopup().getContent());
		show_accomodation();
		});

	map.setView([lat, lon], 15);
	$('#desc').html('<h2>' + name + '</h2>'+ '<p><strong>Dirección: </strong>'+address+'. <strong>Valoración: </strong>' + subcat + '</p>'+ desc);
	if(accomodation.multimedia.media[0].url){
		create_carousel(accomodation);
	}

	$("#content").html("");
		var id;
		hotel_users[name].forEach(function(id){
			makeApiCall(id,name,"none");
			});
};

function get_accomodations(){
  var url = "https://raw.githubusercontent.com/CursosWeb/Code/3c0f0ddaf433eee819428ba9617c59c74081fa11/JS-APIs/misc/alojamientos/alojamientos.json";
	$.getJSON(url, function(data) {

		//quito el boton de cargar el json
		$('#get').hide();
		accomodations = data.serviceList.service;

		//genero lista de hoteles
		for (var i = 0; i < accomodations.length; i++) {
			var p = document.createElement("p");
			p.setAttribute('no', i);
			var content = document.createTextNode(accomodations[i].basicData.title);
			p.appendChild(content);
			var users_plus = [];
			hotel_users[accomodations[i].basicData.title] =  users_plus;
			$("#finalList").append(p);
	 	}

	 	$('#finalList p').click(show_accomodation);
		//muestro la caja de hoteles
		$("#finalList").show();

	});
};
function cargar(){
  $("#formload").show();
}
function guardar(){
  $("#formsave").show();
}
function toSave(){
	var token = $("#token2").val();
	var repo = $("#repo2").val();
	var file = $("#fich2").val();
	var github = new Github({token:token,auth:"oauth"});
//	var dict_global = {myCollection};
	var dict_global = {Collecion: myCollection, users: hotel_users};
	var texto = JSON.stringify(dict_global);
//	var contenidoFichero = JSON.stringify(texto);
	var mensajeCommit = "Guardado json";
	var rep = github.getRepo("jenniRC", repo);
	rep.write('master',file, texto, mensajeCommit,function(err) {});//Cambiar master por gh-pages
  $("#formsave").hide();
}


function toLoad(){
	var token = $("#token").val();
	var repo = $("#repo").val();
	var fich = $("#fich").val();
	var github = new Github({token:token,auth:"oauth"});
	var rep = github.getRepo("jenniRC", repo);

		$("#formload").hide();
		rep.read('master', fich , function(err, data) {
			var json = JSON.parse(data);

				myCollection = json.Collecion;
				hotel_users = json.users;
				Object.keys(myCollection).forEach(function(i){
					$.each(myCollection,function(key,value){
						myCollection[key] = value;
						console.log(value);
						$("#favs").append($('<div><h3 id='+key+'>'+ key +'</h3></div>'));
					});
				});

				$("#favs h3").click(function(event){
					var coll = event.target.textContent;
					var hotel;
					myCollection[coll].forEach(function(n){
						hotel = n.basicData.name;
						var newHotel=document.createElement('p');
						newHotel.appendChild(document.createTextNode(hotel));
						document.getElementById(coll).appendChild(newHotel);
					});
				});

				$("#content").html("");/*key es*/
					var value2=[]
				Object.keys(hotel_users).forEach(function(i){
					$.each(hotel_users,function(key,value){
						hotel_users[key] = value2;
						value2=value;
							if(value2.length>0){
							console.log(key);
							console.log(value2[0]);
							makeApiCall(value2,key,"new");//key=hotel value=id
							value2="";
						}
					});
									//console.log(value);
				});


});


}

$(document).ready(function() {

	map = L.map('map').setView([40.4175, -3.708], 11);
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	maxZoom: 13
	}).addTo(map);

  //nada mas empezar no muestro la caja de hoteles ni la lista de favoritos
	$("#finalList").hide();
	$("#favs").hide();
  $(".form-group").hide();
  var titleFavs = $("<h1>Favoritos</h1>");
  titleFavs.appendTo("#favs");
  //boton cargar json
	$("#get").click(function(){
		get_accomodations();
		//boton de cargar json pulsado
		$("#get").attr('state','clicked');
	});

	$("#form_plus").submit(function(event) {

		event.preventDefault(); //con esto no se recarga la pagina
		var new_id = $("#id_plus")[0].value;
		if (new_id == ""){
			alert("Introduce id+")
			return;
		}
		$("#id_plus")[0].value = "";
		if (last_hotel == ""){
			alert("Debes tener un alojamiento selecionado para asignar id+")
			return; // si no esta selecionado se acaba

		}
		makeApiCall(new_id,last_hotel,"new");
	});
  //cojo información que se mete en el formulario y añado lista
	$("button.btn-default").click(function(){
		if($("input.form-control").val() !== ""){
			var new_col = $("input.form-control").val();
			$("input.form-control").val("");
			$("#favs").append($('<div><h3>'+ new_col +'</h3></div>'));
			var c_accomodations = []
			myCollection[new_col] = c_accomodations;
		}
    $('#favs div').last().droppable({
			drop: function( event, ui ) {
				$("<p></p>").text(ui.draggable.text()).appendTo(this);
				var no = ui.draggable[0].attributes[0].value;
				var hotel = accomodations[no].basicData.name;
				myCollection[new_col].push(accomodations[no]);
				//alert("entro en favs div con name"+ new_col + hotel);
			},
			over: function( event, ui ) {
				this.style.opacity = '0.4';
			},
			deactivate: function( event, ui ) {
				this.style.opacity = '1';
				$(this).find("p").hide();
				$(this).click(function(){
					$('#favs div').find('p').hide();
					$(this).find('p').show();
				});
			},
			out: function( event, ui ) {
				this.style.opacity = '1';
			}
		});

		if($("#favs").find('h1').length === 1){//solo lo hago la primera vez que hay una lista

			$("#finalList").find("p").draggable({appendTo: "body",helper: "clone",scroll: true});
		}

	});
  //boton que este con clase active para cargar sus elementos correspondientes
  $(".navbar-nav li").click(function(){

    if($(this).attr('id')==="hoteles"){//si gestion de hoteles

      $("#desc").hide();
      $("#map").hide();
      //si ya se han cargado los hoteles mostrar formulario para favoritos
      if($("#get").attr('state')!=="none"){
        $(".form-group").show();
      }
      /*$("#map").show();*/
      $("#formguardar").hide();
      $("#formcargar").hide();
			$(".form_plus").hide();
      if($("#get").attr('state') === "clicked"){
        $("#finalList").show();
        $("#favs").show();
      }

    }else if($(this).attr('id')==="inicio"){//si es inicio
			$("#formguardar").hide();
      $("#formcargar").hide();
      $("#favs").hide();
      $(".form-group").hide();
      $("#map").show();
      $("#desc").show();
			$(".form_plus").hide();
      if($("#get").attr('state') === "clicked"){
        $("#finalList").show();
      }

    }else if($(this).attr('id')==="collection"){

      $("#favs").hide();
      $(".form-group").hide();
      $("#formguardar").hide();
      $("#formcargar").hide();
      $("#map").hide();
      $("#desc").show();
			$(".form_plus").show();
      if($("#get").attr('state') === "clicked"){
        $("#finalList").hide();
      }
    }
  });
});
