var audioTest=0 ;

var DataRec;
var DatoRecibido;
var DatosTarifarios;
var QuienEnviaServicio;

var RetardoMsg=20000;     //Usado para tiempo de consulta de nuevos mensajes y actualizacion de posicion taxi mas frecuente
var RetardoPush=5000;
var temporizador;
var RetardoActualizaPosicion=30000;  //Tiempo normal de actualizacion de posicion taxi

var TemporizaRecorrido;
var RetardoActualizaRecorrido=20000;

var position_usr;
var pos;


var latitud;
var longitud;
var latlng;

var ultmsgvisto=0;
// Variables de posicion del taxi
var registrandoPosicion = false,
        idRegistroPosicion,
        ultimaPosicionUsuario,
        posicionActual,
        marcadorUsuario,
        DistanciaMinima=50;
var map;
var mapOptions;
var latitud_taxi=99.11111;
var longitud_taxi=88.22222;

var latitud_pasajero;
var longitud_pasajero;

var PantallaActual;

var dni;
var Placa=0;
var empresa_madre;

//Para Consulta de dirección
var mapConsultaDireccion;
var markerConsDireccion;

//Para Consulta de recorrido
var mapConsultaDireccion2;
var markerConsDireccion2;
var place;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: false,  draggable: true });
var placeB="";

var veces=0;
var llamadoGPS;

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    
    window.localStorage.setItem("haches",hashes);
    
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}


///////////////////////////////////////////////////////////////////////////////////////////////////
/////////  MOSTRAR UN RECORRIDO
///////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
/////////////  Rutinas para recorrido
//////////////////////////////////////////////////////////////////////////////
//Requiere previo:
//map con su canvas
//var map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);

//var directionsDisplay;
//var directionsService = new google.maps.DirectionsService();
//var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: false,  draggable: true });
function initializarConsultaRecorrido() 
  {
            var mapOptions = {
              //center: new google.maps.LatLng(centromapa_latitud,centromapa_longitud),
              center: new google.maps.LatLng(latitud_taxi,longitud_taxi),
              zoom: 13
            };
            map = new google.maps.Map(document.getElementById('mapConsultaDireccion2'),
              mapOptions);

            $('#inputDireccion2').val('');
            var input = /** @type {HTMLInputElement} */(
                document.getElementById('inputDireccion2'));

            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', map);
            autocomplete.setComponentRestrictions({ 'country': pais });

            var infowindow = new google.maps.InfoWindow();
            markerConsDireccion = new google.maps.Marker({
              map: map,
              anchorPoint: new google.maps.Point(0, -29)
            });

            google.maps.event.addListener(autocomplete, 'place_changed', function() {
              infowindow.close();
              markerConsDireccion.setVisible(false);
              var place = autocomplete.getPlace();
              if (!place.geometry) {
                return;
              }

              // If the place has a geometry, then present it on a map.
              if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
              } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  // Why 17? Because it looks good.
              }
              markerConsDireccion.setIcon(/** @type {google.maps.Icon} */({
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
              }));
              markerConsDireccion.setPosition(place.geometry.location);
              markerConsDireccion.setVisible(true);

              var address = '';
              if (place.address_components) {
                address = [
                  (place.address_components[0] && place.address_components[0].short_name || ''),
                  (place.address_components[1] && place.address_components[1].short_name || ''),
                  (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
              }

              infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
              infowindow.open(map, markerConsDireccion);

              //Reasigna el marcador B a la direccion obtenida
              start = new google.maps.LatLng(latitud_taxi, longitud_taxi);  
              pos_markerA=start;              
              pos_markerB=place.geometry.location;  
              placeB=pos_markerB;
              console.log("initializarConsultaRecorrido.pos_markerB: " + pos_markerB);
              //placeB=$.extend( {}, pos_markerB);              
              //console.log("initializarConsultaRecorrido.placeB: " + placeB);
              directionsDisplay.setMap(map);
              calcRouteObj(pos_markerA, pos_markerB);

            });


            directionsDisplay.setPanel(document.getElementById('ContenidoPanel'));
            directionsDisplay.setMap(map);
  }



function IniciaVerRecorrido(){
  //map.draggable=false;
  //pos_markerA=pos_usr;
  start = new google.maps.LatLng(latitud_taxi, longitud_taxi);  
  pos_markerA=start;
  //pos_markerB=map.getCenter();  
  console.log("placeB: " + placeB);
  pos_markerB=placeB;
  //$('#modRecorrido').show();
  directionsDisplay.setMap(map);
  calcRouteObj(pos_markerA, pos_markerB);  
  //setTimeout(function(){map.setZoom(15)}, 5000);
}

function TerminaVerRecorrido(){
  directionsDisplay.setMap(null);
  map.draggable=true;
  clearInterval(TemporizaRecorrido);
  //$('#modRecorrido').hide();
}

// prueba con: calcRouteLatLong(-29.412525, -66.859385, -29.417011, -66.853184)
function calcRouteLatLong(latinicio, longinicio, latfin, longfin) {
var start = new google.maps.LatLng(latinicio, longinicio);
var end = new google.maps.LatLng(latfin, longfin);
var request = {
  origin: start,
  destination: end,          
  travelMode: google.maps.TravelMode.DRIVING
};
directionsService.route(request, function(response, status) {
  if (status == google.maps.DirectionsStatus.OK) {
    directionsDisplay.setDirections(response);
  }
  else{
    alert("No se ha podido calcular ruta");
  }
});        
}

