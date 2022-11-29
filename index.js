const express= require("express");
const fs =require("fs");
app=express();

app.set("view engine","ejs");  

app.use("/resurse", express.static(__dirname+"/resurse"));

app.get(["/","/index","/home"], function(req, res){
    //console.log("ceva");
    res.render("pagini/index");
})

obGlobal={
    erori:null
}

function createErrors(){

    var continutFisier = fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf-8");
    obGlobal.erori = JSON.parse(continutFisier);
}

createErrors();



function renderError(res, identificator, titlu, text, imagine){


    var eroare = obGlobal.erori.info_erori.find(function(elem){
        return elem.identificator == identificator;
    })

    titlu = titlu || (eroare && eroare.titlu) || obGlobal.erori.eroare_default.titlu;
    text = text || (eroare && eroare.text) || obGlobal.erori.eroare_default.text;
    imagine= imagine || (eroare && obGlobal.erori.cale_baza+"/"+eroare.imagine) || obGlobal.erori.cale_baza+"/"+obGlobal.erori.eroare_default.imagine;

    if(eroare && eroare.status){
        res.status(identificator).render("pagini/eroare",{titlu:titlu, text:text, imagine:imagine})
    }
    else{
        res.render("pagini/eroare",{titlu:titlu, text:text, imagine:imagine});
  
    }
}

app.get("/*.ejs", function(req, res){

    renderError(res,403);

})

app.get("/*", function(req, res){
    console.log("url:",req.url);
    res.render("pagini"+req.url, function(err, rezRandare){
        
        if(err){
            if(err.message.includes("Failed to lookup view")){
                renderError(res,404);
            }
            
            else{
                
            }
        }
        else{
            res.send(rezRandare);
        }
    });
})


console.log("hello world");

app.listen(8080)
console.log("srv a pronit")