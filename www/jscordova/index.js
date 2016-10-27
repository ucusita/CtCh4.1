////////////////////////////////////////////////////////////////////////
//      RUTINAS PARA IMPLEMENTAR PUSH VERSION 3.0
////////////////////////////////////////////////////////////////////////
// EN INDEX:
//        <script type="text/javascript" src="cordova.js"></script> 
//        <script type="text/javascript" src="phonegap.js"></script> 
//        <script type="text/javascript" src="PushNotification.js"></script> 
//        <script type="text/javascript" src="js/index.js"></script> 
// 
// LLAMADA CON:
//        app.initialize();
////////////////////////////////////////////////////////////////////////
var app = { 
    // Application Constructor 
    initialize: function() { 
        console.log("Initialize");
        this.bindEvents(); 
    }, 
    bindEvents: function() { 
        console.log("deviceready");
        document.addEventListener('deviceready', this.onDeviceReady, false); 
    }, 
    onDeviceReady: function() {
        //alert("onDeviceReady"); 
        app.receivedEvent('deviceready');
        if( window.plugins && window.plugins.NativeAudio ) {            
            window.plugins.NativeAudio.preloadComplex( 'music', 'assets/sounds/Taxi2.mp3', 1, 1, function(msg){
            }, function(msg){
                console.log( 'error: ' + msg );
            });
        }

        // Android customization
            cordova.plugins.backgroundMode.setDefaults({ text:'Esperando carreras...'});
            // Enable background mode
            cordova.plugins.backgroundMode.enable();

            // Called when background mode has been activated
            cordova.plugins.backgroundMode.onactivate = function () {
                setTimeout(function () {
                    // Modify the currently displayed notification
                    cordova.plugins.backgroundMode.configure({
                        text:'Esperando carreras...'
                    });
                }, 5000);
            }
        
        //Mantener despierto
        window.plugins.insomnia.keepAwake();

        //Evita el BackButton que cierra la app
        //if(device.platform == "Android"){
            document.addEventListener("backbutton", onBackKeyDown, false);
        //    }

    }, 
    // Update DOM on a Received Event 
    receivedEvent: function(id) { 
        console.log('Received Event: ' + id); 
        var pushNotification = window.plugins.pushNotification; 
        //if (device.platform == 'android' || device.platform == 'Android') { 
            //alert("Register llamado desde Android"); 
            pushNotification.unregister(this.successHandler, this.errorHandler);
            //tu Project ID aca!! 
            //pushNotification.register(this.successHandler, this.errorHandler,{"senderID":"76401170440","ecb":"app.onNotificationGCM"}); 
            pushNotification.register(this.successHandler, this.errorHandler,{"senderID":"76401170440","ecb":"app.onNotificationGCM"}); 
        //} 
        //else { 
            //alert("Register called"); 
        //    pushNotification.register(this.successHandler,this.errorHandler,{"badge":"true","sound":"true","alert":"true","ecb":"app.onNotificationAPN"}); 
        //} 
    }, 
    // result contains any message sent from the plugin call 
    successHandler: function(result) { 
        //alert('Me comuniqué exitosamente! Callback Result = ' + result); 
    }, 
    errorHandler:function(error) { 
        alert("Ha ocurrido un error: " + error); 
    }, 
    onNotificationGCM: function(e) { 
        //Deberia traer la app al foreground


        //alert("onNotificationGCM");
        switch( e.event ) 
        { 
            case 'registered': 
                if ( e.regid.length > 0 ) 
                { 
                    //console.log("Regid " + e.regid); 
                    //alert('registration id = '+e.regid); 
                    //Almacena el RegId para su uso posterior
                    window.localStorage.setItem("RegId",e.regid);
                    //Cuando se registre le pasamos el regid al input 
                    var plac=window.localStorage.getItem("Placa");
                    var doc=window.localStorage.getItem("Taxista");
                    //alert("Previo registrarTaxi con Placa: " + plac + "   Taxista: "+ doc);
                    registrarTaxi(doc, plac, e.regid);
                    //document.getElementById('regId').value = e.regid; 
                } 
            break; 

            case 'message': 
              // NOTIFICACION!!! 
              //
              // PROCESO DEL MENSAJE //
              //alert('Mensaje recibido: '+e.message+' msgcnt = '+e.msgcnt);               
              var ContenidoPush=JSON.parse(e.message);
              //alert("ContenidoPush" + ContenidoPush);
              //alert("ContenidoPush.title" + ContenidoPush.title);
                    switch (ContenidoPush.title) 
                    {
                        case 'NUEVO SERVICIO':
                            window.localStorage.setItem("MensajePush","NUEVO SERVICIO");
                            window.localStorage.setItem("ServicioPush",ContenidoPush.msgcnt);
                            //alert("nro de servicio:" + ContenidoPush.message);
                            
                            navigator.notification.beep(1);
                            ConsultarNuevoServicio();
                            break;

                        case 'Cancela pasajero':
                            window.localStorage.setItem("MensajePush","Cancela pasajero");
                            navigator.notification.beep(1);
                            break;

                        case 'Cancela sistema':
                            window.localStorage.setItem("MensajePush","Cancela sistema");
                            Notifica("Servicio cancelado", "Servicio cancelado por el sistema por falta de respuesta");
                            $('#modCancelaViaje').modal('hide');
                            navigator.notification.beep(1);
                            setTimeout(function(){ Estado_Inactivo() }, 1000); // Lo pasa a ocupado a la fuerza
                            //setTimeout(Estado_Libre(), 60000);                  
                            setTimeout(function(){ Estado_Libre() }, 120000); //Vuelve el estado a libre luego de 1 minuto automáticamente
                            break;
                            
                        case 'VIP WEB':
                            //alert("Llego la notificacion");
                            //Prueba de VIP Club con PLugin InAppBrowser
                            var ref = window.open(ContenidoPush.message, '_blank','location=yes','closebuttoncaption=Return','hidden=no');
                            navigator.notification.beep(1);
                            setTimeout(function(){ref.close()},60000);
                            break;

                        default:
                            navigator.notification.confirm(
                                            ContenidoPush.message,      // message
                                            onConfirm,                  // callback
                                            ContenidoPush.title,        // title
                                            ['Ok']                      // buttonName
                                        );
                                        navigator.notification.beep(1);
                            //var ref = window.open(ContenidoPush.message, '_blank', 'location=no','closebuttoncaption=Return','hidden=yes');

                    };

            break; 

            case 'error': 
              alert('GCM error = '+e.msg); 
            break; 

            default: 
              alert('An unknown GCM event has occurred'); 
              break; 
        } 
    }, 
    onNotificationAPN: function(event) { 
        var pushNotification = window.plugins.pushNotification; 
        alert("Running in JS - onNotificationAPN - Received a notification! " + event.alert); 
         
        if (event.alert) { 
            navigator.notification.alert(event.alert); 
        } 
        if (event.badge) { 
            pushNotification.setApplicationIconBadgeNumber(this.successHandler, this.errorHandler, event.badge); 
        } 
        if (event.sound) { 
            var snd = new Media(event.sound); 
            snd.play(); 
        } 
    } 
};