function calcRouteObj(inic, fin) {
var request = {
  origin: inic,
  destination: fin,          
  travelMode: google.maps.TravelMode.DRIVING
};
directionsService.route(request, function(response, status) {
  if (status == google.maps.DirectionsStatus.OK) {
    directionsDisplay.setDirections(response);
  }
  else{
    alert("No se ha podido calcular ruta");
  }
});
};


function MostrarConsultarRecorrido(modo)
    {
      if ($('#scrRecorreViaje').is(':visible'))
      {
        $("#scrRecorreViaje").hide();
        PantallaActual='scrRecorreViaje';
      }else{
        $('#scrAceptaViaje').hide();
        PantallaActual='scrAceptaViaje';
      };
      
      //$("#modConsultarRecorrido").show();
      console.log("Initialize");                  
      $("#modConsultarRecorrido").fadeIn(700, function()
          { 
            initializarConsultaRecorrido();
            if (modo=='Buscar Pasajero') {
              placeB = new google.maps.LatLng(latitud_pasajero, longitud_pasajero); 
            }else{
              placeB = new google.maps.LatLng(latitud_taxi, longitud_taxi); 
            };
            IniciaVerRecorrido();
            TemporizaRecorrido = setInterval(IniciaVerRecorrido, RetardoActualizaRecorrido);            
          });
    }

function OcultarConsultarRecorrido()
    {
      //alert("PantallaActual:" + PantallaActual);
      if (PantallaActual=='scrRecorreViaje') 
      {
        $("#scrRecorreViaje").show();
      }else{
        $("#scrAceptaViaje").show();
      }
      $("#modConsultarRecorrido").hide(); 
      TerminaVerRecorrido();     
    }


///////////////////////////////////////////////////////////////////////////////////////////////////
/////////  FIN DE MOSTRAR UN RECORRIDO
///////////////////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////////////////////////
/////////  CONSULTA DE DIRECCION EN MAPA
///////////////////////////////////////////////////////////////////////////////////////////////////
function initializarConsultaDireccion() 
  {
            var mapOptions = {
              center: new google.maps.LatLng(latitud_taxi, longitud_taxi),
              zoom: 15
            };
            var map = new google.maps.Map(document.getElementById('mapConsultaDireccion'),
              mapOptions);
            
            $('#inputDireccion').val('');
            var input = /** @type {HTMLInputElement} */(
                document.getElementById('inputDireccion'));

            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', map);
            autocomplete.setComponentRestrictions({ 'country': pais });

            var infowindow = new google.maps.InfoWindow();
            markerConsDireccion = new google.maps.Marker({
              map: map,
              anchorPoint: new google.maps.Point(0, -29)
            });

            google.maps.event.addListener(autocomplete, 'place_changed', function() {
              infowindow.close();
              markerConsDireccion.setVisible(false);
              var place = autocomplete.getPlace();
              if (!place.geometry) {
                return;
              }

              // If the place has a geometry, then present it on a map.
              if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
              } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  // Why 17? Because it looks good.
              }
              markerConsDireccion.setIcon(/** @type {google.maps.Icon} */({
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
              }));
              markerConsDireccion.setPosition(place.geometry.location);
              markerConsDireccion.setVisible(true);

              var address = '';
              if (place.address_components) {
                address = [
                  (place.address_components[0] && place.address_components[0].short_name || ''),
                  (place.address_components[1] && place.address_components[1].short_name || ''),
                  (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
              }

              infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
              infowindow.open(map, markerConsDireccion);
            });
  }

function MostrarConsultarDireccion()
    {
      $("#scrRecibeViaje").hide();
      //$("#modConsultarDireccion").show();
      console.log("Initialize");                  
      $("#modConsultarDireccion").fadeIn(700, function()
          {  initializarConsultaDireccion(); 
          });
    }

function OcultarConsultarDireccion()
    {
      $("#scrRecibeViaje").show();
      $("#modConsultarDireccion").hide();      
    }

///////////////////////////////////////////////////////////////////////////////////////////////////
/////////  ESTABLECE CONEXION A GPS OBLIGATORIA
///////////////////////////////////////////////////////////////////////////////////////////////////
function InicializaGPS1vez()
  {

          //dni=Base64.decode( getUrlVars()["dni"] );
          dni=getUrlVars()["dni"] ;
          Placa= getUrlVars()["placa"] ;
          //empresa_madre=Base64.decode( getUrlVars()["empresa"] );
          empresa_madre= getUrlVars()["empresa"] ;
          //alert(dni + "  //  " + Placa + "   //  " + empresa_madre);
          window.localStorage.setItem("Taxista",dni);
          window.localStorage.setItem("Placa",Placa);                    
          window.localStorage.setItem("Empresa",empresa_madre);

          if (navigator.geolocation) 
            { 
                console.log("localizado ok");
                $("#gpsEstado" ).fadeIn( "slow", function(){
                     document.getElementById("gpsEstado").innerHTML="Su teléfono tiene GPS..";
                     animaBarra();

                });
                //document.getElementById("gpsEstado").innerHTML="Su teléfono tiene GPS..";
                llamadoGPS = navigator.geolocation.watchPosition(
                  localizadoOk,
                  localizadoError,
                {
                    enableHighAccuracy : true,
                    maximumAge : 30000,
                    timeout : 5000
                }
            )
            }else{
                document.getElementById("gpsEstado").innerHTML='¡Tu teléfono no permite ubicar tu localización. No puedes usar este soft!';
            }      

  }

