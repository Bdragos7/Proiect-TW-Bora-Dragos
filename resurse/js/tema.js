window.addEventListener("DOMContentLoaded",function(){

    temaCurenta=localStorage.getItem("tema")
    if(temaCurenta)
        document.body.classList.add(temaCurenta);


    document.getElementById("tema").onclick=function(){
        if (document.body.classList.contains("dark")){
            document.body.classList.remove("dark");
            localStorage.removeItem("tema");
        }
        else{
            if (document.body.classList.contains("craciun")){
                document.body.classList.remove("craciun");
                localStorage.removeItem("tema");
            }
            document.body.classList.add("dark");
            localStorage.setItem("tema","dark");
            
        }
        
        
    
    }
    document.getElementById("tema-cra").onclick=function(){

        if (document.body.classList.contains("dark")){
            document.body.classList.remove("dark");
            localStorage.removeItem("tema");
        }
        else{
            document.body.classList.add("craciun");
            localStorage.setItem("tema","craciun");
            
        }
    
    }
});