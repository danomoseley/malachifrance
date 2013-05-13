var body;
var scroller;
var wizard;
var screens = {};
var navWidth = 50;

var currentScreen = 1;
var currentImage = 1;
var maxScreen = 2;
var maxImage = 0;

var clouds = new Array();
var numClouds = 5;
var cloudSpeed = 5;

var slideShow;

var gallery = new Array();
var opts = {};
var vars;
var subvars;


var lastHash="";



(function($) {
  $.picasa = {
    albums: function(user, callback) {
      var url = "http://picasaweb.google.com/data/feed/base/user/danomoseley/albumid/5589863552729701425?alt=json&kind=photo&hl=en_US&fields=entry(title,gphoto:numphotos,media:group(media:content,media:thumbnail))"
      url = url.replace(/:user_id/, user);
      $.getJSON(url, function(data) {
        var album = null;
        var albums = [];
        $.each(data.feed.entry, function(i, element) {
          album = {
            id: element.id["$t"].split("?")[0].split("albumid/")[1],
            title: element["media$group"]["media$title"]["$t"],
            description: element["media$group"]["media$description"]["$t"],
            thumb: element["media$group"]["media$content"][0]["url"],
          }
          album.images = function(callback) {
            $.picasa.images(user, album.id, callback);
          }
          albums.push(album);
        });
        callback(albums);
      });
    },

    images: function(user, album, callback) {
	  
      var url = "http://picasaweb.google.com/data/feed/base/user/:user_id/albumid/:album_id?alt=json&kind=photo&hl=en_US&fields=entry(title,gphoto:numphotos,media:group(media:content,media:thumbnail))";
      url = url.replace(/:user_id/, user).replace(/:album_id/, album);
      var image = null;
      var images = [];
	  
	  
	  if ($.browser.msie && window.XDomainRequest) {
			// Use Microsoft XDR
			var xdr = new XDomainRequest();
			xdr.open("get", url);
			xdr.onload = function () {
			var JSON = $.parseJSON(xdr.responseText);
			if (JSON == null || typeof (JSON) == 'undefined')
			{
				JSON = $.parseJSON(data.firstChild.textContent);
			}
			$.each(JSON.feed.entry, function(i, element) {
				  image = element["media$group"]["media$content"][0];
				  image.title = element.title["$t"];
				  image.thumbs = [];
				  $.each(element["media$group"]["media$thumbnail"], function(j, j_element) {
					image.thumbs.push(j_element);
				  });
				  images.push(image);
				});
				callback(images);
			};
			xdr.send();
		} else {
			  $.getJSON(url, function(data) {	
				$.each(data.feed.entry, function(i, element) {
				  image = element["media$group"]["media$content"][0];
				  image.title = element.title["$t"];
				  image.thumbs = [];
				  $.each(element["media$group"]["media$thumbnail"], function(j, j_element) {
					image.thumbs.push(j_element);
				  });
				  images.push(image);
				});
				callback(images);
			  });
		}
	  
	  
      
    }
  };

  $.fn.picasaAlbums = function(user, callback) {
    $.picasa.albums(user, function(images) {
      if (callback) {
        callback(images);
      }
    });
  };

  $.fn.picasaGallery = function(user, album, callback) {
    var scope = $(this);
    $.picasa.images(user, album, function(images) {
      if (callback) {
        callback.apply(scope, images);
      } else {
        var picasaAlbum = "<ul class='picasa-album'>\n";
        $.each(images, function(i, element) {
          picasaAlbum += "  <li class='picasa-image'>\n";
          picasaAlbum += "    <a class='picasa-image-large' href='" + element.url + "'>\n";
          picasaAlbum += "      <img class='picasa-image-thumb' src='" + element.thumbs[1].url + "'/>\n";
          picasaAlbum += "    </a>\n";
          picasaAlbum += "  </li>\n";
        });
        picasaAlbum += "</ul>";
        scope.append(picasaAlbum);
      }
    });
  }
})(jQuery);


Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}