function localizadoOk(position)
  {      
      document.getElementById("gpsEstado").innerHTML="Conexión establecida..";
      navigator.geolocation.clearWatch( llamadoGPS );      
      posicionActual = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      //ultimaPosicionUsuario = posicionActual;          
      latitud_taxi=position.coords.latitude;
      longitud_taxi=position.coords.longitude;
      // Registra ID para GMC
      // 
      // 
      // Inicializa el GPS para frecuencia normal de actualización
      InicializaGPSnew();
      //           
      // Actualiza la posicion del taxi por primera vez
      ActualizaPosicionTaxi();
      //
      /// Habilita la pantalla de cambio de estado
      //setTimeout(function(){window.location="../scrEstado.html"} , 3000);            
      $("#scrConectaGPS" ).fadeOut( "slow", function(){
           $("#scrEstado").fadeIn( "slow" );
      });
      
  }

function localizadoError()
  {   
      document.getElementById("gpsEstado").innerHTML="Intentando conexión.. ";
      console.log('No se pudo determinar la ubicación'); 
  }

function animaBarra()
  {
      var $topLoader = $("#gpsGrafico").percentageLoader({
                        width : 180, height : 180, progress : 0.0, value : '100%'});
      topLoaderRunning = true;
      $topLoader.setProgress(0);        
      $topLoader.setValue('0kb');
      var kb = 0;
      // We're emulating a 'download' progress
      var totalKb = 100;
      
      // A function representing a single 'frame' of our animation
      var animateFunc = function() {
          kb += 1;     
          if (kb > totalKb) {
              kb = totalKb;  
          }
          $topLoader.setProgress(kb / totalKb);
          $topLoader.setValue(kb.toString() + '%');
          if (kb < totalKb) {
              setTimeout(animateFunc, 205);
          } else {
              topLoaderRunning = false;
          }
      }
      
      setTimeout(animateFunc, 205);
      return false;
  }

///////////////////////////////////////////////////////////////////////////////////////////////////
/////////  FIN CONSULTA DE DIRECCION EN MAPA
///////////////////////////////////////////////////////////////////////////////////////////////////
function InicializaGPSnew()
  {
      idRegistroPosicion = navigator.geolocation.watchPosition
      ( localizame, falloRegistroPosicion,
          {enableHighAccuracy : true, maximumAge : 10000, timeout : 5000 }
      )
      //alert("Inicia timer de actualiza posicion, retardo = " + RetardoActualizaPosicion);
      ActualizaPosicionTaxi();
      setInterval(ActualizaPosicionTaxi, RetardoActualizaPosicion);
  }

function localizame(position)
  {
      $("scrConectaGPS").hide();      
      console.log("Localizando por GPS...");      
      posicionActual = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      //ultimaPosicionUsuario = posicionActual;
      latitud_taxi=position.coords.latitude;
      longitud_taxi=position.coords.longitude;          
  }
function falloRegistroPosicion()
  {   console.log('No se pudo determinar la ubicación'); }

function EmuladorMovTaxi()
  {
      latitud_taxi=latitud_taxi + Math.floor(Math.random() * ( 0.001 - (-0.001) + 1)) + (-0.001);
      longitud_taxi=longitud_taxi + Math.floor(Math.random() * ( 0.001 - (-0.001) + 1)) + (-0.001);
  }

//////////////////////////////////////////////////////////////////////////////////////////
/////// ACTUALIZA LA POSICION DEL TAXI
//////////////////////////////////////////////////////////////////////////////////////////
function ActualizaPosicionTaxi()
  {
    //console.log("ActualizaPosicionTaxi");
    var mts=getDistance(posicionActual, ultimaPosicionUsuario);
    //var mts=110;
    console.log("posicionActual:" + posicionActual + "ultimaPosicionUsuario: " + ultimaPosicionUsuario);
    if (mts>DistanciaMinima) {      //Actualiza posicion si se movió más de 100 mts
        console.log("Distancia > 100 mts, actualizando posicion");
        //NotificaToast("Distancia=" + mts);
        placa=window.localStorage.getItem("Placa");
        $.post(urllocal + 'tools/Tx_ActualizaPosicion.php', 
              {placa: placa,
               lattaxi: latitud_taxi,
               longtaxi: longitud_taxi}, null, null
              );
        ultimaPosicionUsuario=posicionActual;
        //navigator.notification.beep(1);
    }else{
      console.log("Distancia= " + mts + " < 100 mts, no se actualiza");
      //NotificaToast("Distancia < 100 mts, no se actualiza");
      };
  }

function degreesToRadian(numDegrees) 
  {  
        return numDegrees * Math.PI / 180;  
  }  

function getDistance(location1, location2) 
  {  
        var lat1   = location1.lat();          
        var lng1   = location1.lng();  
        try {
        var lat2   = location2.lat();  
        var lng2   = location2.lng();  
      }catch(e){
        var lat2   = 0;  
        var lng2   = 0;  
        }
        /* console.log("lat1=" + lat1);
        console.log("lat2=" + lat2);
        console.log("lon1=" + lng1);
        console.log("lon2=" + lng2);
        */

        var result = Math.round( Math.sqrt(Math.pow((lat2 - lat1) , 2) + Math.pow((lng2 - lng1) , 2) ) * 73000 );
        //NotificaToast("Distancia relativa:" + result );
        return result;  
  }    
