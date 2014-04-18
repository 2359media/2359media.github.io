function isPad() {
  var foundiPad = navigator.userAgent.indexOf("iPad") != -1;
  return foundiPad;
}

if (isPad()) {
  var videos = document.getElementsByTagName('video');
  for (var i = videos.length - 1; i >= 0; i--) {
    videos[i].controls = true;
    videos[i].setAttribute("width", "100%")
  };
}
