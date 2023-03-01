function setCookie(nume, val,  timpExp){//timp expirare in milisecunde
    d=new Date()
    d.setTime(d.getTime())
    document.cookie = `${nume}=${val}; expires=${d.toUTCString()}`;

}

function getCookie(nume){
    vectorParametri=document.cookie.split(";")
    
    for (let param of vectorParametri){
        if(param.trim().startsWith(nume+"="))
            return param.split("=")[1]
    }

}

function deleteCookie(nume){
    document.cookie=`${nume}=0 ; expires=${(new Date()).toUTCString()}`;
}

window.addEventListener("load", function(){
    
    if(getCookie("acceptat_banner")){
        this.document.getElementById("banner").style.display="none";
    }


    this.document.getElementById("ok-cookies").onclick=function(){
        setCookie("acceptat_banner",true, 60000);
    }
})