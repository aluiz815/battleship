var preloaded = [];
function imagePreload() {
  var i,ids = [1,2,3,4,5,6,7,8,9,10,100,101,102,103,201,202,203,204,205,206];
  window.status = "Pré-carregando imagens ... aguarde";
  for (i=0;i<ids.length;++i) {
  var img = new Image, name = "assets/batt"+ids[i]+".gif";
  img.src = name;
  preloaded[i] = img;
  }
  window.status = "";
  }
imagePreload();