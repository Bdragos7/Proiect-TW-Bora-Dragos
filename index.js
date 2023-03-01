const express= require("express");
const fs =require("fs");
const sharp = require("sharp");
const {Client} = require("pg");
const ejs = require("ejs");
// const sass = require("sass");
// var cssBootStrap=sass.compile(__dirname+"/resurse/scss/customizare_bootstrap.scss",{sourceMap:true})
// fs.writeFileSync(__dirname+"resurse/css/customizare_bootstrap.css",cssBootstrap.css);

const path= require('path');
const formidable=require("formidable");
// const request=require("request");
const {Utilizator}=require("./module_proprii/utilizator.js")

const AccesBD=require("./module_proprii/accesbd.js")
const session=require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");
const xmljs=require('xml-js');
// var client = new Client({database:"proiect_tw",
//     user:"dragos",
//     password:"dragos",
//     host:"localhost",
//     port:5432});
// client.connect();

var instantaBD=AccesBD.getInstanta({init:"local"});
var client=instantaBD.getClient();





app=express();

app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
  }));

  app.use("/*",function(req,res,next){
    res.locals.Drepturi=Drepturi;
    if (req.session.utilizator){
        req.utilizator=res.locals.utilizator=new Utilizator(req.session.utilizator);
    }    

    next();
});

app.set("view engine","ejs");  

app.use("/resurse", express.static(__dirname+"/resurse"));

app.get(["/","/index","/home","/login"], function(req, res){
    //console.log("ceva");
   
    res.render("pagini/index", {ip: req.ip, imagini: obGlobal.imagini});
})


// client.query("select * from unnest(enum_range(null::tipuri_vacante))", function( err, rez){
//     if(err)
//         console.log(err);
//     else
//         console.log(rez);
// });

// app.get("/produse", function(req, res){
//     //console.log("ceva");
//     client.query("select * from bd_vacante", function(err,rez){
//         if(err){
//             console.log(err)
//             renderError(res,2);
//         }
//         else
//             res.render("pagini/produse", {produse:rez.row, optiuni:[]});
//     });
// })

app.get("/produse",function(req, res){
    client.query("select * from vacante", function(err, rezCateg){
        continuareQuery=""
        if (req.query.tip)
            continuareQuery+=` and tip_vacanta='${req.query.tip}'`; //"tip='"+req.query.tip+"'"

        console.log("saal")
        console.log(rezCateg.rows)

        var options = [];
        for (let data of rezCateg.rows) {
            options.push(data.tip_vacanta)
        }

        console.log(options)
        client.query("select * from vacante where 1=1 " + continuareQuery , function( err, rez){
            if(err){
                console.log(err);
                renderError(res, 2);
            }
            else
                res.render("pagini/produse", {produse:rez.rows, optiuni: options});
        });
    });
    console.log(100)
});

app.get("/produs/:id",function(req, res){
    console.log(req.params);
    
    client.query("select * from vacante where id="+req.params.id, function( err, rez){
        if(err){
            console.log(err);
            renderError(res, 2);
        }
        else
            res.render("pagini/produs", {prod:rez.rows[0]});
    });
});

obGlobal={
    erori:null,
    imagini:[]
 
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


app.post("/inregistrare",function(req, res){
    var username;
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){//4
        console.log("Inregistrare:",campuriText);

        console.log(campuriFisier);
        var eroare="";

        var utilizNou=new Utilizator();
        try{
            utilizNou.setareNume=campuriText.nume;
            utilizNou.setareUsername=campuriText.username;
            utilizNou.email=campuriText.email
            utilizNou.prenume=campuriText.prenume
            
            utilizNou.parola=campuriText.parola;
            utilizNou.culoare_chat=campuriText.culoare_chat;
            if (campuriFisier.poza)
                utilizNou.poza= campuriFisier.poza.originalFilename;
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function(u, parametru ,eroareUser ){
                if (eroareUser==-1){//nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                }
                else{
                    eroare+="Mai exista username-ul";
                }

                if(!eroare){
                    res.render("pagini/inregistrare", {raspuns:"Inregistrare cu succes!"})
                    
                }
                else
                    res.render("pagini/inregistrare", {err: "Eroare: "+eroare});
            })
            

        }
        catch(e){ 
            console.log(e.message);
            eroare+= "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pagini/inregistrare", {err: "Eroare: "+eroare})
        }
    



    });
    formular.on("field", function(nume,val){  // 1 
	
        console.log(`--- ${nume}=${val}`);
		
        if(nume=="username")
            username=val;
    }) 
    formular.on("fileBegin", function(nume,fisier){ //2
        console.log("fileBegin");
		
        console.log(nume,fisier);
		//TO DO in folderul poze_uploadate facem folder cu numele utilizatorului
        let folderUser=path.join(__dirname, "poze_uploadate",username);
        //folderUser=__dirname+"/poze_uploadate/"+username
        console.log(folderUser);
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        fisier.filepath=path.join(folderUser, fisier.originalFilename)
        //fisier.filepath=folderUser+"/"+fisier.originalFilename

    })    
    formular.on("file", function(nume,fisier){//3
        console.log("file");
        console.log(nume,fisier);
    }); 
});