$(document).ready(function(){
	var TimezoneOffset = -4  // adjust for time zone EST
  var localTime = new Date()
  var ms = localTime.getTime() 
             + (localTime.getTimezoneOffset() * 60000)
             + TimezoneOffset * 3600000
  var time =  new Date(ms) 
	if(time.getHours()>21){
		$("body").addClass("starry");
	}else{
		$("body").addClass("daytime");
	}
	
	$("body").css("font-size",.011*document.body.clientHeight + "pt");
	$("#photos").css("font-size",.008*document.body.clientHeight + "pt");
	
	document.title="It's A Boy!";
	var vars = window.location.hash.split("&");
	lastHash = window.location.hash;
	var i=0;
	$.each(vars,function(k,v){
		var subvars = v.split("=");
		if(i==0){
			opts["target"] = subvars[0];
		}else{			
			opts[subvars[0]] = subvars[1];
		}
		i++;
	});
	


	body = $("<div>").attr("id","mainContainer");;
	$("body").append(body);
	var d = new Date();
	$("body").append($("<div>").attr("id","footer").html("&copy;" +d.getFullYear()+" The <a href='http://www.savannahwolf.com'>Wolf</a> <a href='http://www.danomoseley.com'>Pack</a>"));
	scroller = $("<div>").attr("id","scroller");
	wizard = $("<div>").attr("id","wizard");
	
	screens["pool"] = {};
	screens["pool"].dom = $("<div>").addClass("screen").append($("<div>").addClass("content").addClass("pool"));
	screens["pool"].numid = 0;
	screens["main"] = {};
	screens["main"].dom = $("<div>").addClass("screen").append($("<div>").addClass("content").append($("<div>").addClass("container")));
	screens["main"].numid = 1;
	screens["photos"] = {};
	screens["photos"].dom = $("<div>").addClass("screen").append($("<div>").addClass("content").addClass("gallery"));
	screens["photos"].numid = 2;
	
	
	$.each(screens,function(screenName,screen){
		screen.dom.attr("id",screenName);
		wizard.append(screen.dom);
	});
	
	$.simpleWeather({
        zipcode: '12303',
        unit: 'f',
        success: function(weather) {
            makeWeather(weather.currently);
        }
    });
	
	scroller.append(wizard);
	body.append($("<div>").attr("id","sky"));
	body.append(scroller);
	
	
	screens["main"].dom.attr("id","main");
	
	makeSideNav(navWidth);
	
	$(".scrollLeft").click(scrollLeft);
	$(".scrollRight").click(scrollRight);
	
	makeWeather();
	var photos = $("<div>").addClass("frame").append(
						$("<div>").addClass("photo").append(
							$("<div>").addClass("image").append("<img>"),
							$("<h1>").addClass("title"),
							$("<div>").addClass("overlay")
						),
						$("<div>").addClass("photo").attr("id","leftImage").append(
							$("<div>").addClass("image").append("<img>"),
							$("<h1>").addClass("title"),
							$("<div>").addClass("overlay")
						),
						$("<div>").addClass("photo").attr("id","rightImage").append(
							$("<div>").addClass("image").append("<img>"),
							$("<h1>").addClass("title"),
							$("<div>").addClass("overlay")
						)
					);
	
	$("#photos .gallery").append($("<h1>").html("Pictures of Malachi"));
	$("#photos .gallery").append(photos);
	
	var mainNav = $("<div>").append(
										$("<img>").attr("src","img/pool-lt.png").addClass("babyPool-lt").addClass("navButton").click(function(){window.location.hash="poolView";document.title="And The Winner Is..";scrollLeft();}),
										$("<img>").attr("src","img/photos-rt.png").addClass("photos-rt").addClass("navButton").css("z-index","10").click(function(){window.location.hash="photoView";document.title="Photo Gallery";scrollRight();})).addClass("mainNav").addClass("nav");
	$("#main .content").append(mainNav);
	
	var poolNav = $("<div>").append(
										$("<img>").attr("src","img/photos-lt.png").addClass("photos-lt").addClass("navButton").click(function(){window.location.hash="photoView";document.title="Photo Gallery";scrollLeft();}),
										$("<img>").attr("src","img/home-rt.png").addClass("backHome-rt").addClass("navButton").css("z-index","10").click(function(){window.location.hash="";document.title="It's A Boy!";scrollRight();})).addClass("poolNav").addClass("nav");
	$("#pool .content").append(
		$("<h1>").html("Who Won The Baby Pool!?"),
		$("<div>").html("Alice and Justin!").css("font-family","Ballw").css("font-size","6em").css("color","#003E50").css("margin-top","1em"),
		$("<div>").html("They guessed that<br/>Malachi would be born on:").css("font-family","BPreplay").css("color","#1E260F").css("font-size","4em"),
		$("<div>").html("March 28th, 2011<br/> 8.5lbs &bull; 21 inches").css("font-family","BPreplay").css("color","#397387").css("font-size","4em"),
		poolNav,
		$("<div>").addClass("footer"),
		$("<img>").addClass("stork2").attr("src","img/stork2.png")
	);	
	$("#main .content").append($("<img>").attr("src","img/stork.png").addClass("stork"));
	$("#main .content").append($("<img>").attr("src","img/plane.png").addClass("plane"));
	$("#main .content").append($("<img>").attr("src","img/Car.png").addClass("car"));
	
	$("#main .content").prepend($("<h1>").html("Congratulations Maria & Steve!").css("text-align","center"));
	var galleryNav = $("<div>").addClass("galleryNav").addClass("nav").append(
										$("<img>").attr("src","img/home-lt.png").addClass("backHome-lt").addClass("navButton").click(function(){window.location.hash="";document.title="It's A Boy!";scrollLeft();}),
										$("<img>").attr("src","img/pool-rt.png").addClass("babyPool-rt").addClass("navButton").click(function(){window.location.hash="poolView";document.title="And The Winner Is..";scrollRight();}));
	$("#photos .gallery").append(galleryNav);
	$("#photos .gallery").append($("<img>").addClass("leftArrow").attr("src","img/LeftArrow.png"),$("<img>").addClass("rightArrow").attr("src","img/RightArrow.png"));
	$("#photos .gallery").append($("<img>").attr("src","img/boat.png").addClass("boat"));
	$("#photos .gallery").append($("<img>").attr("src","img/towtruck.png").addClass("towTruck"));
	
	
	$.picasa.images("danomoseley", "5589863552729701425", function(images) {
		
	  maxImage = images.length;

	  for(var i=images.length-1;i>=0;i--){
		gallery.push(images[i]);
	  }
	  if(opts["target"] == "#photoView" && opts["id"] && opts["id"]>0 && opts["id"]<maxImage){
		setGallery(opts["id"]);
	  }else{
		setGallery(0);
	  }
	});
	
	$("#leftImage").click(galleryLeft);
	$("#rightImage").click(galleryRight);
	$(".rightArrow").click(galleryRight);
	$(".leftArrow").click(galleryLeft);
	
	
	$("body").css("font-size",.011*document.body.clientHeight + "pt");
	$("#main .content .container").html("<span style='font-family:Ballw;font-size:7em;color:#493D09;'>It's A Boy!</span><hr style='margin-top:2%;margin-bottom:2%;'/><span style='line-height: 2em;font-family:BPreplay;font-size:3em;color:#706339;'>Malachi France was born on <br/>March 28th, 2011 at 11:20pm</span><hr style='margin-top:2%;margin-bottom:2%;'/><span style='font-family:BPreplay;font-size:3em;color:#045157;'>9lbs 5.4oz &bull; 21 inches</span>");
	
	$("#main .content").css("margin-top",(document.body.clientHeight-parseInt($("#main .content").height()))/2+"px");
	$("#pool .content").css("margin-top",(document.body.clientHeight-parseInt($("#pool .content").height()))/2+"px");	
	$("#photos .content").css("margin-top",((document.body.clientHeight-(parseInt($("#photos .content").height())+parseInt($(".galleryNav").outerHeight(true))+parseInt($(".navButton").height())))/2)+"px");
	
	$(window).resize(function(){
		$("body").css("font-size",.011*document.body.clientHeight + "pt");		
		$("#main .content").css("margin-top",(document.body.clientHeight-parseInt($("#main .content").height())-parseInt($(".navButton").height()))/2+"px");
		
		$.each($(".frame .image > img"),function(k,v){
			ImageResize2($(this));
		});
	});
	
	if(opts["target"]=="#photoView"){
		document.title="Photo Gallery";
		currentScreen = 2;
		scrollTo(screens["photos"]);
	}
	
	if(opts["target"]=="#poolView"){
		document.title="And The Winner Is..";
		currentScreen = 0;
		scrollTo(screens["pool"]);
	}
	
	
});

