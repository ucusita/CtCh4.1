//type: success,info, alert, warning
function showMsg(id,title,text,type){
  //$('#modal-alerts').modal('show');
  
  $('#alert_content').html('<div class="alert alert-'+type+'" role="alert">'+text+"</div>");
  $('#alert_title').html(title);
  $('#'+id).modal('show');
  
  }