app.post("/login",function(req, res){
    var username;
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.on("field", function(nume,val){  // 1 
	
        console.log(`--- ${nume}=${val}`);
    })
    formular.parse(req, function(err, campuriText, campuriFisier ){
        console.log("/login");
        console.log(err);
        
        Utilizator.getUtilizDupaUsername (campuriText.username,{
            req:req,
            res:res,
            parola:campuriText.parola
        }, function(u, obparam ){
            let parolaCriptata=Utilizator.criptareParola(obparam.parola);
            console.log(u.parola);
            console.log(parolaCriptata);
            console.log(u.confirmat_mail);
            if(u.parola==parolaCriptata && u.confirmat_mail ){
                u.poza=u.poza?path.join("poze_uploadate",u.username, u.poza):"";
                obparam.req.session.utilizator=u;
                console.log("login reusit");
                obparam.req.session.succesLogin="Bravo! Te-ai logat!";
                obparam.res.redirect("/index");
                //obparam.res.render("/login");
            }
            else{
                obparam.req.session.succesLogin="Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/index");
            }
        })
    });
});


app.post("/profil", function(req, res){
    console.log("profil");
    if (!req.session.utilizator){
        randeazaEroare(res,403,)
        res.render("pagini/eroare_generala",{text:"Nu sunteti logat."});
        return;
    }
    var formular= new formidable.IncomingForm();
 
    formular.parse(req,function(err, campuriText, campuriFile){
       
        var parolaCriptata=Utilizator.criptareParola(campuriText.parola);
        // AccesBD.getInstanta().update(
        //     {tabel:"utilizatori",
        //     campuri:["nume","prenume","email","culoare_chat"],
        //     valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
        //     conditiiAnd:[`parola='${parolaCriptata}'`]
        // },  
        AccesBD.getInstanta().updateParametrizat(
            {tabel:"utilizatori",
            campuri:["nume","prenume","email","culoare_chat"],
            valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
            conditiiAnd:[`parola='${parolaCriptata}'`]
        },          
        function(err, rez){
            if(err){
                console.log(err);
                randeazaEroare(res,2);
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount==0){
                res.render("pagini/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }
            else{            
                //actualizare sesiune
                console.log("ceva");
                req.session.utilizator.nume= campuriText.nume;
                req.session.utilizator.prenume= campuriText.prenume;
                req.session.utilizator.email= campuriText.email;
                req.session.utilizator.culoare_chat= campuriText.culoare_chat;
                res.locals.utilizator=req.session.utilizator;
            }
 
 
            res.render("pagini/profil",{mesaj:"Update-ul s-a realizat cu succes."});
 
        });
       
 
    });
});


/******************Administrare utilizatori */
app.get("/useri", function(req, res){
   
    if(req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)){
        AccesBD.getInstanta().select({tabel:"utilizatori", campuri:["*"]}, function(err, rezQuery){
            console.log(err);
            res.render("pagini/useri", {useri: rezQuery.rows});
        });
    }
    else{
        renderError(res, 403);
    }
});


app.post("/sterge_utiliz", function(req, res){
    if(req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)){
        var formular= new formidable.IncomingForm();
 
        formular.parse(req,function(err, campuriText, campuriFile){
           
                AccesBD.getInstanta().delete({tabel:"utilizatori", conditiiAnd:[`id=${campuriText.id_utiliz}`]}, function(err, rezQuery){
                console.log(err);
                res.redirect("/useri");
            });
        });
    }else{
        renderError(res,403);
    }
})


app.get("/logout", function(req, res){
    req.session.destroy();
    res.locals.utilizator=null;
    res.render("pagini/logout");
});