function ImageResize(main){
	var proportions = $(this).width()/$(this).height();
	if(proportions>1){
		$(this).parent().parent().width("100%");
		//$(this).parent().parent().css("height",$(this).parent().width()/proportions);
		$(this).parent().parent().css("margin-top",($(this).parent().parent().parent().height()-$(this).parent().parent().height())/2);
		if($(this).parent().parent().is(":first-child")){
			$(this).parent().parent().width("100%");
		}else{
			$(this).parent().parent().width("50%");
		}
	}else{
		$(this).parent().parent().width($(this).height()*proportions);
		$(this).parent().parent().css("height","100%");
		$(this).parent().parent().css("margin-top",0);
	}
}

function ImageResize2(img){
	var proportions = $(this).width()/$(this).height();
	if(proportions>1){
		$(this).parent().parent().width("100%");
		$(this).parent().parent().css("height",$(this).parent().width()/proportions);
		$(this).parent().parent().css("margin-top",($(this).parent().parent().parent().height()-$(this).parent().parent().height())/2);
		if($(this).parent().parent().is(":first-child")){
			$(this).parent().parent().width("100%");
		}else{
			$(this).parent().parent().width("50%");
		}
	}else{
		$(this).parent().parent().width($(this).height()*proportions);
		$(this).parent().parent().css("height","100%");
		$(this).parent().parent().css("margin-top",0);
	}
	$("#pool .content").css("margin-top",(document.body.clientHeight-parseInt($("#pool .content").height()))/2+"px");
		$("#main .content").css("margin-top",(document.body.clientHeight-parseInt($("#main .content").height()))/2+"px");
		$("#pool .content").css("margin-top",(document.body.clientHeight-parseInt($("#pool .content").height()))/2+"px");	
		$("#photos .content").css("margin-top",((document.body.clientHeight-(parseInt($("#photos .content").height())+parseInt($(".galleryNav").outerHeight(true))+parseInt($(".navButton").height())))/2)+"px");
}