function getDistancePuto(location1, location2) 
  {  
        var lat1   = degreesToRadian(location1.lat());          
        var lng1   = degreesToRadian(location1.lng());  
        try {
        var lat2   = degreesToRadian(location2.lat());  
        var lng2   = degreesToRadian(location2.lng());  
      }catch(e){
        var lat2   = 0;  
        var lng2   = 0;  
        }
        var result = Math.pow(Math.sin((lat2 - lat1)) , 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng2 - lng1)) , 2);  
        //NotificaToast("Distancia relativa:" + (7918000 * Math.asin(Math.sqrt(result))) );
        return (7918000 * Math.asin(Math.sqrt(result)));  
  }  
//////////////////////////////////////////////////////////////////////////////////////////
/////// CAMBIA EL ESTADO DEL TAXI
//////////////////////////////////////////////////////////////////////////////////////////
function ChangeStatus(placa, estado)
  {		
    //alert("Cambiando estado de " + placa + " a " + estado);
    //alert("Largo de Placa:" + placa.length);
  	$.post(urllocal + 'tools/Tx_ChangeStatus.php', {
                    placa: placa,
                    estado: estado
                    }, 
  		function(data){									
            console.log(data);
            //try {	DataRec = JSON.parse(data); }
            //catch(err) {};
            DataRec = JSON.parse(data);
            console.log(DataRec);
            //alert("DataRec.Resultado:" + DataRec.Resultado);
  					if (DataRec.Resultado==0)
  					{
                                      console.log("Cambio de estado de " + placa + " realizado...");
                                }
  					else
  					{
                                      alert("No se pudo actualizar. Intente nuevamente, o verifique su linea de teléfono.");
                                }
  				})
  			.fail(function() 
  				{
  					Notifica("ATENCION", "No se pudo cambiar a " + estado + ". Intente nuevamente. No podrá recibir viajes.");
            setTimeout(ChangeStatus, 10000);
  				})	
  };  	


//////////////////////////////////////////////////////////////////////////////////
///////////// CHEQUEA NUEVOS SERVICIOS Y ACTUALIZA POSICION //////////////////////
//////////////////////////////////////////////////////////////////////////////////
function ChequearNuevosServicios()
  {
    try { clearInterval(temporizador) }
      catch(err) {
          console.log("Clearing intervals");
      };
      temporizador=setInterval(
              function(){
                  console.log("Consultando nuevo servicio");
                  try { 
                      var msg=window.localStorage.getItem("MensajePush");                      
                      if (msg=='NUEVO SERVICIO') 
                          {
                              //alert("Nuevo servicio detectado:" + msg);
                              clearInterval(temporizador);
                              ConsultarNuevoServicio();
                          };
                      }
                    catch(err) {};                  
              }
              ,RetardoPush);
  }

// Consulta si existen nuevos servicios para el taxi (Unidad-Placa)
// Actualiza la posición GPS del taxi
function ConsultarNuevoServicio()
      {            
            //alert("Entrando a ConsultarNuevoServicio");            
            var servicio=window.localStorage.getItem("ServicioPush");
            //alert("Nro de servicio:" + servicio);
            $.post(urllocal + 'tools/Tx_CheckNuevoServicio3.php', 
                  {servicio: servicio}, 
                  function(data){                                                   
                        DatoRecibido = JSON.parse(data);                         
                        //alert("Dato recibido en Consultar Nuevo Servicio:" + DatoRecibido.Resultado);                       
                              switch (DatoRecibido.Resultado)
                                    {
                                    case 0:     //YA NO DEBERIA EXISTIR                                           
                                                //ActualizarDatosServicio('');
                                      break;
                                    case 1:
                                                console.log("Se encontró un nuevo servicio" + DatoRecibido.Servicio);                                                
                                                window.localStorage.setItem("MensajePush","");

                                                // Nueva seccion para actualizar los datos del cliente
                                                //Cliente.nombre
                                                //Cliente.email_cliente
                                                //Cliente.celular
                                                //Cliente.marca_negra
                                                //window.localStorage.setItem("DatosCliente",JSON.stringify(DatoRecibido.Cliente));
                                                $('#lblNombre').html('<b>' + DatoRecibido.Cliente["nombre"] + '</b><br>Tel: ' + DatoRecibido.Cliente["celular"]);
                                                $('#lblNombre2').html('<b>' + DatoRecibido.Cliente["nombre"] + '</b><br>Tel: ' + DatoRecibido.Cliente["celular"]);
                                                localStorage.setItem("TelefonoCliente",DatoRecibido.Cliente["celular"]);
                                                $('#lblEmail').html(DatoRecibido.Cliente["email_cliente"]);
                                                //$('#lblMarcaNegra').val(DatoRecibido.Cliente["marca_negra"];

                                                //clearInterval(temporizador); 
                                                ActualizarDatosServicio(DatoRecibido.Servicio);
                                                //alert("DatoRecibido.LatitudPasajero:" + DatoRecibido.Servicio["latitud_origen"]);
                                                latitud_pasajero=DatoRecibido.Servicio["latitud_origen"];
                                                longitud_pasajero=DatoRecibido.Servicio["longitud_origen"];
                                                $('#scrLibre').hide();
                                                //Analiza quien envia el servicio para activar mensajes bidireccionales o no
                                                if (DatoRecibido.Servicio['notas']=='Solicita Pasajero') 
                                                    {
                                                        $('#TituloRecibeViaje').html("PASAJERO solicita servicio");
                                                        QuienEnviaServicio='PASAJERO';
                                                        $('#btnEnviarMensaje').show();
                                                    }else{
                                                        $('#TituloRecibeViaje').html("OPERADOR ENVIA SERVICIO");                                                        
                                                        QuienEnviaServicio='OPERADOR';
                                                        $('#btnEnviarMensaje').hide();
                                                    };
                                                $('#scrRecibeViaje').show();                                                
                                                scrRecibeViaje();
                                      break;
                                    default:
                                                console.log("Estado no previsto en ConsultarNuevoServicio");
                                                setTimeout(ConsultarNuevoServicio, 5000);
                                    }
                              })
                        .fail(function (xhr, ajaxOptions, thrownError) {                            
                            NotificaToast("Error de comunicación. ¿Tiene crédito?");
                            setTimeout(ConsultarNuevoServicio, 5000);
                              });                     
      }