//Actualiza los datos de taxista actual y su teléfono en la tabla Unidades
function registrarTaxi(doc, placa, reg)
        {
            //alert("Se registra Taxi");
            if (reg != "") {                 
                    //Enviamos los datos al servidor php 
                    $.post ( urllocal + 'tools/Tx_RegistroGCM.php', {dni:doc, placa:placa, regid:reg } , 
                        function(data){                                             
                                DatoRecibido = JSON.parse(data);
                                //alert("DatoRecibido - Resultado:" + DatoRecibido.Resultado);
                                //alert("DatoRecibido - RowCount:" + DatoRecibido.RowCount);
                                if (DatoRecibido.Resultado=="Ok")
                                {   // --- Listo para recibir mensajes push ---                                             
                                    //alert("Su Taxi está listo para recibir Mensajes");


                                    navigator.notification.confirm(
                                        'Su Taxi está listo para recibir Mensajes!',  // message
                                        onConfirm,         // callback
                                        'Aviso',            // title
                                        ['Ok']                  // buttonName
                                    );
                                    navigator.notification.beep(1);
                                }else{
                                    alert("Hubo algún problema, vuelva a ingresar..." + DatoRecibido.Resultado);
                                }                            
                            })
                        .fail(function() 
                            {
                                alert('Hubo un problema con la comunicación. Ingrese nuevamente!');                            
                            });                    
                }else{
                    alert("No ha recibido el código de comunicación. Inicie de nuevo la app.");
                }
        };

function onConfirm(buttonIndex) {
    //alert('You selected button ' + buttonIndex);
};

//Evita el cierre accidental de la Application
function onBackKeyDown() {// Handle the back button
    //alert("Placa: " + Placa);
    navigator.notification.confirm(
            '¿ Seguro que desea cerrar la aplicación ?',  // message
            function( index ){
                if( index == 1 ){//look at the docs for this part                    
                    setTimeout(function(){
                        ChangeStatus(Placa, "Inactivo");
                    }, 2000)
                    navigator.app.exitApp();
                }
            },                  // callback to invoke with index of button pressed
            'Salir',            // title
            'Si,No'             // buttonLabels
        );
}


/////////////////////////////////////////////////////////////////
///////////// LLAMA POR TELEFONO AL TELEFONO DEL TAXISTA /////
/////////////////////////////////////////////////////////////////
function LlamarPorTelefono(){ 
    var telefonoCliente=localStorage.getItem("TelefonoCliente");
    //alert("Telefono recibido:" + telefonoCliente);
    try{
        if (telefonoCliente=='') 
            {
                NotificaToast("Cliente no informó su Nro de Teléfono");
            }else{                                
                window.plugins.CallNumber.callNumber(onSuccessLlamadoTelefonico, onErrorLlamadoTelefonico, telefonoCliente);      
            }
    }catch(e){
        showMsg('modal-alerts','Aviso', 'No puede llamar desde esta plataforma','info');
    }
};

function onSuccessLlamadoTelefonico(){  };

function onErrorLlamadoTelefonico(){ 
    alert("No se pudo concretar el llamado."); 
};

function LlamarPorTelefono105(){ 
    try
    {
        window.plugins.CallNumber.callNumber(onSuccessLlamadoTelefonico, onErrorLlamadoTelefonico, '105');
    }catch(e){
        showMsg('modal-alerts','Aviso', 'No puede llamar desde esta plataforma','info');
    }
};


function fnBackGround(){
    // Android customization
    cordova.plugins.backgroundMode.setDefaults({ 
            title:  'App de chofer está activa',
            text:   'Esperando mensajes de central.',
            ticker: 'App de chofer está activa',
            resume: true,
            silent: false 
        });
    // Enable background mode
    cordova.plugins.backgroundMode.enable();

    // Called when background mode has been activated
    cordova.plugins.backgroundMode.onactivate = function () {
        setTimeout(function () {
            // Modify the currently displayed notification
            cordova.plugins.backgroundMode.configure({
                text:'En background.'
            });
        }, 5000);
    } 
};