//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}
app.get("/cod/:username/:token",function(req,res){
    console.log(req.params);
    try {
        Utilizator.getUtilizDupaUsername(req.params.username,{res:res,token:req.params.token} ,function(u,obparam){
            AccesBD.getInstanta().update(
                {tabel:"utilizatori",
                campuri:['confirmat_mail'],
                valori:['true'], 
                conditiiAnd:[`cod='${obparam.token}'`]}, 
                function (err, rezUpdate){
                    if(err || rezUpdate.rowCount==0){
                        console.log("Cod:", err);
                        renderError(res,3);
                    }
                    else{
                        console.log(rezUpdate.rowCount);
                        res.render("pagini/confirmare.ejs");
                    }
                })
        })
    }
    catch (e){
        console.log(e);
        renderError(res,2);
    }
})

caleXMLMesaje="resurse/xml/contact.xml";
headerXML=`<?xml version="1.0" encoding="utf-8"?>`;
function creeazaXMlContactDacaNuExista(){
    if (!fs.existsSync(caleXMLMesaje)){
        let initXML={
            "declaration":{
                "attributes":{
                    "version": "1.0",
                    "encoding": "utf-8"
                }
            },
            "elements": [
                {
                    "type": "element",
                    "name":"contact",
                    "elements": [
                        {
                            "type": "element",
                            "name":"mesaje",
                            "elements":[]                            
                        }
                    ]
                }
            ]
        }
        let sirXml=xmljs.js2xml(initXML,{compact:false, spaces:4});//obtin sirul xml (cu taguri)
        console.log(sirXml);
        fs.writeFileSync(caleXMLMesaje,sirXml);
        return false; //l-a creat
    }
    return true; //nu l-a creat acum
}


function parseazaMesaje(){
    let existaInainte=creeazaXMlContactDacaNuExista();
    let mesajeXml=[];
    let obJson;
    if (existaInainte){
        let sirXML=fs.readFileSync(caleXMLMesaje, 'utf8');
        obJson=xmljs.xml2js(sirXML,{compact:false, spaces:4});
        

        let elementMesaje=obJson.elements[0].elements.find(function(el){
                return el.name=="mesaje"
            });
        let vectElementeMesaj=elementMesaje.elements?elementMesaje.elements:[];// conditie ? val_true: val_false
        console.log("Mesaje: ",obJson.elements[0].elements.find(function(el){
            return el.name=="mesaje"
        }))
        let mesajeXml=vectElementeMesaj.filter(function(el){return el.name=="mesaj"});
        return [obJson, elementMesaje,mesajeXml];
    }
    return [obJson,[],[]];
}


app.get("/contact", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] =parseazaMesaje();

    res.render("pagini/contact",{ utilizator:req.session.utilizator, mesaje:mesajeXml})
});

app.post("/contact", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] =parseazaMesaje();
        
    let u= req.session.utilizator?req.session.utilizator.username:"anonim";
    let mesajNou={
        type:"element", 
        name:"mesaj", 
        attributes:{
            username:u, 
            data:new Date()
        },
        elements:[{type:"text", "text":req.body.mesaj}]
    };
    if(elementMesaje.elements)
        elementMesaje.elements.push(mesajNou);
    else 
        elementMesaje.elements=[mesajNou];
    console.log(elementMesaje.elements);
    let sirXml=xmljs.js2xml(obJson,{compact:false, spaces:4});
    console.log("XML: ",sirXml);
    fs.writeFileSync("resurse/xml/contact.xml",sirXml);
    
    res.render("pagini/contact",{ utilizator:req.session.utilizator, mesaje:elementMesaje.elements})
});
///////////////////////////////////////////////////////




// app.get("*/galerie-animata.css",function(req, res){

//     var sirScss=fs.readFileSync(__dirname+"/resurse/scss/galerie_animata.scss").toString("utf8");
//     var culori=["navy","black","purple","grey"];
//     var indiceAleator=Math.floor(Math.random()*culori.length);
//     var culoareAleatoare=culori[indiceAleator]; 
//     rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});
//     console.log(rezScss);
//     var caleScss=__dirname+"/temp/galerie_animata.scss"
//     fs.writeFileSync(caleScss,rezScss);
//     try {
//         rezCompilare=sass.compile(caleScss,{sourceMap:true});
        
//         var caleCss=__dirname+"/temp/galerie_animata.css";
//         fs.writeFileSync(caleCss,rezCompilare.css);
//         res.setHeader("Content-Type","text/css");
//         res.sendFile(caleCss);
//     }
//     catch (err){
//         console.log(err);
//         res.send("Eroare");
//     }
// });

// app.get("*/galerie-animata.css.map",function(req, res){
//     res.sendFile(path.join(__dirname,"temp/galerie-animata.css.map"));
// });



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






app.listen(8081)
console.log("srv a pronit")