//////////////////////////////////////////////////////////////////////////////////
///////////// CHEQUEA NUEVOS MENSAJES Y ACTUALIZA POSICION //////////////////////
//////////////////////////////////////////////////////////////////////////////////
function ProcesarMsgTaxi(){
    try { clearInterval(temporizador) }
      catch(err) {
          console.log("Clearing intervals");
      };
      temporizador=setInterval(
              function(){
                  console.log("Consultando nuevo mensaje");
                  try { 
                      var msg=window.localStorage.getItem("MensajePush");
                      if (msg=='Cancela pasajero') 
                          {                              
                              clearInterval(temporizador);
                              Notifica('Viaje cancelado','Viaje cancelado por el pasajero');
                              Estado_Libre();
                          };
                      }
                    catch(err) {};                  
              }
              ,RetardoPush);
}



/////////////////////////////////////////////////////////////////
///////////// RUTINAS DE FUNCIONAMIENTO     /////////////////////
/////////////////////////////////////////////////////////////////

function ActualizarDatosServicio(servicio)
      {
           console.log("Actualizando datos del servicio en localstorage:" + JSON.stringify(servicio));
           //DatosServicio=servicio;
           window.localStorage.setItem("Servicio", JSON.stringify(servicio));
      }


/////////////////////////////////////////////////////////////////
///////////// MENSAJES HACIA EL PASAJERO     ////////////////////
/////////////////////////////////////////////////////////////////
function Mensaje2Pasajero(texto)
      {
            Mensaje={   servicio : DatosServicio.servicio_numero,
                        userId : window.localStorage.getItem("Placa"),
                        mensaje : texto,
                        accion: "Mensaje",
                        desdehacia : 'Taxi'
            };
            enviarMsj(Mensaje, true);
            $('#modEnviarMensaje').modal('hide');
      };

function CancelarViaje(servicio)
      {
            console.log("CancelarViaje " + servicio);
            Mensaje={   servicio : servicio,
                        userId : "",
                        mensaje : "",
                        accion: "Cancela taxi",
                        desdehacia : 'Taxi'
            };
            enviarMsj(Mensaje, true);
            $('#modCancelaViaje').modal('hide');
            window.localStorage.setItem("Servicio",'');
      };

function TaxiEnCamino(servicio)
      {
            console.log("TaxiEnCamino " + servicio);
            Mensaje={   servicio : servicio,
                        userId : "",
                        mensaje : "",
                        accion: "Recibido y en camino",
                        desdehacia : 'Taxi'
            };
            enviarMsj(Mensaje, false);            
      };


function IniciaViaje(servicio)
      {
            console.log("IniciarViaje " + servicio);
            Mensaje={   servicio : servicio,
                        userId : window.localStorage.getItem("Placa"),
                        mensaje : "",
                        accion: "Inicia viaje",
                        desdehacia : 'Taxi'
            };
            enviarMsj(Mensaje, false);
            

      };

function FinalizaViaje()
      {
            console.log("Finaliza Viaje");
            Mensaje={   servicio : DatosServicio.servicio_numero,
                        userId : DatosServicio.placa,
                        mensaje : "",
                        accion: "Finaliza viaje",
                        desdehacia : 'Taxi'
            };
            enviarMsj(Mensaje, false);
      };

function AlertaLlegada()
      {
            console.log("AlertaLlegada");
            Mensaje={   servicio : DatosServicio.servicio_numero,
                        userId : DatosServicio.placa,
                        mensaje : "",
                        accion: "Alerta",
                        desdehacia : 'Taxi'
            };
            enviarMsj(Mensaje, true);
      };



function enviarMsj(datojson, resultado){
//(servicio_numero, usuario, fecha, hora, mensaje, desdehacia)
      console.log("enviaMsj " + datojson + " resultado: " + resultado);
      $.post(urllocal + 'tools/Tx_Mensajes2Pasajero.php', 
            datojson,  
            function(data){                                                   
                  DatoRecibido = JSON.parse(data);
                  //alert("Datorecibido en EnviarMsj:" + DatoRecibido);
                              if (resultado==true) {
                                    if(DatoRecibido.Resultado==0)
                                          {
                                                //No se pudo enviar el mensaje
                                                $('#mensajes').modal('hide');                                                                                                
                                                Notifica('Intente nuevamente', 'No se pudo enviar el mensaje');
                                          }else{
                                                NotificaToast('¡ MENSAJE ENVIADO !');
                                                $('#mensajes').modal('hide');
                                          }
                              };
                        })
                  .fail(function (xhr, ajaxOptions, thrownError) {
                        $('#mensajes').modal('hide');
                        Notifica('Problema de comunicación', '¿Tiene crédito su teléfono?');
                        });
      };


