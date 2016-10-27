//////////////////////////////////////////////////////////////////////
//    Version 1.0.3
//////////////////////////////////////////////////////////////////////
var PayPerUse;    //Agregado para config remota

var vip;
var saldo;
var cpc;
var empresa;

var bounds;
var markers = [];
var marker;
var popup;
var tempo;

var map;
var mapOptions;
var historial;

var iconPOV;

var DatoRecibido;
      $(document).ready(function(){   

      $.supersized({
            //slides  :   [ {image : 'assets/img/taxif.jpg', title : ''} ]
            slides  :   [ {image : 'assets/img/fondologin.png', title : ''} ]
          });
      //Recupera preferencias
      try {
            $('#dni').val(window.localStorage.getItem("A"));
            $('#unidad').val(window.localStorage.getItem("B"));
            $('#password').val(window.localStorage.getItem("C"));

      }catch(error){};

      //Verifica si existe la variable CheckVIP para PayperUser (VIP Coin)
      //para actualizar el campo del form a enviar
      // if(typeof(PayPerUse) != "undefined")
      //       { 
      //             //alert("si existe"); //
      //             console.log("Existe PayPerUse");
      //             $('#CheckVIP').val('Si');
      //       }else{ 
      //             //alert("No existe PayPerUse"); 
      //             console.log("No existe PayPerUse");
      //             $('#CheckVIP').val('No');
      //             //var PayPerUse='No';
      //       }

      // LOGIN AL SISTEMA	
      	$("#frmLogin").submit(function(){

                  //Funcion recordarme
                  if ($('#recordar').is(':checked')) {
                        window.localStorage.setItem("A",$('#dni').val());
                        window.localStorage.setItem("B",$('#unidad').val());
                        window.localStorage.setItem("C",$('#password').val());
                  };
				      		
      		$("#ajax-loader2").show(); 
                  //alert("Placa antes de salir: " + $("#frmLogin").serialize());
      		$.post(urllocal + 'tools/Tx_Login.php', $("#frmLogin").serialize(), 
      			function(data){												
      						DatoRecibido = JSON.parse(data);
                                          console.log("Dato recibido:" + DatoRecibido);
                                          vip=DatoRecibido.vip;
                                          saldo = DatoRecibido.saldo;
                                          cpc = DatoRecibido.cpc;
                                          empresa=DatoRecibido.Empresa;
                                          //Agregado para remote configuracion
                                          PayPerUse=DatoRecibido.PayPerUse;
                                          $('#CheckVIP').val('PayPerUse');

      						if (DatoRecibido.Resultado=="Acceso permitido")
      						{
                                                // Si se debe controlar El PayPerUse 
                                                //if ( ($('#CheckVIP').val()) =='Si' && DatoRecibido.vip=='No') {       //Cambiado por la linea siguiente
                                                if ( PayPerUse =='Si' && DatoRecibido.vip=='No') {
                                                      console.log("La empresa usa PayPerUse (PayPerUse=Si)");
                                                      //Controlar si el chofer es VIP
                                                      //if (DatoRecibido.vip=='No') {
                                                            //Obtener los parametros necesarios y 
                                                            console.log("El chofer no pertenece a la empresa (vip=No)");                                                            
                                                            //alert("Saldo / cpc:" + saldo + " / " + cpc);
                                                            //Verificar las condiciones, si el chofer tiene saldo suficiente
                                                            if (Number(saldo) >= Number(cpc)) {
                                                                  //El chofer tiene saldo a favor
                                                                  //Habilitar botón continuar
                                                                  $('#btnContinuar').attr('disabled', false);
                                                                  $('#btnPOV_Continuar').attr('disabled', false);
                                                            }else{
                                                                  //Habilitar botón continuar
                                                                  $('#btnContinuar').attr('disabled', true);
                                                                  $('#btnPOV_Continuar').attr('disabled', true);
                                                            };
                                                                                                                              //Mostrar pantalla de VIP COIN porque el chofer no tiene saldo a favor
                                                            $("#login-form").hide();
                                                            
                                                            //Asigna valores informativos
                                                            $('#lblPlaca').text( $('input#unidad').val() );
                                                            $('#lblChofer').text( $('input#dni').val() );
                                                            $('#lblEmpresa').text(DatoRecibido.Empresa);
                                                            $('#lblSaldo').text(DatoRecibido.saldo);
                                                            var carreras = parseInt(DatoRecibido.saldo / DatoRecibido.cpc) ;
                                                            if (carreras<0) {carreras=0};
                                                            $('#lblCarreras').text(carreras);
                                                            $('#lblCPC').text(DatoRecibido.cpc);

                                                            $('#scnVerCredito').show();

                                                      //};
                                                }else{
                                                      //console.log("PayPerUse=" + $('#CheckVIP').val() + " y el chofer pertenece a la empresa (vip=Si)");
                                                      console.log("PayPerUse=" + PayPerUse + " y el chofer pertenece a la empresa (vip=Si)");
                                                      //Sigue normalmente como hasta ahora para las versiones viejas
                                                      //alert(urllocal + 'driver/scrEstado.php' + '?dni=' + $('input#dni').val() + '&placa=' + $('input#unidad').val() + '?empresa=' + DatoRecibido.Empresa);
                                                      window.open('driver/tviptx.html' +
                                                            '?dni=' + $('input#dni').val() + 
                                                            '&placa=' + $('input#unidad').val() +
                                                            '&empresa=' + DatoRecibido.Empresa +
                                                            '&PayPerUse=' + 'No' +  
                                                            '&vip=' + 'Si' + 
                                                            '&saldo=' + '0' + 
                                                            '&cpc=' + '0' , "_self");
                                                };
      						}
      						else
      						{
      							alert("Acceso no autorizado...");
      						}
      						$("#ajax-loader2").hide();			
      					})
      				.fail(function() 
      					{
      						alert('No ha podido ingresar, verifique sus datos');
      						$("#ajax-loader2").hide();			
      					})
      		return false;
      	});
      
      // OLVIDE LA CONTRASEÑA
      	$("#frmForget").submit(function(){				
      		$("#ajax-loader-forget").show();
      		$("#form-content-forget").hide();
      		$("#alert-email-not-found").hide();
      		
      		$.post(urllocal + 'tools/Tx_Forget.php', $("#frmForget").serialize(), 
      			function(data){						
      						$("#ajax-loader-forget").hide();
      						$("#form-content-forget").show();
      						//$('#response').html(data);
      						DatoRecibido=JSON.parse(data);
      						if (DatoRecibido.Resultado == 0)
      						{
      							alert("Ese email no pertenece a un conductor registrado");
      						}
      						else {
      						alert("Se le ha enviado un email con su contraseña");	
      						}
      					})
      				.fail(function() 
      					{
      						$("#ajax-loader-forget").hide();
      						$("#form-content-forget").show();		
      						alert("Hubo un error, inténtelo nuevamente")
      					})
      		return false;
      	});
      
      //////////////////////////////////////////////
      ///////  FORMULARIO DE REGISTRO  ////////////
      ////////////////////////////////////////////
      	$("#frmRegistro").submit( function(){		
      		$("#ajax-loader-register").show();
      		$("#form-content-register").hide();
      		$("#register_msg").hide();
         	 	$.post(urllocal + 'tools/Tx_Register.php', $("#frmRegistro").serialize(), 
      			function(data){
      				//$('#response').html(data);
      				$("#ajax-loader-register").hide();
      				$("#form-content-register").show();			
      				//alert("Ok");
      				DatoRecibido=JSON.parse(data);
      						if (DatoRecibido.Resultado == "Registro Ok")
      						{
      							$('#registro-modal').modal('hide');
                    alert(DatoRecibido.Resultado);
      						}
      						else {
      						alert("Error:" + DatoRecibido.Resultado);	
      						}
      				})
      			.fail(function()
      				{
      					alert("Hubo un problema");
      					$("#ajax-loader-register").hide();
      					$("#form-content-register").show();
      				});
      		return false;
      	});	
      
      });


function ContinuarConCredito()
      {
            window.open('driver/tviptx.html' +
                  '?dni=' + $('input#dni').val() + 
                  '&placa=' + $('input#unidad').val() +
                  '&empresa=' + empresa + 
                  '&PayPerUse=' + PayPerUse +  
                  '&vip=' + vip + 
                  '&saldo=' + saldo + 
                  '&cpc=' + cpc , "_self");
      }

function VerPOVs()
      {
            window.open('http://vipcoin.from-ar.com/POVview.html?empresa=' + empresa , '_blank');
      }

function TerminarApp()
      {
            navigator.app.exitApp();
      }