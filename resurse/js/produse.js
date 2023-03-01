window.addEventListener("load",function(){
    x=100
    document.getElementById("filtrare").onclick=function(){
        var inpNume=document.getElementById("inp-nume").value.toLowerCase().trim();
        var inpCategorie=document.getElementById("inp-categorie").value;

        var produse=document.getElementsByClassName("produs");

        for (let produs of produse){
            var cond1=false, cond2=false, cond3 = false, cond4 = false;
            produs.style.display="none";

            // filter by name
            let nume= produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();
            if(nume.includes(inpNume)){
                cond1=true;
            }

            // filter by category ( tip_vacanta )
            let categorie = produs.getElementsByClassName("val-tip-vc")[0].innerHTML;
            if(categorie == inpCategorie || inpCategorie == "toate"){
                cond2=true;
            }

            // filter by flight duration
            let duration_inp = document.querySelector('input[name="gr_rad"]:checked').value;
            let duration_product = produs.getElementsByClassName("val-durata")[0].innerHTML;
            interval_values = duration_inp.split(":");
            if (interval_values.length > 1) {
                if (parseInt(interval_values[0]) <= parseInt(duration_product) && parseInt(duration_product) < parseInt(interval_values[1])) {
                    cond3 = true;
                }
            }
            else {
                cond3 = true;
            }


            // filter by exotic or not (boolean)
            //selectez dupa id si verific daca e bifat
            let inpExotic = document.querySelector('#inp-exotic:checked').value;
            let inpExotic2 = document.querySelector('#inp-exotic-toate:checked').value; 
            let tipExotic = produs.getElementsByClassName("val-exotic")[0].innerHTML;
            if(inpExotic.toString() == tipExotic || inpExotic2.toString()!=tipExotic) {
                cond4 = true;
            }

            // // filter by price
            // let pret_vac=document.getElementById("inp-pret").value
            // let pret = produs.getElementsByClassName("val-pret")[0].innerHTML
            // document.getElementById("inp-pret").onchange=function(){
            // // console.log(this.value);
            // document.getElementById("infoRange").innerHTML=`(${this.value})`
            // }
            // if (pret_vac == pret ){
            //     cond5 = true;
            // }

            //filter by bilete la oferta ramase
            let inpBilete = document.getElementById("inp-bilete").value;
            let valBilete = produs.getElementsByClassName("val-bilete")[0].innerHTML;
            if (inpBilete <= valBilete) {
                cond6 = true;
            }

            // filter by description
            let inpDesc = document.getElementById("inp-descriere").value;
            let valDesc = produs.getElementsByClassName("descriere")[0].innerHTML
            if (valDesc.includes(inpDesc)) {
                cond7 = true;
            }

            // filter by menius
            // var checked = document.querySelectorAll('#inp-menus :checked');
            // var inpMenu = [...checked].map(option => option.value);
            
            // let valMenu = produs.getElementsByClassName("val-meniu")[0].innerHTML;
            
            // if (inpMenu[0] == 'toate' && inpMenu.length() == 1) {
            //     cond8 = true;
            // }
            // else {
            //     cond8 = true;
            //     for (let ing of inpMenu) {
            //         if (!(valMenu.includes(ing))) {
            //             cond8 = false;
            //         }
            //     }
            // }

            if(cond1 && cond2 && cond3 && cond6 && cond7){
                produs.style.display="block";
            }
        }
    }
   
    document.getElementById("resetare").onclick=function(){
        //resteare produse
        var produse=document.getElementsByClassName("produs");
        for (let produs of produse){
            produs.style.display="block";
        }
        //resetare filtre
        document.getElementById("inp-nume").value="";
        document.getElementById("sel-toate").selected=true;

    }

    function sorteaza(semn){
        var produse=document.getElementsByClassName("produs");
        var v_produse=Array.from(produse);


        v_produse.sort(function(a,b){
            var pret_a=parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            var pret_b=parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if(pret_a==pret_b){
                var nume_a=a.getElementsByClassName("val-nume")[0].innerHTML;
                var nume_b=b.getElementsByClassName("val-nume")[0].innerHTML;
                return semn*nume_a.localeCompare(nume_b);
            }
            return (pret_a-pret_b)*semn;
        })
        for (let produs of v_produse){
            produs.parentNode.appendChild(produs);
        }       
    }

    document.getElementById("sortCrescNume").onclick=function(){
        sorteaza(1);
    }
    document.getElementById("sortDescrescNume").onclick=function(){
        sorteaza(-1);
    }

});