//////////////////////////////////////////////////////////////////////////////////////////
/////////  CONSULTA TARIFAS Y REALIZA PAGOS                                     //////////
//////////////////////////////////////////////////////////////////////////////////////////
function EligedropOrigen(ind, pantalla)
      {
            console.log("EligeDropOrigen: " + ind + '   ' + pantalla);
            var ZonaElegida=DatosTarifarios.Zonas[ind];
            if (pantalla==1) {
                $('#lblOrigen').text(ZonaElegida);
                $('#ulDestino').empty();
                $('#lblDestino').text("Elegir zona destino");
                $('#lblMonto').text('$$$');
            }else{
                $('#lblOrigen2').text(ZonaElegida);
                $('#ulDestino2').empty();
                $('#lblDestino2').text("Elegir zona destino");
                $('#lblMonto2').text('$$$');
            }

            
            for (indice in DatosTarifarios.Tarifas)
            {                                          
                  var txt=DatosTarifarios.Tarifas[indice]['zona'];
                  //console.log(txt);
                  if (ZonaElegida==DatosTarifarios.Tarifas[indice]['zona_ref']) {
                        var option='<li><a style=' + String.fromCharCode(34) + 'font-size:2em;' + String.fromCharCode(34) + ' href="javascript: EligedropDestino(' + indice + ', ' + pantalla + ')">' + txt + '</a></li>';
                        if (pantalla==1) {
                            $('#ulDestino').append(option);
                        }else{
                            $('#ulDestino2').append(option);
                        }
                  };
            }
      }
function EligedropDestino(ind, pantalla)
      {
            console.log("EligeDropDestino: " + ind + "   " + pantalla);
            if (pantalla==1) {
                $('#lblDestino').text(DatosTarifarios.Tarifas[ind]['zona']);
                var Monto=DatosTarifarios.Tarifas[ind]['tarifa_servicio'];
                $('#lblMonto').text(Monto + ' ' + monedapais);
            }else{
                $('#lblDestino2').text(DatosTarifarios.Tarifas[ind]['zona']);
                var Monto=DatosTarifarios.Tarifas[ind]['tarifa_servicio'];
                $('#lblMonto2').text(Monto + ' ' + monedapais);

            }
      }

function ConsultaTarifas(pantalla){
      $.post(urllocal + 'tools/Tx_TarifasZonas.php', 
            {empresa_madre : DatosServicio.empresa_madre},  
            function(data){                                                   
                  DatosTarifarios = JSON.parse(data);
                  console.log(DatosTarifarios);                              
                        if(DatosTarifarios.Resultado==0)
                              {
                                    //alert("No se pudieron obtener las tarifas. Intente nuevamente.");
                                    Notifica('Intente nuevamente', 'No se pudieron obtener las tarifas.');
                              }else
                              {
                                        $('#ulOrigen').empty();
                                        $('#ulDestino').empty(); 
                                        $('#ulOrigen2').empty();
                                        $('#ulDestino2').empty(); 
                                        for (indice in DatosTarifarios.Zonas)
                                        {                                          
                                              var txt=DatosTarifarios.Zonas[indice];
                                              var option='<li><a style=' + String.fromCharCode(34) + 'font-size:2em;' + String.fromCharCode(34) + ' href="javascript: EligedropOrigen(' + indice + ', ' + pantalla + ')">' + txt + '</a></li>';
                                              console.log(option);
                                              if (pantalla==1) {
                                                $('#ulOrigen').append(option);
                                              }else{
                                                $('#ulOrigen2').append(option);
                                              }
                                        };
                              }
                  })
                  .fail(function (xhr, ajaxOptions, thrownError) {
                        $('#mensajes').modal('hide');
                          Notifica('Problema de comunicación', '¿Tiene crédito su teléfono?');
                        });
                  return DatosTarifarios;
      };

function PagaServicio(monto){      
      monto= monto.split(" ");
      var direccion_destino="San Nicolas de bari 1258";      

      $.post(urllocal + 'tools/Tx_PagaServicio.php', 
            {servicio : DatosServicio.servicio_numero,
              monto: monto[0],
              placa: DatosServicio.placa,
              zona_origen: $('#lblOrigen2').text(),
              zona_destino: $('#lblDestino2').text(),
              latitud_destino: latitud_taxi,
              longitud_destino: longitud_taxi,
              direccion_destino: direccion_destino,
              hora_programada: DatosServicio.hora_programada
           },  
            function(data){                                                   
                  DatoRecibido = JSON.parse(data);
                  console.log('DatoRecibido=' + DatoRecibido);                              
                        if(DatoRecibido.Resultado==0)
                              {
                                    //alert("No se pudo realizar el pago. Intente de nuevo");
                                    Notifica('No se pudo realizar el pago.', 'Intente de nuevo');
                                    return false;
                              }else
                              {
                                    $('#modTarifasViaje').modal('hide');                                    
                                    NotificaToast('¡ SERVICIO CONCLUIDO EXITOSAMENTE !');
                                    return true;
                              }
                  })
                  .fail(function (xhr, ajaxOptions, thrownError) {                        
                            Notifica('Problema de comunicación', '¿Tiene crédito su teléfono?');                            
                        });                  
      };


