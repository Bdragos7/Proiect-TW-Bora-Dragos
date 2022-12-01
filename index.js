const express= require("express");
const fs =require("fs");
const sharp = require("sharp");
// const {Client} = require("pg");
// const ejs = require("ejs");
// const sass = require("sass");


// var client = new Client({database:"",
//     user:"",
//     password:"",
//     host:"",
//     port:5432
// });
// client.connect();

app=express();

app.set("view engine","ejs");  

app.use("/resurse", express.static(__dirname+"/resurse"));

app.get(["/","/index","/home"], function(req, res){
    //console.log("ceva");
    res.render("pagini/index", {ip: req.ip, imagini: obGlobal.imagini});
})

obGlobal={
    erori:null,
    imagini:null
 
}



function createImages(){

    var continutFisier = fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf-8");
    var obiect = JSON.parse(continutFisier);
    var dim_mediu = 300;
    var dim_mic = 150;


     obGlobal.imagini = obiect.imagini;

     obGlobal.imagini.forEach(function(elem){
        [numeFisier, extensie] = elem.cale_fisier.split(".")
        if(!fs.existsSync(obiect.cale_galerie+"/mediu/")){
            fs.mkdirSync(obiect.cale_galerie+"/mediu/")
        }
        if(!fs.existsSync(obiect.cale_galerie+"/mic/")){
            fs.mkdirSync(obiect.cale_galerie+"/mic/")
        }
        elem.cale_fisier_mediu = obiect.cale_galerie+"/mediu/"+numeFisier+".webp"
        elem.cale_fisier_mic = obiect.cale_galerie+"/mic/"+numeFisier+".webp"
        elem.cale_fisier = obiect.cale_galerie+"/"+elem.cale_fisier;
        sharp(__dirname+"/"+elem.cale_fisier).resize(dim_mediu).toFile(__dirname+"/"+elem.cale_fisier_mediu);
        sharp(__dirname+"/"+elem.cale_fisier).resize(dim_mic).toFile(__dirname+"/"+elem.cale_fisier_mic);
    })
    
     console.log(obGlobal.imagini);


}

createImages();




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



app.get("*/galerie-animata.css",function(req, res){

    var sirScss=fs.readFileSync(__dirname+"/resurse/scss/galerie_animata.scss").toString("utf8");
    var culori=["navy","black","purple","grey"];
    var indiceAleator=Math.floor(Math.random()*culori.length);
    var culoareAleatoare=culori[indiceAleator]; 
    rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});
    console.log(rezScss);
    var caleScss=__dirname+"/temp/galerie_animata.scss"
    fs.writeFileSync(caleScss,rezScss);
    try {
        rezCompilare=sass.compile(caleScss,{sourceMap:true});
        
        var caleCss=__dirname+"/temp/galerie_animata.css";
        fs.writeFileSync(caleCss,rezCompilare.css);
        res.setHeader("Content-Type","text/css");
        res.sendFile(caleCss);
    }
    catch (err){
        console.log(err);
        res.send("Eroare");
    }
});

app.get("*/galerie-animata.css.map",function(req, res){
    res.sendFile(path.join(__dirname,"temp/galerie-animata.css.map"));
});



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