function setGallery(id){
	id = parseInt(id);
	currentImage = id;
	if(id==0){
		$(".frame .photo:nth-child(2)").css("display","none");
		$(".leftArrow").css("display","none");
		$(".frame .photo:first-Child img").attr("src",gallery[id].url).load(ImageResize);
		$(".frame .photo:nth-child(3) img").attr("src",gallery[id+1].url).load(ImageResize);
	}else if(id==maxImage-1){
		$(".frame .photo:nth-child(3)").css("display","none");    
		$(".rightArrow").css("display","none");
		$(".frame .photo:first-Child img").attr("src",gallery[id].url).load(ImageResize);
		$(".frame .photo:nth-child(2) img").attr("src",gallery[id-1].url).load(ImageResize);
	}else{
		$(".frame .photo:nth-child(2)").css("display","block");
		$(".frame .photo:nth-child(3)").css("display","block");
		$(".leftArrow").css("display","block");
		$(".rightArrow").css("display","block");
		$(".frame .photo:nth-child(2) img").attr("src",gallery[id-1].url).load(ImageResize);    
		$(".frame .photo:first-Child img").attr("src",gallery[id].url).load(ImageResize);
		$(".frame .photo:nth-child(3) img").attr("src",gallery[id+1].url).load(ImageResize);
	}
	var regex1 =  new RegExp("(.*?)\.(jpg|jpeg|png|gif)$","i"); 
	if(!gallery[id].title.match(regex1)){
		$(".frame .photo:first-Child .title").html(gallery[id].title);
	}else{
		$(".frame .photo:first-Child .title").html("");
	}
}

function startSlideShow(){
	slideShow = setInterval ( "galleryRight()", 3000 );
	$(this).replaceWith($("<span>").html("Stop Slideshow").click(endSlideShow));
}

function endSlideShow(){
	clearInterval (slideShow);
	$(this).replaceWith($("<span>").html("Start Slideshow").click(startSlideShow));
}