////////////////////////////////////////////////////////////////////
//////////////////  EMITE EL PEDIDO DEL TAXI       /////////////////   
////////////////////////////////////////////////////////////////////   
// REALIZA EL REQUERIMIENTO DE NUEVO SERVICIO POR PASAJERO EN CALLE
function PedidoInItinere()
  {    
    //var tipovehiculo=$_POST['tipovehiculo']; //Crear   
  if( window.plugins && window.plugins.toast ) {  
    window.plugins.toast.showLongBottom('¡ REQUERIMIENTO ENVIADO !');
  }
    
  $.post(urllocal + 'tools/Tx_solicitudItinere.php', 
        {
            placa : placa,
            dni : dni,
            moneda : monedapais,
            direccion : 'Servicio in itinere',
            lat : latitud_taxi,
            lng : longitud_taxi,
            referencia : 'Servicio in itinere',
            destino : '-'
        }, 
      function(data){                 
        console.log("Vuelve con datos");
        try {DatoRecibido = JSON.parse(data); }
        catch(e) {};
        //console.log("Vuelve con datos:" + DatoRecibido.Resultado);
            if(DatoRecibido.Resultado==0)
              {
                // No hay taxi disponible
                alert("¡No recibido por el taxi!");
              }else{
                //Se ha generado el servicio y espera
                NotificaToast("Servicio creado Nro " + DatoRecibido.NroServicio);                
              }
          })
        .fail(function (xhr, ajaxOptions, thrownError) 
          {
              NotificaToast("Error en la comunicación. Inténtelo de nuevo.");
          });      
  }; 


//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////


function InicializarMapaPasajero(latitud, longitud)
  {      
      latlng = new google.maps.LatLng(latitud, longitud);
      mapOptions = {
                      zoom: 16,
                      center: latlng,
                      mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
      map = new google.maps.Map($("#map_canvas").get(0), mapOptions);

      var Marker = new google.maps.Marker({
          position: latlng,
          map: map
      });

      // To add the marker to the map, call setMap();
      //marker.setMap(map);
  }


function MsgNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: No se pudo obtener la dirección.';
  } else {
    var content = 'Error: Tu navegador no soporta la geolocalización.';
  }
  showMsg('modal-alerts','Atención',content,'danger');
}


function coordenadas(position) {
            latitud = position.coords.latitude; /*Guardamos nuestra latitud*/
            longitud = position.coords.longitude; /*Guardamos nuestra longitud*/
            //cargarMapa(latitud,longitud);
        }
        
        function errores(err) {
            /*Controlamos los posibles errores */
            if (err.code == 0) {
              alert("Oops! Algo ha salido mal");
            }
            if (err.code == 1) {
              alert("Oops! No has aceptado compartir tu posición");
            }
            if (err.code == 2) {
              alert("Oops! No se puede obtener la posición actual");
            }
            if (err.code == 3) {
              alert("Oops! Hemos superado el tiempo de espera");
            }
        }
         
        function cargarMapa(latitud,longitud) {
            var latlon = new google.maps.LatLng(latitud,longitud); /* Creamos un punto con nuestras coordenadas */
            var myOptions = {
                zoom: 17,
                center: latlon, /* Definimos la posicion del mapa con el punto */
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            
            var coorMarcador = new google.maps.LatLng(latitud,longitud); 

            var marcador = new google.maps.Marker({        
                position: coorMarcador, /*Lo situamos en nuestro punto */
                map: map, /* Lo vinculamos a nuestro mapa */
                title: "Dónde estoy?" 
            });
        }

////////////////////////////////////////////////////////////////////////
//  PANTALLA scrRecibeViaje
////////////////////////////////////////////////////////////////////////
function scrRecibeViaje(){            
            DatosServicio=JSON.parse(window.localStorage.getItem("Servicio"));
            console.log("DatosServicio:" + DatosServicio.placa);
            $('#dirInicial').html(DatosServicio.direccion_origen);
            $('#Referencia').html(DatosServicio.referencia_origen);
            if (DatosServicio.direccion_destino=='') {DatosServicio.direccion_destino='No indica dirección'};
            $('#dirDestino').html(DatosServicio.direccion_destino);
            $('#Moneda').html(DatosServicio.idmoneda);
            $('#TipoVehiculo').html(DatosServicio.tipo_de_vehiculo);            
            ChangeStatus(DatosServicio.placa, 'Ocupado');
            PlayAvisoTaxiServicio();

            ProcesarMsgTaxi();            
          }

function btnCancelarViajeRecibido(){
              console.log("btnCancelarViajeRecibido");
              CancelarViaje(DatosServicio.servicio_numero);              
              $('#modCancelaViaje').modal('hide');
              Estado_Inactivo();
            };


////////////////////////////////////////////////////////////////////////
//  PANTALLA scrAceptaViaje
////////////////////////////////////////////////////////////////////////
function scrAceptaViaje(){                    
          $('#scrRecibeViaje').hide();
          $('#scrAceptaViaje').show();

          DatosServicio=JSON.parse(window.localStorage.getItem("Servicio"));
            console.log("DatosServicio:" + DatosServicio.placa);
            $('#dirOrigen').html(DatosServicio.direccion_origen);
            $('#Referencia2').html(DatosServicio.referencia_origen);
            if (DatosServicio.direccion_destino=='') {DatosServicio.direccion_destino='No indica dirección'};
            $('#dirDestino2').html(DatosServicio.direccion_destino);
            $('#Moneda2').html(DatosServicio.idmoneda);
            $('#TipoVehiculo2').html(DatosServicio.tipo_de_vehiculo);            
            ProcesarMsgTaxi();
            TaxiEnCamino(DatosServicio.servicio_numero);
          };

function btnIniciaViaje(){
            IniciaViaje(DatosServicio.servicio_numero);
            scrRecorreViaje();
          };

function btnVolverdeTarifas(){
                $('#modConsultarTarifas').modal('hide');
            };

function btnConsultarTarifas(){
                ConsultaTarifas(1);
                $('#modConsultarTarifas').modal('show');                
            };

function btnAvisarLlegada(){
                AlertaLlegada();
            };


////////////////////////////////////////////////////////////////////////
//  PANTALLA scrRecorreViaje
////////////////////////////////////////////////////////////////////////
function scrRecorreViaje(){          
          $('#scrAceptaViaje').hide();
          $('#scrRecorreViaje').show();          
          };

function btnEmergencia(){              
              CancelarViaje(DatosServicio.servicio_numero);              
              $('#modCancelaViaje').modal('hide');
              Estado_Emergencia();
            };   

function btnFinalizaServicio() {
            ConsultaTarifas(2);
            $('#modTarifasViaje').modal('show');
            };

function btnPagoTabuladoOk(){
                if ($('#lblMonto2').text()=='$$$') {                  
                  NotificaToast('¡ No indicó el monto del servicio !');
                }else{
                  //if pagaservicio=true -> ok
                  if(PagaServicio($('#lblMonto2').text())!=false)
                    {
                        $('#modTarifasViaje').modal('hide');
                        Estado_Libre();
                        
                    } 
                }
            };

function btnPagoNoTabuladoOk(){
                if ($('#inpMonto').val()=='') {
                  NotificaToast('¡ No indicó el monto del servicio !');
                }else{
                  //if pagaservicio=true -> ok
                  if(PagaServicio($('#inpMonto').val())!=false)
                    {                        
                        $('#modTarifasViaje').modal('hide');
                        Estado_Libre();
                    }
                }
            };


////////////////////////////////////////////////////////////////////////
//  PANTALLA scrLibre
////////////////////////////////////////////////////////////////////////
// Detecta que se ha solicitado la pantalla desde scrEstado
function Estado_Libre(){
          $('#scrAceptaViaje').hide();
          $('#scrEmergencia').hide();
          $('#scrEstado').hide();
          $('#scrFin').hide();
          $('#scrInactivo').hide();
          $('#scrLibre').fadeIn("slow");
          $('#scrRecibeViaje').hide();
          $('#scrRecorreViaje').hide();
          
          //$('#main').load("scrLibre.html #main");
          console.log("Placa almacenada en localstorage: " + Placa);
          window.localStorage.setItem("MensajePush","");
          ChangeStatus(Placa, "Libre");          
          //ChequearNuevosServicios();            
    };

function Estado_Inactivo(){          
          //ChequearNuevosServicios();
          ChangeStatus(Placa, "Inactivo");
          $('#scrAceptaViaje').hide();
          $('#scrEmergencia').hide();
          $('#scrEstado').hide();
          $('#scrFin').hide();
          $('#scrInactivo').fadeIn("slow");
          $('#scrLibre').hide();
          $('#scrRecibeViaje').hide();
          $('#scrRecorreViaje').hide();          
    };

function Estado_Emergencia(){
          //ChequearNuevosServicios();  
          ChangeStatus(Placa, "Emergencia");        
          $('#scrAceptaViaje').hide();
          $('#scrEmergencia').fadeIn("slow");
          $('#scrEstado').hide();
          $('#scrFin').hide();
          $('#scrInactivo').hide();
          $('#scrLibre').hide();
          $('#scrRecibeViaje').hide();
          $('#scrRecorreViaje').hide();          
    };

function btnCerrarSesion(){
          $('#scrInactivo').hide();
          $('#Fin').show();
          navigator.app.exitApp();
     };

////////////////////////////////////////////////////////////////////////////////////
///////////// AVISOS Y NOTIFICACIONES DE TEXTO Y SONORAS
////////////////////////////////////////////////////////////////////////////////////

function showMsg(id,title,text,type)
  {      
      $('#alert_content').html('<div class="alert alert-'+type+'" role="alert">'+text+"</div>");
      $('#alert_title').html(title);
      $('#'+id).modal('show');
      if (type=='info') {
          AlertSound();
      };  
  }

function AlertSound(){
      var fileFormat = "mp3";
      var mp3Test = new Audio();
      var canPlayMP3 = (typeof mp3Test.canPlayType === "function" && mp3Test.canPlayType("audio/mpeg") !== "");
      if (!canPlayMP3) {
        fileFormat = "ogg";
      }
      var sound = new Audio(urllocal + 'assets/sounds/SD_ALERT_43_22.' + fileFormat);
      sound.play();
  }

function PlayAvisoTaxiServicio()
  {
      navigator.notification.vibrateWithPattern([0, 100, 100, 200, 100, 400, 100, 800]);
      window.plugins.NativeAudio.play( 'music' );
  };

function Notifica(titulo, mensaje){
  if( window.plugins && window.plugins.Notification )
      {
          navigator.notification.confirm(
              mensaje,      // message
              onNotifica,                  // callback
              titulo,        // title
              ['Ok']                      // buttonName
          );
          navigator.notification.beep(1);
          navigator.notification.vibrateWithPattern([0, 100, 100]);
      }else{
          showMsg('modal-alerts',titulo, mensaje,'info');
      }
  };

function onNotifica() 
  {    
  };

function NotificaToast(mensaje){
    if( window.plugins && window.plugins.toast ) 
      {  
        window.plugins.toast.showLongBottom(mensaje);
      }else{
        showMsg('modal-alerts','Atención', mensaje,'info');
      }
  };