function makeWeather(currently){
	//if(currently == "Mostly Cloudy"){ numClouds*=20;}
	$("#sky").html("");clouds = [];
	for(i=0;i<numClouds;i++){
		var cloud = $("<div>").addClass("cloud");
		
		var cloudType = parseInt(Math.random()*2);
		if(cloudType==0){
			cloud.addClass("big");
		}
		if(cloudType==1){
			cloud.addClass("little");
		}
		
		cloud.css("top",Math.random()*(getViewPortHeight()-parseInt(cloud.css("height")))+"px");
		cloud.css("left",Math.random()*(getViewPortWidth()-parseInt(cloud.css("width")))+"px");
		$("#sky").append(cloud);
		clouds.push(cloud);
		generateWind(clouds[i]);
	}
}

function getViewPortWidth(){
	var myWidth = 0;
	if( typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
		myWidth = window.innerWidth;
	} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		//IE 6+ in 'standards compliant mode'
		myWidth = document.documentElement.clientWidth;
	} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		//IE 4 compatible
		myWidth = document.body.clientWidth;
	}
	return myWidth;
}

function getViewPortHeight(){
	var myWidth = 0, myHeight = 0;
	if( typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
		myWidth = window.innerWidth;
		myHeight = window.innerHeight;
	} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		//IE 6+ in 'standards compliant mode'
		myWidth = document.documentElement.clientWidth;
		myHeight = document.documentElement.clientHeight;
	} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		//IE 4 compatible
		myWidth = document.body.clientWidth;
		myHeight = document.body.clientHeight;
	}
	return myHeight;
}

function generateWind(cloud){
	var newX = Math.random()*(getViewPortWidth()-cloud.width());
	var dX = Math.abs(parseInt(cloud.css("left"))-newX);
	var dT = dX/cloudSpeed;
	
	//if (navigator.appName == 'Microsoft Internet Explorer' || navigator.appName == "Netscape"){
	//	
	//	cloud.animate({left:newX+"px"},dT*1000);
	//}else{
		cloud.css("-webkit-transition","all "+dT+"s ease-in-out");
		cloud.css("left",newX+"px");		
	//}
	var delay = function() { generateWind(cloud); };
	setTimeout(delay,dT* 1000)
}

function makeSideNav(width){
	$(".scrollNav").css("width",width+"px");
	$("#scrollLeft").css("margin-right",-1*width+"px");
	$("#scrollRight").css("margin-left",-1*width+"px");
}

function galleryRight(){
	if(currentImage<maxImage-1){
		currentImage++;
		window.location.hash = "photoView&id="+currentImage;
		setGallery(currentImage);
	}
}

function galleryLeft(){
	if(currentImage>0){
		currentImage--;
		window.location.hash = "photoView&id="+currentImage;
		setGallery(currentImage);
	}
}

function scrollRight(){
	if(currentScreen<maxScreen){
		currentScreen++;
		//if (navigator.appName == 'Microsoft Internet Explorer' || navigator.appName == "Netscape"){
			wizard.animate({"margin-left":currentScreen*-100+"%"},1000);
		//}else{
		//	wizard.css("margin-left",currentScreen*-100+"%");
		//}
	}else if(currentScreen==maxScreen){
		currentScreen--;
		wizard.css("-webkit-transition","none");
		wizard.css("margin-left",(currentScreen)*-100+"%");
		$("#wizard .screen:last-child").after($("#wizard .screen:first-child"));
		scrollRight();
	}
}

function scrollLeft(){
	if(currentScreen>0){
		currentScreen--;
		//if (navigator.appName == 'Microsoft Internet Explorer' || navigator.appName == "Netscape"){
			wizard.animate({"margin-left":currentScreen*-100+"%"},1000);
		//}else{
		//	wizard.css("margin-left",currentScreen*-100+"%");
		//}
	}else if(currentScreen==0){
		currentScreen++;
		wizard.css("-webkit-transition","none");
		wizard.css("margin-left",(currentScreen)*-100+"%");
		$("#wizard .screen:first-child").before($("#wizard .screen:last-child"));
		scrollLeft();
	}
}

function scrollTo(screen){
	wizard.css("margin-left",screen.numid*-100+"%");
}
